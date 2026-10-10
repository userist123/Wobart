'use client'

/**
 * WOB ART — holographic particle story (GPGPU).
 * Positions and velocities of every particle live in float textures and are advanced on the GPU each frame
 * (GPUComputationRenderer, ping-pong). Each particle is attracted to its slot in the current target formation
 * and carried by a curl-noise flow field, so shapes dissolve and re-form like a fluid instead of sliding.
 * Formations (sampled once on the CPU into float textures): 0 energy ring · 1 car (sampled from the real model)
 * · 2 layers lifting off · 3 film as a ribbon of light · 4 car re-formed · 5 finish galaxy.
 * Scroll progress arrives through a ref from the parent; bloom flares mid-transition.
 */
import { Suspense, useEffect, useMemo, useRef, type MutableRefObject } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import { Bloom, EffectComposer } from '@react-three/postprocessing'
import * as THREE from 'three'
import { GPUComputationRenderer, type Variable } from 'three/examples/jsm/misc/GPUComputationRenderer.js'
import { MeshSurfaceSampler } from 'three/examples/jsm/math/MeshSurfaceSampler.js'

const MODEL_URL = '/models/wob-car.glb'
export const FORMATIONS = 6
const CAR_LENGTH = 5.4

type Props = { progress: MutableRefObject<number>; pointer: MutableRefObject<{ x: number; y: number }>; size: number }

// ── simplex noise + curl (Ashima / Stefan Gustavson, MIT) ─────────────────────────────
const NOISE = /* glsl */ `
vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x,289.0);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159-0.85373472095314*r;}
float snoise(vec3 v){
  const vec2 C=vec2(1.0/6.0,1.0/3.0);const vec4 D=vec4(0.0,0.5,1.0,2.0);
  vec3 i=floor(v+dot(v,C.yyy));vec3 x0=v-i+dot(i,C.xxx);
  vec3 g=step(x0.yzx,x0.xyz);vec3 l=1.0-g;vec3 i1=min(g.xyz,l.zxy);vec3 i2=max(g.xyz,l.zxy);
  vec3 x1=x0-i1+C.xxx;vec3 x2=x0-i2+2.0*C.xxx;vec3 x3=x0-1.0+3.0*C.xxx;
  i=mod(i,289.0);
  vec4 p=permute(permute(permute(i.z+vec4(0.0,i1.z,i2.z,1.0))+i.y+vec4(0.0,i1.y,i2.y,1.0))+i.x+vec4(0.0,i1.x,i2.x,1.0));
  float n_=1.0/7.0;vec3 ns=n_*D.wyz-D.xzx;
  vec4 j=p-49.0*floor(p*ns.z*ns.z);vec4 x_=floor(j*ns.z);vec4 y_=floor(j-7.0*x_);
  vec4 x=x_*ns.x+ns.yyyy;vec4 y=y_*ns.x+ns.yyyy;vec4 h=1.0-abs(x)-abs(y);
  vec4 b0=vec4(x.xy,y.xy);vec4 b1=vec4(x.zw,y.zw);
  vec4 s0=floor(b0)*2.0+1.0;vec4 s1=floor(b1)*2.0+1.0;vec4 sh=-step(h,vec4(0.0));
  vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy;vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;
  vec3 p0=vec3(a0.xy,h.x);vec3 p1=vec3(a0.zw,h.y);vec3 p2=vec3(a1.xy,h.z);vec3 p3=vec3(a1.zw,h.w);
  vec4 norm=taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));
  p0*=norm.x;p1*=norm.y;p2*=norm.z;p3*=norm.w;
  vec4 m=max(0.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.0);m=m*m;
  return 42.0*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));
}
vec3 snoiseVec3(vec3 x){return vec3(snoise(x),snoise(vec3(x.y-19.1,x.z+33.4,x.x+47.2)),snoise(vec3(x.z+74.2,x.x-124.5,x.y+99.4)));}
vec3 curlNoise(vec3 p){
  const float e=0.1;vec3 dx=vec3(e,0.0,0.0);vec3 dy=vec3(0.0,e,0.0);vec3 dz=vec3(0.0,0.0,e);
  vec3 px0=snoiseVec3(p-dx);vec3 px1=snoiseVec3(p+dx);vec3 py0=snoiseVec3(p-dy);vec3 py1=snoiseVec3(p+dy);
  vec3 pz0=snoiseVec3(p-dz);vec3 pz1=snoiseVec3(p+dz);
  float x=py1.z-py0.z-pz1.y+pz0.y;float y=pz1.x-pz0.x-px1.z+px0.z;float z=px1.y-px0.y-py1.x+py0.x;
  return normalize(vec3(x,y,z)/(2.0*e));
}
`

