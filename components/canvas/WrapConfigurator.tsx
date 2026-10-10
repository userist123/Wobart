'use client'

import { Suspense, useEffect, useMemo, useRef, useSyncExternalStore } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { ContactShadows, Environment, Lightformer, OrbitControls, useGLTF } from '@react-three/drei'
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
}

const WHITE = new THREE.Color('#ffffff')
const REDUCED_QUERY = '(prefers-reduced-motion: reduce)'

function buildTarget(hex: string, finish: WrapFinish): Target {
  const color = new THREE.Color(hex)
  switch (finish) {
    case 'matte':
      return { color, roughness: 0.9, metalness: 0.05, clearcoat: 0, clearcoatRoughness: 0.5, iridescence: 0 }
    case 'satin':
      return { color, roughness: 0.45, metalness: 0.1, clearcoat: 0.5, clearcoatRoughness: 0.35, iridescence: 0 }
    case 'chrome':
      return { color: color.lerp(WHITE, 0.6), roughness: 0.06, metalness: 1, clearcoat: 0, clearcoatRoughness: 0.05, iridescence: 0 }
    case 'color-shift':
      return { color, roughness: 0.2, metalness: 0.3, clearcoat: 1, clearcoatRoughness: 0.05, iridescence: 1 }
    default:
      return { color, roughness: 0.12, metalness: 0.15, clearcoat: 1, clearcoatRoughness: 0.05, iridescence: 0 }
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

const MODEL_URL = '/models/wob-car.glb'
const GROUND_Y = -0.42

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
      iridescenceIOR: 1.8,
      iridescenceThicknessRange: [120, 650],
    })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const wrapRef = useRef(wrap)

  const model = useMemo(() => {
    const root = scene.clone(true)
    root.traverse((obj) => {
      if (!(obj instanceof THREE.Mesh)) return
      obj.castShadow = true
      const mat: THREE.Material | THREE.Material[] = obj.material
      if (Array.isArray(mat)) {
        obj.material = mat.map((m) => (m.name === 'Wrap' ? wrap : m))
      } else if (mat.name === 'Wrap') {
        obj.material = wrap
      }
    })
    return root
  }, [scene, wrap])

  useEffect(() => () => wrap.dispose(), [wrap])

  useFrame((_, delta) => {
    const m = wrapRef.current
    const k = reduced ? 1 : 1 - Math.exp(-DAMP * Math.min(delta, 0.1))
    m.color.lerp(target.color, k)
    m.roughness += (target.roughness - m.roughness) * k
    m.metalness += (target.metalness - m.metalness) * k
    m.clearcoat += (target.clearcoat - m.clearcoat) * k
    m.clearcoatRoughness += (target.clearcoatRoughness - m.clearcoatRoughness) * k
    m.iridescence += (target.iridescence - m.iridescence) * k
  })

  return (
    <group position={[0, GROUND_Y, 0]}>
      <primitive object={model} />
    </group>
  )
}

useGLTF.preload(MODEL_URL, false, true)

export default function WrapConfigurator({ color, active, label }: Props) {
  const reduced = useReducedMotion()
  return (
    <Canvas
      dpr={[1, 2]}
      frameloop={active ? 'always' : 'never'}
      gl={{ antialias: true, powerPreference: 'high-performance' }}
      camera={{ position: [4.2, 1.6, 5.2], fov: 32 }}
      style={{ background: 'transparent' }}
      aria-label={label}
    >
      <Suspense fallback={null}>
        <ambientLight intensity={0.25} />
        <directionalLight position={[4, 6, 3]} intensity={1.1} />
        <Environment resolution={256} frames={1}>
          <Lightformer form="rect" intensity={2.2} position={[0, 5, 0]} rotation-x={Math.PI / 2} scale={[10, 6, 1]} />
          <Lightformer form="rect" intensity={1.6} position={[-6, 1.5, 2]} rotation-y={Math.PI / 2} scale={[8, 2.5, 1]} />
          <Lightformer form="rect" intensity={1.2} position={[6, 1, -3]} rotation-y={-Math.PI / 2} scale={[8, 2, 1]} />
          <Lightformer form="ring" color="#E8FF00" intensity={0.6} position={[0, 2, -7]} scale={4} />
        </Environment>
        <Car color={color} reduced={reduced} />
        <ContactShadows position={[0, GROUND_Y - 0.01, 0]} opacity={0.55} blur={2.4} scale={10} frames={1} />
        <OrbitControls
          enablePan={false}
          enableZoom={false}
          minPolarAngle={Math.PI / 3.2}
          maxPolarAngle={Math.PI / 2.05}
          autoRotate={active && !reduced}
          autoRotateSpeed={0.7}
          makeDefault
        />
      </Suspense>
    </Canvas>
  )
}
