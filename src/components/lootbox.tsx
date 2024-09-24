"use client";

import { useAccount, useBalance, useEnsName } from "wagmi";
import { formatUnits } from "viem";
import { useEffect, useRef, useState } from "react";

import * as THREE from 'three'

import { extend, Object3DNode, useFrame} from '@react-three/fiber'
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader'
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry'

import { Canvas } from '@react-three/fiber'
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

const font = new FontLoader().parse(myFont);

const Box = () => {
  const boxRef = useRef();

  useFrame(() => {    
    (boxRef.current as any).rotation.y += 0.01;
  });

  return (
    <mesh ref={boxRef} rotation-x={Math.PI * 0.25} rotation-y={Math.PI * 0.25}>
      <boxGeometry args={[2, 2, 2]} />
      <meshStandardMaterial color={"white"} />
    </mesh>
  );
};

export default function Lootbox() {

  const { address, chain } = useAccount();
  const [points, setPoints ] = useState(null);
  const { data } = useBalance({
    address,
  });

  const ens = useEnsName({
    address,
  });


  useEffect(() => {
    if(address !=null && points == null){
        fetch('api/lootbox/claimTime/')
        .then(response => response.json())
        .then(data => {
            setPoints(data.lastClaimTime)
        });
    }
  }, [points, address])

  return (
   <div className="mb-32 grid text-center lg:mb-0 lg:w-full lg:max-w-5xl lg:grid-cols-4 lg:text-left">
            {/* first row */}        
    <div className="h-vdh w-full">     
        <Canvas>
        <color attach='background' args={["white"]} />
            <OrbitControls />
        <OrthographicCamera
            makeDefault
            zoom={4}
            top={10}
            bottom={-10}
            left={-20}
            right={20}
            near={1}
            far={20}
            position={[0, 0, 5]}
        />
        <directionalLight position={[0, 0, 5]} color="white" />
        <Box />
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
    </div>
     <div className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30">     
        <button className="btn">
            Open Lootbox {points}
        </button>
     </div>
    </div>
  );
}