const VELOCITY = /* glsl */ `
uniform float uTime;
uniform float uDelta;
uniform float uLocal;
uniform float uAttract;
uniform float uTurb;
uniform sampler2D uTargetA;
uniform sampler2D uTargetB;
${NOISE}
void main(){
  vec2 uv = gl_FragCoord.xy / resolution.xy;
  vec4 p = texture2D(texturePosition, uv);
  vec4 v = texture2D(textureVelocity, uv);
  float rnd = p.w;
  float t = clamp((uLocal - rnd * 0.4) / 0.6, 0.0, 1.0);
  t = t * t * (3.0 - 2.0 * t);
  vec3 target = mix(texture2D(uTargetA, uv).xyz, texture2D(uTargetB, uv).xyz, t);
  float travel = sin(t * 3.14159265);
  vec3 toTarget = target - p.xyz;
  // spring towards the slot + fluid flow that grows while the particle is travelling
  vec3 force = toTarget * uAttract * (0.35 + 0.65 * (1.0 - travel));
  force += curlNoise(p.xyz * 0.32 + vec3(0.0, uTime * 0.07, 0.0)) * (uTurb + travel * 3.4);
  v.xyz = v.xyz * 0.9 + force * uDelta;
  gl_FragColor = vec4(v.xyz, 1.0);
}
`

const POSITION = /* glsl */ `
uniform float uDelta;
void main(){
  vec2 uv = gl_FragCoord.xy / resolution.xy;
  vec4 p = texture2D(texturePosition, uv);
  vec3 v = texture2D(textureVelocity, uv).xyz;
  gl_FragColor = vec4(p.xyz + v * uDelta, p.w);
}
`

const RENDER_VERTEX = /* glsl */ `
uniform sampler2D uPos;
uniform sampler2D uVel;
uniform float uSize;
uniform float uPixelRatio;
attribute vec2 aRef;
varying float vSpeed;
varying float vRand;
varying float vY;
void main(){
  vec4 p = texture2D(uPos, aRef);
  vec3 v = texture2D(uVel, aRef).xyz;
  vec4 mv = modelViewMatrix * vec4(p.xyz, 1.0);
  gl_Position = projectionMatrix * mv;
  gl_PointSize = uSize * uPixelRatio * (0.45 + p.w * 0.85) / -mv.z;
  vSpeed = length(v);
  vRand = p.w;
  vY = p.y;
}
`

const RENDER_FRAGMENT = /* glsl */ `
uniform vec3 uColA;
uniform vec3 uColB;
uniform float uTime;
varying float vSpeed;
varying float vRand;
varying float vY;
void main(){
  vec2 c = gl_PointCoord - 0.5;
  float d = length(c);
  if (d > 0.5) discard;
  float core = smoothstep(0.5, 0.0, d);
  vec3 col = mix(uColA, uColB, smoothstep(0.1, 0.95, vRand));
  // fast particles burn white-cyan, like sparks in a stream
  col = mix(col, vec3(0.75, 1.0, 1.0), clamp(vSpeed * 0.09, 0.0, 0.75));
  // holographic scan band
  float band = 1.0 - smoothstep(0.0, 0.06, abs(fract(vY * 0.2 - uTime * 0.1) - 0.5));
  col += band * 0.45;
  gl_FragColor = vec4(col, core * (0.5 + 0.5 * vRand));
}
`

