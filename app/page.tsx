"use client"
import dynamic from 'next/dynamic'
import { Suspense } from 'react'
import '@rainbow-me/rainbowkit/styles.css';
import * as THREE from 'three'

import { extend, Object3DNode } from '@react-three/fiber'
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader'
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry'

import { Canvas } from '@react-three/fiber'
import { Preload } from '@react-three/drei'
import { r3f } from '@/helpers/global'
import { Bloom, DepthOfField, EffectComposer, Noise, Vignette, ChromaticAberration } from '@react-three/postprocessing'
import { BlendFunction } from 'postprocessing'
import { OrbitControls, OrthographicCamera, PerspectiveCamera, View as ViewImpl, Effects } from '@react-three/drei'

import { ConnectBtn } from "@/components/connectButton";
import Profile from "@/components/profile";

extend({ TextGeometry })
import * as myFont from '@/fonts/font.json'
import { useAccount } from 'wagmi';
import Lootbox from '@/components/lootbox';
import { LionMilkLogo } from '@/components/LionMilkLogo/LionMilkLogo';

declare module "@react-three/fiber" {
  interface ThreeElements {
    textGeometry: Object3DNode<TextGeometry, typeof TextGeometry>;
  }
}

const font = new FontLoader().parse(myFont);


// const Dog = dynamic(() => import('@/components/canvas/Examples').then((mod) => mod.Dog), { ssr: false })

export default function Page() {
  const { isConnecting, address, isConnected, chain } = useAccount();

  return (
    <>
      <header className="z-10 px-6 w-full items-center justify-between font-mono text-sm flex ">
        <LionMilkLogo />
        <ConnectBtn />
      </header>

      <div className='mx-auto flex w-full flex-col flex-wrap items-center p-12 md:flex-row'>
        {/* first row */}
        {/* <div className='relative h-1/2 w-full py-6 md:mb-40'>
          <Canvas>
            <color attach='background' args={["white"]} />
            <OrbitControls />
            <OrthographicCamera
              makeDefault
              zoom={8}
              top={10}
              bottom={-10}
              left={-20}
              right={20}
              near={1}
              far={20}
              position={[0, 0, 5]}
            />
            <ambientLight intensity={0.001} />
            <directionalLight position={[0, 0, 5]} color="white" />
            <mesh position={[-2.25, -.5, 0]}>
              <textGeometry args={['drip', { font, size: 1.5, height: .0, depth: 0., bevelEnabled: false }]} />
              <meshStandardMaterial attach='material' opacity={0.5} color={new THREE.Color("blue")} emissive={new THREE.Color("blue")} emissiveIntensity={.8} />
            </mesh>
            <EffectComposer>
              <Bloom luminanceThreshold={0.2} luminanceSmoothing={0.6} height={800} />
              <ChromaticAberration
                blendFunction={BlendFunction.NORMAL} // blend mode
                offset={new THREE.Vector2(0.01, 0.01)} // color offset
                radialModulation={true}
                modulationOffset={0.} // shift effect
                opacity={0.8}
              />
            </EffectComposer>
          </Canvas>
        </div> */}
        {
          isConnected && <Lootbox />
        }
      </div>
    </>
  )
}
