'use client'

import { Suspense, useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { ContactShadows, Environment, Lightformer, OrbitControls, PerformanceMonitor, useGLTF } from '@react-three/drei'
import { Bloom, EffectComposer, Vignette } from '@react-three/postprocessing'
import * as THREE from 'three'
import type { WrapColorContent, WrapFinish } from '@/lib/site-content'

type Props = { color: WrapColorContent; active: boolean; label: string }

type Target = {
  color: THREE.Color
  roughness: number
  metalness: number
  clearcoat: number
  clearcoatRoughness: number
  iridescence: number
  iridescenceIOR: number
  thicknessMin: number
  thicknessMax: number
  envMapIntensity: number
  sheen: number
}

const WHITE = new THREE.Color('#ffffff')
const REDUCED_QUERY = '(prefers-reduced-motion: reduce)'

function buildTarget(hex: string, finish: WrapFinish): Target {
  const color = new THREE.Color(hex)
  const base = {
    iridescence: 0,
    iridescenceIOR: 1.3,
    thicknessMin: 100,
    thicknessMax: 400,
    sheen: 0,
  }
  switch (finish) {
    case 'matte':
      return { ...base, color, roughness: 0.75, metalness: 0.05, clearcoat: 0, clearcoatRoughness: 0.5, envMapIntensity: 0.7 }
    case 'satin':
      return { ...base, color, roughness: 0.35, metalness: 0.2, clearcoat: 0.6, clearcoatRoughness: 0.25, envMapIntensity: 1 }
    case 'chrome':
      return { ...base, color: color.lerp(WHITE, 0.7), roughness: 0.04, metalness: 1, clearcoat: 0, clearcoatRoughness: 0.05, envMapIntensity: 1.6 }
    case 'color-shift':
      return {
        ...base,
        color,
        roughness: 0.18,
        metalness: 0.35,
        clearcoat: 1,
        clearcoatRoughness: 0.05,
        iridescence: 1,
        iridescenceIOR: 1.9,
        thicknessMin: 140,
        thicknessMax: 800,
        envMapIntensity: 1.2,
        sheen: 0.4,
      }
    default:
      return { ...base, color, roughness: 0.08, metalness: 0.25, clearcoat: 1, clearcoatRoughness: 0.03, envMapIntensity: 1.2 }
  }
}

function subscribeReduced(cb: () => void) {
  const mq = window.matchMedia(REDUCED_QUERY)
  mq.addEventListener('change', cb)
  return () => mq.removeEventListener('change', cb)
}
const getReduced = () => window.matchMedia(REDUCED_QUERY).matches
const getReducedServer = () => false

function useReducedMotion() {
  return useSyncExternalStore(subscribeReduced, getReduced, getReducedServer)
}

const DAMP = 6

/** Materials that take the wrap colour: the Blender export names the body 'Wrap'; the Khronos CarConcept slots are 'Paint 1/2 *'. */
const PAINT_NAME = /^(Wrap|Paint )/
/** Car length in metres after auto-fit; the camera and floor are tuned for this. */
const TARGET_LENGTH = 4.5
const MODEL_URL = '/models/wob-car.glb'
const ENTRANCE_DAMP = 5
const HDR_URL = '/hdri/studio_small_09_1k.hdr'
const TARGET_Y = 0.5

function Car({ color, reduced }: { color: WrapColorContent; reduced: boolean }) {
  const target = useMemo(() => buildTarget(color.hex, color.finish), [color.hex, color.finish])
  const { scene } = useGLTF(MODEL_URL, false, true)

  const wrap = useMemo(() => {
    const t = buildTarget(color.hex, color.finish)
    return new THREE.MeshPhysicalMaterial({
      color: t.color,
      roughness: t.roughness,
      metalness: t.metalness,
      clearcoat: t.clearcoat,
      clearcoatRoughness: t.clearcoatRoughness,
      iridescence: t.iridescence,
      iridescenceIOR: t.iridescenceIOR,
      iridescenceThicknessRange: [t.thicknessMin, t.thicknessMax],
      envMapIntensity: t.envMapIntensity,
      sheen: t.sheen,
      sheenRoughness: 0.5,
      sheenColor: new THREE.Color('#ffffff'),
    })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const wrapRef = useRef(wrap)
  const groupRef = useRef<THREE.Group>(null)

  const model = useMemo(() => {
    const root = scene.clone(true)
    root.traverse((obj) => {
      if (!(obj instanceof THREE.Mesh)) return
      const mat: THREE.Material | THREE.Material[] = obj.material
      const isPaint = (m: THREE.Material) => PAINT_NAME.test(m.name)
      if (Array.isArray(mat)) {
        obj.material = mat.map((m) => (isPaint(m) ? wrap : m))
      } else if (isPaint(mat)) {
        obj.material = wrap
      }
      // glass must not cast a hard shadow onto the interior
      const first = Array.isArray(obj.material) ? obj.material[0] : obj.material
      obj.castShadow = !(first instanceof THREE.MeshPhysicalMaterial && first.transmission > 0)
    })
    // auto-fit any model: long axis along X, centred, wheels on y = 0, normalised length
    const box = new THREE.Box3().setFromObject(root, true) // precise: quantized accessor bounds are inflated
    const size = box.getSize(new THREE.Vector3())
    const holder = new THREE.Group()
    holder.add(root)
    if (size.z > size.x) root.rotation.y = Math.PI / 2
    holder.updateMatrixWorld(true)
    const fitted = new THREE.Box3().setFromObject(holder, true)
    const fittedSize = fitted.getSize(new THREE.Vector3())
    const scale = TARGET_LENGTH / Math.max(fittedSize.x, 0.001)
    const center = fitted.getCenter(new THREE.Vector3())
    holder.scale.setScalar(scale)
    holder.position.set(-center.x * scale, -fitted.min.y * scale, -center.z * scale)
    return holder
  }, [scene, wrap])

  useEffect(() => () => wrap.dispose(), [wrap])

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.1)
    const m = wrapRef.current
    const k = reduced ? 1 : 1 - Math.exp(-DAMP * dt)
    m.color.lerp(target.color, k)
    m.roughness += (target.roughness - m.roughness) * k
    m.metalness += (target.metalness - m.metalness) * k
    m.clearcoat += (target.clearcoat - m.clearcoat) * k
    m.clearcoatRoughness += (target.clearcoatRoughness - m.clearcoatRoughness) * k
    m.iridescence += (target.iridescence - m.iridescence) * k
    m.iridescenceIOR += (target.iridescenceIOR - m.iridescenceIOR) * k
    m.iridescenceThicknessRange[0] += (target.thicknessMin - m.iridescenceThicknessRange[0]) * k
    m.iridescenceThicknessRange[1] += (target.thicknessMax - m.iridescenceThicknessRange[1]) * k
    m.envMapIntensity += (target.envMapIntensity - m.envMapIntensity) * k
    m.sheen += (target.sheen - m.sheen) * k

    const g = groupRef.current
    if (g) {
      const ke = reduced ? 1 : 1 - Math.exp(-ENTRANCE_DAMP * dt)
      const s = g.scale.x + (1 - g.scale.x) * ke
      g.scale.setScalar(s > 0.9995 ? 1 : s)
    }
  })

  return (
    <group ref={groupRef} scale={0.96}>
      <primitive object={model} />
    </group>
  )
}

