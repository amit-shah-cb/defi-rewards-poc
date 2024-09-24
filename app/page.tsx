'use client'

import dynamic from 'next/dynamic'
import { Suspense } from 'react'
import '@rainbow-me/rainbowkit/styles.css';

import {
  getDefaultConfig,
  RainbowKitProvider,
} from '@rainbow-me/rainbowkit';
import { WagmiProvider } from 'wagmi';
import {
  base,
} from 'wagmi/chains';
import {
  QueryClientProvider,
  QueryClient,
} from "@tanstack/react-query";
import { http } from 'wagmi';
import * as THREE from 'three'
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { extend, Object3DNode} from '@react-three/fiber'
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader'
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry'

import { Canvas } from '@react-three/fiber'
import { Preload } from '@react-three/drei'
import { r3f } from '@/helpers/global'
import { Bloom, DepthOfField, EffectComposer, Noise, Vignette, ChromaticAberration } from '@react-three/postprocessing'
  import { BlendFunction } from 'postprocessing'
import { OrbitControls, OrthographicCamera, PerspectiveCamera, View as ViewImpl, Effects } from '@react-three/drei'

extend({ TextGeometry })
import * as myFont from '@/fonts/font.json'
declare module "@react-three/fiber" {
  interface ThreeElements {
    textGeometry: Object3DNode<TextGeometry, typeof TextGeometry>;
  }
}

const config = getDefaultConfig({
  appName: 'My RainbowKit App',
  projectId: 'YOUR_PROJECT_ID',
  chains: [base],
  ssr: false, // If your dApp uses server side rendering (SSR),
  transports: {
    [base.id]: http('https://mainnet.base.org'),
  },
});


const font = new FontLoader().parse(myFont);
const queryClient = new QueryClient();

const Dog = dynamic(() => import('@/components/canvas/Examples').then((mod) => mod.Dog), { ssr: false })

export default function Page() {
  return (
    <>
     <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          <ConnectButton />
          
          <div className='mx-auto flex w-full flex-col flex-wrap items-center p-12 md:flex-row'>
            
          </div>
           <div className='mx-auto flex w-full flex-col flex-wrap items-center p-12 md:flex-row'>
            {/* first row */}            
            <div className='relative h-96 w-full py-6 md:mb-40'>
               <Canvas>
                <color attach='background' args={["blue"]} />
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
                <ambientLight intensity={0.1} />
                <directionalLight position={[0, 0, 5]} color="red" />
                 <mesh position={[-2.25,-.5,0]}>              
                      <textGeometry args={['drip', {font, size:1.5, height: .0, depth:0., bevelEnabled:false }]}/>
                      <meshStandardMaterial attach='material' opacity={0.5} color={new THREE.Color("red")} emissive={new THREE.Color("orange")} emissiveIntensity={1.9}/>
                  </mesh>
                  <EffectComposer>
                    <Bloom luminanceThreshold={0.2} luminanceSmoothing={0.6} height={200} />
                      <ChromaticAberration
                        blendFunction={BlendFunction.NORMAL} // blend mode
                        offset={new THREE.Vector2(0.005, 0.005)} // color offset
                        radialModulation={true}
                        modulationOffset={0.} // shift effect
                        opacity={0.8}
                      />
                  </EffectComposer>
              </Canvas>
            </div>
            
          
          </div>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
    </>
  )
}