function floatAttr(geom: THREE.BufferGeometry, name: string) {
  const src = geom.getAttribute(name) as THREE.BufferAttribute | undefined
  if (!src) return
  const out = new Float32Array(src.count * 3)
  for (let i = 0; i < src.count; i++) { out[i * 3] = src.getX(i); out[i * 3 + 1] = src.getY(i); out[i * 3 + 2] = src.itemSize > 2 ? src.getZ(i) : 0 }
  geom.setAttribute(name, new THREE.BufferAttribute(out, 3))
}

function triangleArea(geom: THREE.BufferGeometry) {
  const pos = geom.getAttribute('position'); const idx = geom.getIndex()
  const a = new THREE.Vector3(), b = new THREE.Vector3(), c = new THREE.Vector3(); const tri = new THREE.Triangle()
  let area = 0; const n = idx ? idx.count : pos.count
  for (let i = 0; i + 2 < n; i += 3) {
    a.fromBufferAttribute(pos, idx ? idx.getX(i) : i); b.fromBufferAttribute(pos, idx ? idx.getX(i + 1) : i + 1); c.fromBufferAttribute(pos, idx ? idx.getX(i + 2) : i + 2)
    tri.set(a, b, c); area += tri.getArea()
  }
  return area
}

/** Points on the car surface (world space, centred, long axis on X) plus normals. */
function sampleCar(scene: THREE.Object3D, count: number) {
  const root = scene.clone(true)
  const size = new THREE.Box3().setFromObject(root, true).getSize(new THREE.Vector3())
  const holder = new THREE.Group(); holder.add(root)
  if (size.z > size.x) root.rotation.y = Math.PI / 2
  holder.updateMatrixWorld(true)
  const fitted = new THREE.Box3().setFromObject(holder, true)
  const scale = CAR_LENGTH / Math.max(fitted.getSize(new THREE.Vector3()).x, 0.001)
  const centre = fitted.getCenter(new THREE.Vector3())
  holder.scale.setScalar(scale)
  holder.position.set(-centre.x * scale, -centre.y * scale - 0.2, -centre.z * scale)
  holder.updateMatrixWorld(true)
  const parts: { geom: THREE.BufferGeometry; area: number }[] = []
  holder.traverse((o) => {
    if (!(o instanceof THREE.Mesh)) return
    const g = (o.geometry as THREE.BufferGeometry).clone()
    floatAttr(g, 'position')
    if (g.getAttribute('normal')) floatAttr(g, 'normal'); else g.computeVertexNormals()
    for (const k of Object.keys(g.attributes)) if (k !== 'position' && k !== 'normal') g.deleteAttribute(k)
    g.applyMatrix4(o.matrixWorld)
    const area = triangleArea(g)
    if (area > 1e-5) parts.push({ geom: g, area }); else g.dispose()
  })
  const total = parts.reduce((s, p) => s + p.area, 0)
  const pos = new Float32Array(count * 3); const nor = new Float32Array(count * 3)
  const p = new THREE.Vector3(), n = new THREE.Vector3()
  let k = 0
  parts.forEach((part, i) => {
    const want = i === parts.length - 1 ? count - k : Math.round((part.area / total) * count)
    const sampler = new MeshSurfaceSampler(new THREE.Mesh(part.geom)).build()
    for (let j = 0; j < want && k < count; j++, k++) { sampler.sample(p, n); pos.set([p.x, p.y, p.z], k * 3); nor.set([n.x, n.y, n.z], k * 3) }
    part.geom.dispose()
  })
  return { pos, nor }
}