useGLTF.preload(MODEL_URL, false, true)

function Effects() {
  const capabilities = useThree((s) => s.gl.capabilities)
  const [enabled] = useState(() => {
    const smallHiDpi = window.devicePixelRatio > 2 && window.innerWidth < 1100
    return !smallHiDpi && capabilities.maxTextureSize >= 4096
  })
  if (!enabled) return null
  return (
    <EffectComposer multisampling={0} enableNormalPass={false}>
      <Bloom intensity={0.35} luminanceThreshold={0.85} mipmapBlur />
      <Vignette eskil={false} offset={0.25} darkness={0.75} />
    </EffectComposer>
  )
}

export default function WrapConfigurator({ color, active, label }: Props) {
  const reduced = useReducedMotion()
  const [dpr, setDpr] = useState<number | [number, number]>([1, 2])
  const [interacted, setInteracted] = useState(false)
  return (
    <Canvas
      dpr={dpr}
      frameloop={active ? 'always' : 'never'}
      gl={{ antialias: true, powerPreference: 'high-performance' }}
      camera={{ position: [4.0, 1.2, 5.3], fov: 27 }}
      style={{ background: 'transparent' }}
      aria-label={label}
    >
      <PerformanceMonitor
        flipflops={3}
        onDecline={() => setDpr(1)}
        onIncline={() => setDpr(Math.min(2, window.devicePixelRatio))}
        onFallback={() => setDpr(1)}
      >
        <Suspense fallback={null}>
          <ambientLight intensity={0.15} />
          <directionalLight position={[4, 6, 3]} intensity={0.7} />
          <Environment files={HDR_URL} background={false} environmentIntensity={0.9} resolution={256}>
            <Lightformer form="rect" color="#eaf2ff" intensity={3} position={[0, 5, 0]} rotation-x={Math.PI / 2} scale={[12, 1.4, 1]} />
            <Lightformer form="rect" color="#ffd9b0" intensity={2.4} position={[0, 2, -6]} scale={[10, 1.2, 1]} />
            <Lightformer form="rect" color="#ffffff" intensity={1.2} position={[-6, 1.5, 2]} rotation-y={Math.PI / 2} scale={[8, 0.8, 1]} />
          </Environment>
          <Car color={color} reduced={reduced} />
          <ContactShadows position={[0, 0.002, 0]} opacity={0.8} blur={2.2} scale={12} far={2.5} resolution={1024} frames={1} />
          <OrbitControls
            enablePan={false}
            enableZoom={false}
            enableDamping
            dampingFactor={0.08}
            target={[0, TARGET_Y, 0]}
            minPolarAngle={Math.PI / 3.1}
            maxPolarAngle={Math.PI / 2.08}
            minAzimuthAngle={-Infinity}
            maxAzimuthAngle={Infinity}
            autoRotate={active && !reduced && !interacted}
            autoRotateSpeed={0.55}
            onStart={() => setInteracted(true)}
            makeDefault
          />
          {active && !reduced ? <Effects /> : null}
        </Suspense>
      </PerformanceMonitor>
    </Canvas>
  )
}
