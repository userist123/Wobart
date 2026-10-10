'use client'

/**
 * Scroll-driven car story (Terminal Industries style): a photoreal car under studio light; a scan plane sweeps
 * along its length and turns it into a glowing X-ray wireframe hologram (edges + fresnel shell), then back.
 * The camera flies between keyframes per chapter. Real and hologram passes share one model and are split by
 * two opposite clipping planes that follow the scan position, so the cut is exact on every mesh.
 */
import { Suspense, useEffect, useMemo, useRef, type MutableRefObject } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { ContactShadows, Environment, Lightformer, useGLTF } from '@react-three/drei'
import { Bloom, EffectComposer, Vignette } from '@react-three/postprocessing'
import * as THREE from 'three'

type Props = { progress: MutableRefObject<number>; pointer: MutableRefObject<{ x: number; y: number }> }

const MODEL_URL = '/models/wob-car.glb'
const HDR_URL = '/hdri/studio_small_09_1k.hdr'
const PAINT_NAME = /^(Wrap|Paint )/
const LENGTH = 4.5
const HALF = LENGTH / 2 + 0.15
export const CAR_CHAPTERS = 6

/** Camera keyframe per chapter: position, look-at target. */
const KEYS: { pos: [number, number, number]; target: [number, number, number] }[] = [
  { pos: [0.2, 1.05, 9.6], target: [0, 1.55, 0] }, // side profile, car low under the headline
  { pos: [5.6, 1.5, 6.2], target: [0, 0.6, 0] }, // 3/4 front while the scan passes
  { pos: [-5.4, 2.9, 5.0], target: [0, 0.55, 0] }, // high rear 3/4 on the hologram layers
  { pos: [4.9, 0.85, 5.6], target: [0, 0.55, 0] }, // low side, finishes change
  { pos: [-3.9, 0.6, 4.1], target: [-1.1, 0.55, 0] }, // close on the front corner
  { pos: [0.01, 9.2, 6.4], target: [0, 1.9, 0] }, // aerial, hologram over the grid
]
/** +1: chapter text on the left, so the car is framed right; -1 the opposite. */
const SIDE = [0, 1, -1, 1, -1, 0]

/** Paint finishes cycled in the Material chapter: gloss, satin, matte, colour-shift. */
const FINISHES = [
  { color: '#0b0d12', roughness: 0.08, clearcoat: 1, metalness: 0.6, iridescence: 0 },
  { color: '#3a4250', roughness: 0.38, clearcoat: 0.4, metalness: 0.5, iridescence: 0 },
  { color: '#1a1c20', roughness: 0.82, clearcoat: 0, metalness: 0.15, iridescence: 0 },
  { color: '#2a1d5c', roughness: 0.18, clearcoat: 1, metalness: 0.75, iridescence: 1 },
].map((f) => ({ ...f, c: new THREE.Color(f.color) }))

const smooth = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)))
  return t * t * (3 - 2 * t)
}

/** 1 = fully real, 0 = fully hologram, as a function of story position m (0..5). */
function realness(m: number) {
  return 1 - smooth(1.0, 1.75, m) + smooth(2.55, 3.15, m) - smooth(4.35, 4.95, m)
}

const SHELL_VERTEX = /* glsl */ `
#include <common>
#include <clipping_planes_pars_vertex>
varying vec3 vN; varying vec3 vV; varying vec3 vW;
void main(){
  vec4 wp = modelMatrix * vec4(position, 1.0);
  vW = wp.xyz;
  vN = normalize(mat3(modelMatrix) * normal);
  vV = normalize(cameraPosition - wp.xyz);
  vec4 mvPosition = viewMatrix * wp;
  gl_Position = projectionMatrix * mvPosition;
  #include <clipping_planes_vertex>
}`
const SHELL_FRAGMENT = /* glsl */ `
#include <clipping_planes_pars_fragment>
uniform vec3 uColor; uniform float uOpacity; uniform float uTime;
varying vec3 vN; varying vec3 vV; varying vec3 vW;
void main(){
  #include <clipping_planes_fragment>
  float f = pow(1.0 - abs(dot(normalize(vN), vV)), 2.2);
  float scan = 0.65 + 0.35 * smoothstep(0.92, 1.0, sin(vW.y * 38.0 - uTime * 2.2));
  gl_FragColor = vec4(uColor * (0.08 + f * 1.6) * scan, (0.05 + f * 0.75) * uOpacity);
}`