/** Six formations as RGBA float arrays (xyz = slot, w = per-particle random). */
function buildFormations(scene: THREE.Object3D, count: number) {
  const rand = new Float32Array(count).map(() => Math.random())
  const make = () => new Float32Array(count * 4)
  const ring = make(), car = make(), exploded = make(), wave = make(), galaxy = make()
  const { pos, nor } = sampleCar(scene, count)
  const side = Math.ceil(Math.sqrt(count * 3))
  for (let i = 0; i < count; i++) {
    const r = rand[i], o = i * 4
    // 0 energy ring facing the camera, thick noisy halo like a plasma loop
    const a = Math.random() * Math.PI * 2
    const tube = 0.12 + Math.pow(Math.random(), 4) * 1.1
    const ta = Math.random() * Math.PI * 2
    const R = 3.4 + Math.sin(a * 5 + 0.7) * 0.12 + Math.sin(a * 11) * 0.06
    ring.set([(R + Math.cos(ta) * tube) * Math.cos(a), (R + Math.cos(ta) * tube) * Math.sin(a), Math.sin(ta) * tube * 0.5, r], o)
    // 1 car
    car.set([pos[i * 3], pos[i * 3 + 1], pos[i * 3 + 2], r], o)
    // 2 layers lift off: paint stays, film floats above, coating floats further
    const layer = r < 0.45 ? 0 : r < 0.8 ? 1 : 2
    const off = [0, 0.6, 1.35][layer]
    exploded.set([pos[i * 3] + nor[i * 3] * off, pos[i * 3 + 1] + nor[i * 3 + 1] * off + layer * 0.45, pos[i * 3 + 2] + nor[i * 3 + 2] * off, r], o)
    // 3 film as a ribbon of light
    const gx = (i % side) / side, gz = Math.floor(i / side) / Math.ceil(count / side)
    const x = (gx - 0.5) * 17, z = (gz - 0.5) * 4.5
    wave.set([x, Math.sin(x * 0.5) * 1.0 + Math.sin(x * 1.2 + z * 1.4) * 0.22 - 0.5, z - 0.6, r], o)
    // 5 galaxy: logarithmic spiral with a dense core
    const rad = Math.pow(Math.random(), 1.7) * 5.6
    const ang = rad * 1.2 + ((i % 4) * Math.PI) / 2 + (Math.random() - 0.5) * 0.6
    galaxy.set([Math.cos(ang) * rad, (Math.random() - 0.5) * 0.3 * (1.4 - rad / 5.6), Math.sin(ang) * rad, r], o)
  }
  return [ring, car, exploded, wave, car, galaxy]
}

// horizontal bias per formation: +1 = text on the left, so the particles move right
const SIDE = [0, 1, -1, 1, -1, 0]

