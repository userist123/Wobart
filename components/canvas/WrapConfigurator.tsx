'use client'

import { Suspense, useMemo, useRef, useSyncExternalStore } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { ContactShadows, Environment, Lightformer, OrbitControls, RoundedBox } from '@react-three/drei'
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

function Car({ color, reduced }: { color: WrapColorContent; reduced: boolean }) {
  const target = useMemo(() => buildTarget(color.hex, color.finish), [color.hex, color.finish])
  const matRef = useRef<THREE.MeshPhysicalMaterial>(null)
  const init = useMemo(() => buildTarget(color.hex, color.finish), []) // eslint-disable-line react-hooks/exhaustive-deps

  useFrame((_, delta) => {
    const m = matRef.current
    if (!m) return
    const k = reduced ? 1 : 1 - Math.exp(-DAMP * Math.min(delta, 0.1))
    m.color.lerp(target.color, k)
    m.roughness += (target.roughness - m.roughness) * k
    m.metalness += (target.metalness - m.metalness) * k
    m.clearcoat += (target.clearcoat - m.clearcoat) * k
    m.clearcoatRoughness += (target.clearcoatRoughness - m.clearcoatRoughness) * k
    m.iridescence += (target.iridescence - m.iridescence) * k
  })

  const wheelX = [1.35, -1.35]
  const wheelZ = [0.9, -0.9]

  return (
    <group position={[0, 0.2, 0]}>
      <RoundedBox args={[4.2, 0.55, 1.8]} radius={0.12} smoothness={4}>
        <meshPhysicalMaterial
          ref={matRef}
          color={init.color}
          roughness={init.roughness}
          metalness={init.metalness}
          clearcoat={init.clearcoat}
          clearcoatRoughness={init.clearcoatRoughness}
          iridescence={init.iridescence}
          iridescenceIOR={1.8}
          iridescenceThicknessRange={[120, 650]}
        />
      </RoundedBox>
      <RoundedBox args={[2.2, 0.55, 1.5]} radius={0.12} smoothness={4} position={[-0.3, 0.5, 0]}>
        <meshPhysicalMaterial color="#0b0d12" roughness={0.05} metalness={0.2} transmission={0} />
      </RoundedBox>
      {wheelX.flatMap((x) =>
        wheelZ.map((z) => (
          <group key={`${x}-${z}`} position={[x, -0.2, z]}>
            <mesh rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.42, 0.42, 0.3, 32]} />
              <meshStandardMaterial color="#0a0a0a" roughness={0.9} metalness={0} />
            </mesh>
            <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, Math.sign(z) * 0.151]}>
              <cylinderGeometry args={[0.27, 0.27, 0.02, 32]} />
              <meshStandardMaterial color="#b9bcc4" roughness={0.3} metalness={0.9} />
            </mesh>
          </group>
        )),
      )}
      {[0.55, -0.55].map((z) => (
        <mesh key={`h${z}`} position={[2.1, 0.02, z]}>
          <boxGeometry args={[0.06, 0.1, 0.36]} />
          <meshStandardMaterial color="#DFF6FF" emissive="#DFF6FF" emissiveIntensity={2} />
        </mesh>
      ))}
      {[0.6, -0.6].map((z) => (
        <mesh key={`t${z}`} position={[-2.1, 0.05, z]}>
          <boxGeometry args={[0.06, 0.08, 0.4]} />
          <meshStandardMaterial color="#FF2A2A" emissive="#FF2A2A" emissiveIntensity={2} />
        </mesh>
      ))}
    </group>
  )
}

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
        <ContactShadows position={[0, -0.62, 0]} opacity={0.55} blur={2.4} scale={10} frames={1} />
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