const GRID_FRAGMENT = /* glsl */ `
uniform float uGlow; varying vec2 vUv;
void main(){
  vec2 p = (vUv - 0.5) * 60.0;
  vec2 g = abs(fract(p) - 0.5) / fwidth(p);
  float line = 1.0 - min(min(g.x, g.y), 1.0);
  float fade = 1.0 - smoothstep(4.0, 26.0, length(p));
  gl_FragColor = vec4(vec3(0.0, 0.85, 1.0) * line * fade * uGlow, line * fade * uGlow);
}`

const SCAN_FRAGMENT = /* glsl */ `
uniform float uOpacity; varying vec2 vUv;
void main(){
  float edge = smoothstep(0.0, 0.18, vUv.y) * smoothstep(1.0, 0.7, vUv.y) * smoothstep(0.0, 0.12, vUv.x) * smoothstep(1.0, 0.88, vUv.x);
  gl_FragColor = vec4(vec3(0.6, 1.6, 2.2) * edge, edge * uOpacity);
}`
const UV_VERTEX = /* glsl */ `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`

function useCarModel() {
  const { scene } = useGLTF(MODEL_URL, false, true)
  return useMemo(() => {
    const realPlane = new THREE.Plane(new THREE.Vector3(-1, 0, 0), HALF)
    const holoPlane = new THREE.Plane(new THREE.Vector3(1, 0, 0), -HALF)
    const paint = new THREE.MeshPhysicalMaterial({ color: FINISHES[0].c, roughness: 0.08, metalness: 0.6, clearcoat: 1, clearcoatRoughness: 0.04, envMapIntensity: 1.2, clippingPlanes: [realPlane] })
    const lineMat = new THREE.LineBasicMaterial({ color: new THREE.Color(0.55, 1.5, 2.1), transparent: true, opacity: 0.7, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false, clippingPlanes: [holoPlane] })
    const makeShell = (color: string) => new THREE.ShaderMaterial({
      vertexShader: SHELL_VERTEX, fragmentShader: SHELL_FRAGMENT, clipping: true, clippingPlanes: [holoPlane],
      uniforms: { uColor: { value: new THREE.Color(color) }, uOpacity: { value: 1 }, uTime: { value: 0 } },
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, toneMapped: false,
    })
    const shell = makeShell('#38d9ff')
    const layers = [makeShell('#7b5cff'), makeShell('#00e5ff')]
    layers.forEach((l) => (l.uniforms.uOpacity.value = 0))

    const root = scene.clone(true)
    const meshes: THREE.Mesh[] = []
    root.traverse((o) => { if (o instanceof THREE.Mesh) meshes.push(o) })
    const owned: THREE.Material[] = []
    for (const mesh of meshes) {
      const swap = (m: THREE.Material) => {
        if (PAINT_NAME.test(m.name)) return paint
        const c = m.clone()
        c.clippingPlanes = [realPlane]
        owned.push(c)
        return c
      }
      mesh.material = Array.isArray(mesh.material) ? mesh.material.map(swap) : swap(mesh.material)
      mesh.castShadow = true
      const edges = new THREE.LineSegments(new THREE.EdgesGeometry(mesh.geometry, 22), lineMat)
      edges.renderOrder = 2
      const sh = new THREE.Mesh(mesh.geometry, shell)
      sh.renderOrder = 1
      mesh.add(edges, sh)
    }
    // auto-fit: long axis on X, centred, wheels on y = 0, fixed length
    const holder = new THREE.Group()
    holder.add(root)
    const box = new THREE.Box3().setFromObject(root, true)
    const size = box.getSize(new THREE.Vector3())
    if (size.z > size.x) root.rotation.y = Math.PI / 2
    holder.updateMatrixWorld(true)
    const fitted = new THREE.Box3().setFromObject(holder, true)
    const fs = fitted.getSize(new THREE.Vector3())
    const scale = LENGTH / Math.max(fs.x, 0.001)
    const center = fitted.getCenter(new THREE.Vector3())
    holder.scale.setScalar(scale)
    holder.position.set(-center.x * scale, -fitted.min.y * scale, -center.z * scale)

    // exploded "layer" shells around the paint meshes only (vopsea / folie / ceramic)
    const paintMeshes = meshes.filter((m) => (Array.isArray(m.material) ? m.material : [m.material]).includes(paint))
    const layerGroups = layers.map((mat, i) => {
      const g = new THREE.Group()
      for (const pm of paintMeshes) {
        const copy = new THREE.Mesh(pm.geometry, mat)
        pm.updateWorldMatrix(true, false)
        copy.matrixAutoUpdate = false
        copy.matrix.copy(holder.matrixWorld.clone().invert().multiply(pm.matrixWorld))
        g.add(copy)
      }
      g.userData.offset = 0.07 + i * 0.09
      return g
    })
    layerGroups.forEach((g) => holder.add(g))

    const dispose = () => {
      paint.dispose(); lineMat.dispose(); shell.dispose(); layers.forEach((l) => l.dispose()); owned.forEach((m) => m.dispose())
      root.traverse((o) => { if (o instanceof THREE.LineSegments) o.geometry.dispose() })
    }
    return { holder, realPlane, holoPlane, paint, lineMat, shell, layers, layerGroups, dispose }
  }, [scene])
}

