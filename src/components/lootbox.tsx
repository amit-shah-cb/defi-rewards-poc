"use client";

import { useAccount, useBalance, useEnsName } from "wagmi";
import { bytesToBigInt, formatUnits } from "viem";
import { use, useEffect, useRef, useState } from "react";

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
import { config } from "@/components/provider";
import { readContract,writeContract,simulateContract,getBalance, getAccount } from '@wagmi/core';
import { PointsUpgradableAbi } from "@/abis/PointsUpgradable";
import { bytesToHex } from 'viem'
import { signTransaction } from "viem/accounts";


declare module "@react-three/fiber" {
  interface ThreeElements {
    textGeometry: Object3DNode<TextGeometry, typeof TextGeometry>;
  }
}

const font = new FontLoader().parse(myFont);

function useInterval(callback, delay) {
  const savedCallback = useRef();

  // Remember the latest callback.
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  // Set up the interval.
  useEffect(() => {
    function tick() {
      (savedCallback as any).current();
    }
    if (delay !== null) {
      let id = setInterval(tick, delay);
      return () => clearInterval(id);
    }
  }, [delay]);
}


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

  const { address } = useAccount();
  const [claimedTime, setClaimedTime ] = useState(null);
  const [claimable, setClaimable] = useState(false);
  const [claimCooldown, setClaimCooldown] = useState(null);

  useEffect(() => {
    if(claimCooldown == null){
        readContract(config, {
            abi: PointsUpgradableAbi, 
            address:process.env.NEXT_PUBLIC_POINTS_ADDRESS as `0x${string}`, 
            functionName:"getClaimCooldown", 
            args:[] 
        }).then((data) => {
            setClaimCooldown(Number(data as bigint));
        });
    }
  },[])  

  useEffect(() => {
    if(address !=null && claimedTime == null && claimCooldown != null){
        readContract(config, {
            abi: PointsUpgradableAbi, 
            address:process.env.NEXT_PUBLIC_POINTS_ADDRESS as `0x${string}`, 
            functionName:"getLastClaimed", 
            args:[address] 
        }).then((data) => {
            console.log("WE GOT DATA:",data);     
            const lastClaimedTime = Number(data as bigint);  
            const currentTimeSecs = (new Date()).getTime()/1000;          
            if(lastClaimedTime === 0 || (currentTimeSecs - lastClaimedTime > claimCooldown)){
                console.log("CLAIMABLE");
                setClaimable(true);
            }else{
                console.log("NOT CLAIMABLE");
            }
            setClaimedTime(lastClaimedTime);
        });
    }
  }, [address,claimedTime,claimCooldown])

  const getButtonMessage = ()=>{       
        if(!claimable && claimedTime != null && claimCooldown != null){        
            return `🔒 ${new Date((claimedTime + claimCooldown)*1000).toLocaleString()} 🔒`;
        }
        return "🔥 Claim Lootbox 🔥";
    }

  const getClaimFee = async ()=>{
    const fee = await readContract(config, {
        abi: PointsUpgradableAbi, 
        address:process.env.NEXT_PUBLIC_POINTS_ADDRESS as `0x${string}`, 
        functionName:"getLoopBoxClaimFee",          
    });
    return fee;
  }
  
  const submitLootboxClaim = async ()=>{
        console.log("Click");
        const { connector } = getAccount(config)
        const claimFee = await getClaimFee();
        const balance = await getBalance(config,{
            address
        });
        if(balance.value < claimFee){
            alert("Insufficient balance");
            return;
        }
        console.log("claimFee",claimFee);
        console.log("balance",balance);
        const randomBytes = crypto.getRandomValues(new Uint8Array(32))
        const randomHexValue = bytesToBigInt(randomBytes)
        
        try{
            const simulation = await simulateContract(config, {
                abi: PointsUpgradableAbi, 
                address:process.env.NEXT_PUBLIC_POINTS_ADDRESS as `0x${string}`, 
                functionName:"claimLootBoxWithEntropy",      
                args:[randomHexValue],  
                value:claimFee,
                connector,
                from:address
            })
        }catch(e){
            console.error(e);
            alert("Transaction failed");
            return
        }
        const tx = await writeContract(config, {
                abi: PointsUpgradableAbi, 
                address:process.env.NEXT_PUBLIC_POINTS_ADDRESS as `0x${string}`, 
                functionName:"claimLootBoxWithEntropy",      
                args:[randomHexValue],  
                value:claimFee,
                connector
            } as any);
        //get seq from logs
        //set interval to check when seq == 0l

        
  }

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
        <button className="btn"  disabled={!claimable} onClick={()=>{ submitLootboxClaim()}}>
            {getButtonMessage()}
        </button>
     </div>
    </div>
  );
}