function Particles({ progress, pointer, size }: Props) {
  const { scene } = useGLTF(MODEL_URL, false, true)
  const gl = useThree((s) => s.gl)
  const count = size * size

  const sim = useMemo(() => {
    const formations = buildFormations(scene, count)
    const textures = formations.map((f) => { const t = new THREE.DataTexture(f, size, size, THREE.RGBAFormat, THREE.FloatType); t.needsUpdate = true; return t })
    const gpu = new GPUComputationRenderer(size, size, gl)
    if (/iPhone|iPad|Android/i.test(navigator.userAgent)) gpu.setDataType(THREE.HalfFloatType)
    const pos0 = gpu.createTexture(); (pos0.image.data as Float32Array).set(formations[0])
    const vel0 = gpu.createTexture()
    const posVar: Variable = gpu.addVariable('texturePosition', POSITION, pos0)
    const velVar: Variable = gpu.addVariable('textureVelocity', VELOCITY, vel0)
    gpu.setVariableDependencies(posVar, [posVar, velVar])
    gpu.setVariableDependencies(velVar, [posVar, velVar])
    posVar.material.uniforms.uDelta = { value: 1 / 60 }
    Object.assign(velVar.material.uniforms, {
      uTime: { value: 0 }, uDelta: { value: 1 / 60 }, uLocal: { value: 0 }, uAttract: { value: 9 }, uTurb: { value: 0.25 },
      uTargetA: { value: textures[0] }, uTargetB: { value: textures[1] },
    })
    const error = gpu.init()
    if (error) console.error('GPGPU init failed:', error)
    const geometry = new THREE.BufferGeometry()
    const ref = new Float32Array(count * 2)
    for (let i = 0; i < count; i++) { ref[i * 2] = ((i % size) + 0.5) / size; ref[i * 2 + 1] = (Math.floor(i / size) + 0.5) / size }
    geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(count * 3), 3))
    geometry.setAttribute('aRef', new THREE.BufferAttribute(ref, 2))
    geometry.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 20)
    const material = new THREE.ShaderMaterial({
      vertexShader: RENDER_VERTEX, fragmentShader: RENDER_FRAGMENT, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
      uniforms: {
        uPos: { value: null }, uVel: { value: null }, uTime: { value: 0 }, uSize: { value: 24 },
        uPixelRatio: { value: Math.min(gl.getPixelRatio(), 2) },
        uColA: { value: new THREE.Color('#00d8ff') }, uColB: { value: new THREE.Color('#7b3dff') },
      },
    })
    return { gpu, posVar, velVar, textures, geometry, material }
  }, [scene, gl, size, count])

  useEffect(() => () => { sim.gpu.dispose(); sim.textures.forEach((t) => t.dispose()); sim.geometry.dispose(); sim.material.dispose() }, [sim])

  const simRef = useRef(sim)
  useEffect(() => { simRef.current = sim }, [sim])
  const groupRef = useRef<THREE.Group>(null)
  const morph = useRef(0)
  const segment = useRef(-1)

  useFrame((state, delta) => {
    const s = simRef.current
    const g = groupRef.current
    if (!g) return
    const dt = Math.min(delta, 1 / 30)
    const target = progress.current * (FORMATIONS - 1)
    morph.current += (target - morph.current) * (1 - Math.exp(-3.5 * dt))
    const m = Math.min(FORMATIONS - 1 - 1e-4, Math.max(0, morph.current))
    const i0 = Math.floor(m)
    if (i0 !== segment.current) {
      segment.current = i0
      s.velVar.material.uniforms.uTargetA.value = s.textures[i0]
      s.velVar.material.uniforms.uTargetB.value = s.textures[Math.min(i0 + 1, FORMATIONS - 1)]
    }
    const vu = s.velVar.material.uniforms
    vu.uLocal.value = m - i0
    vu.uTime.value = state.clock.elapsedTime
    vu.uDelta.value = dt
    s.posVar.material.uniforms.uDelta.value = dt
    s.gpu.compute()
    const mu = s.material.uniforms
    mu.uPos.value = s.gpu.getCurrentRenderTarget(s.posVar).texture
    mu.uVel.value = s.gpu.getCurrentRenderTarget(s.velVar).texture
    mu.uTime.value = state.clock.elapsedTime
    // car chapters turn slowly; galaxy tilts towards the viewer; pointer parallax everywhere
    const carWeight = Math.max(0, 1 - Math.abs(m - 1.5) / 1.7) + Math.max(0, 1 - Math.abs(m - 4) / 0.9)
    g.rotation.y = (state.clock.elapsedTime * 0.1 - 0.55) * carWeight + pointer.current.x * 0.22
    g.rotation.x = (m > 4.1 ? (m - 4.1) * 0.62 : 0) + pointer.current.y * 0.1
    // side chapters: push the formation away from the text column (desktop only; mobile text sits below)
    const k = m - i0
    const side = SIDE[i0] * (1 - k) + SIDE[Math.min(i0 + 1, FORMATIONS - 1)] * k
    const shift = state.viewport.aspect > 1.1 ? side * state.viewport.width * 0.17 : 0
    g.position.x += (shift - g.position.x) * (1 - Math.exp(-4 * dt))
  })

  return (
    <group ref={groupRef}>
      <points geometry={sim.geometry} material={sim.material} frustumCulled={false} />
    </group>
  )
}

useGLTF.preload(MODEL_URL, false, true)

export default function ParticleStory(props: Props) {
  return (
    <Canvas dpr={[1, 2]} camera={{ position: [0, 0.4, 11], fov: 42 }} gl={{ antialias: false, powerPreference: 'high-performance', alpha: true }} style={{ background: 'transparent' }} aria-hidden="true">
      <Suspense fallback={null}>
        <Particles {...props} />
        <EffectComposer multisampling={0} enableNormalPass={false}>
          <Bloom intensity={1.2} luminanceThreshold={0.06} luminanceSmoothing={0.35} mipmapBlur />
        </EffectComposer>
      </Suspense>
    </Canvas>
  )
}