function Story({ progress, pointer }: Props) {
  const car = useCarModel()
  const morph = useRef(0)
  const viewShift = useRef(0)
  const scanRef = useRef<THREE.Mesh>(null)
  const gridMat = useMemo(() => new THREE.ShaderMaterial({ vertexShader: UV_VERTEX, fragmentShader: GRID_FRAGMENT, uniforms: { uGlow: { value: 0 } }, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false }), [])
  const scanMat = useMemo(() => new THREE.ShaderMaterial({ vertexShader: UV_VERTEX, fragmentShader: SCAN_FRAGMENT, uniforms: { uOpacity: { value: 0 } }, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, toneMapped: false }), [])
  const tmp = useMemo(() => ({ pos: new THREE.Vector3(), target: new THREE.Vector3(), a: new THREE.Vector3(), b: new THREE.Vector3(), look: new THREE.Vector3() }), [])

  // three objects are mutated per frame, so useFrame reads them through a ref (not the render-time values)
  const live = useRef<{ car: typeof car; gridMat: THREE.ShaderMaterial; scanMat: THREE.ShaderMaterial; tmp: typeof tmp } | null>(null)
  useEffect(() => {
    live.current = { car, gridMat, scanMat, tmp }
    return () => { live.current = null; car.dispose(); gridMat.dispose(); scanMat.dispose() }
  }, [car, gridMat, scanMat, tmp])

  useFrame((state, delta) => {
    const L = live.current
    if (!L) return
    const { car, gridMat, scanMat, tmp } = L
    const camera = state.camera as THREE.PerspectiveCamera
    const size = state.size
    const dt = Math.min(delta, 1 / 30)
    const goal = progress.current * (CAR_CHAPTERS - 1)
    morph.current += (goal - morph.current) * (1 - Math.exp(-3.2 * dt))
    const m = Math.min(CAR_CHAPTERS - 1, Math.max(0, morph.current))
    const i0 = Math.min(CAR_CHAPTERS - 2, Math.floor(m))
    const k = smooth(0, 1, m - i0)

    // camera path + pointer parallax
    tmp.a.fromArray(KEYS[i0].pos); tmp.b.fromArray(KEYS[i0 + 1].pos)
    tmp.pos.lerpVectors(tmp.a, tmp.b, k)
    tmp.a.fromArray(KEYS[i0].target); tmp.b.fromArray(KEYS[i0 + 1].target)
    tmp.target.lerpVectors(tmp.a, tmp.b, k)
    tmp.pos.x += pointer.current.x * 0.35
    tmp.pos.y -= pointer.current.y * 0.2
    camera.position.lerp(tmp.pos, 1 - Math.exp(-6 * dt))
    tmp.look.lerp(tmp.target, 1 - Math.exp(-6 * dt))
    camera.lookAt(tmp.look)

    // frame the car away from the chapter text (desktop only; on phones the text sits below)
    const side = SIDE[i0] * (1 - k) + SIDE[i0 + 1] * k
    const want = size.width / size.height > 1.1 ? -side * size.width * 0.19 : 0
    viewShift.current += (want - viewShift.current) * (1 - Math.exp(-5 * dt))
    camera.setViewOffset(size.width, size.height, viewShift.current, 0, size.width, size.height)

    // scan sweep: realness 1 keeps everything real (plane past the nose), 0 everything hologram
    const r = realness(m)
    const x = -HALF + r * HALF * 2
    car.realPlane.constant = x
    car.holoPlane.constant = -x
    const inside = r > 0.002 && r < 0.998
    if (scanRef.current) scanRef.current.position.x = x
    scanMat.uniforms.uOpacity.value += ((inside ? 1 : 0) - scanMat.uniforms.uOpacity.value) * (1 - Math.exp(-10 * dt))

    // hologram layers lift off the body in chapter 02
    const lw = smooth(1.55, 2.0, m) * (1 - smooth(2.4, 2.8, m))
    car.layerGroups.forEach((g, i) => {
      g.scale.setScalar(1 + g.userData.offset * lw)
      g.position.y = g.userData.offset * lw * 0.6
      car.layers[i].uniforms.uOpacity.value = lw
    })
    const t = state.clock.elapsedTime
    car.shell.uniforms.uTime.value = t
    car.layers.forEach((l) => (l.uniforms.uTime.value = t))
    gridMat.uniforms.uGlow.value = 0.18 + (1 - r) * 0.55

    // finish cycle in chapter 03 (gloss -> satin -> matte -> colour-shift), back to gloss after
    const f = Math.min(3, Math.max(0, (m - 3) * 4.2 - 0.6))
    const fi = Math.min(2, Math.floor(f))
    const fk = smooth(0, 1, f - fi)
    const A = FINISHES[fi], B = FINISHES[fi + 1]
    const p = car.paint
    p.color.copy(A.c).lerp(B.c, fk)
    p.roughness = A.roughness + (B.roughness - A.roughness) * fk
    p.clearcoat = A.clearcoat + (B.clearcoat - A.clearcoat) * fk
    p.metalness = A.metalness + (B.metalness - A.metalness) * fk
    p.iridescence = A.iridescence + (B.iridescence - A.iridescence) * fk
  })

  return (
    <group>
      <primitive object={car.holder} />
      <mesh ref={scanRef} position={[HALF, 0.8, 0]} rotation={[0, Math.PI / 2, 0]} material={scanMat} renderOrder={3}>
        <planeGeometry args={[2.6, 1.9]} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.001, 0]} material={gridMat}>
        <planeGeometry args={[60, 60]} />
      </mesh>
      <ContactShadows position={[0, 0.002, 0]} opacity={0.75} blur={2.4} scale={12} far={2.2} resolution={512} frames={1} />
    </group>
  )
}

