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

      <div className='mx-auto flex w-full flex-col flex-wrap items-center p-8 md:flex-row'>
        {
          isConnected && <Lootbox />
        }
      </div>
    </>
  )
}