useGLTF.preload(MODEL_URL, false, true)

export default function CarStory(props: Props) {
  return (
    <Canvas
      dpr={[1, 1.75]}
      camera={{ position: KEYS[0].pos, fov: 30, near: 0.1, far: 120 }}
      gl={{ antialias: true, powerPreference: 'high-performance', alpha: true }}
      style={{ background: 'transparent' }}
      aria-hidden="true"
      onCreated={({ gl }) => { gl.localClippingEnabled = true }}
    >
      <Suspense fallback={null}>
        <ambientLight intensity={0.08} />
        <Environment files={HDR_URL} background={false} environmentIntensity={0.85} resolution={256}>
          <Lightformer form="rect" color="#eaf2ff" intensity={3} position={[0, 5, 0]} rotation-x={Math.PI / 2} scale={[12, 1.4, 1]} />
          <Lightformer form="rect" color="#00d8ff" intensity={2.2} position={[0, 1.6, -6]} scale={[12, 0.8, 1]} />
          <Lightformer form="rect" color="#7b3dff" intensity={1.6} position={[-6, 1.2, 2]} rotation-y={Math.PI / 2} scale={[8, 0.6, 1]} />
        </Environment>
        <Story {...props} />
        <EffectComposer multisampling={0} enableNormalPass={false}>
          <Bloom intensity={0.9} luminanceThreshold={0.55} luminanceSmoothing={0.3} mipmapBlur />
          <Vignette eskil={false} offset={0.3} darkness={0.7} />
        </EffectComposer>
      </Suspense>
    </Canvas>
  )
}
