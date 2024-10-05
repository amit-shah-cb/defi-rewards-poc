"use client";

import { useAccount, useBalance, useEnsName, useWatchContractEvent } from "wagmi";
import { bytesToBigInt, formatBlock, formatUnits } from "viem";
import {  useEffect, useRef, useState } from "react";

import * as THREE from 'three'

import { extend, Object3DNode, useFrame} from '@react-three/fiber'
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader'
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry'

import { Canvas } from '@react-three/fiber'
import { Bloom, EffectComposer, ChromaticAberration, Outline } from '@react-three/postprocessing'
import { BlendFunction } from 'postprocessing'
import { OrbitControls, OrthographicCamera,  View as ViewImpl , CameraShake} from '@react-three/drei'
import { config } from "@/components/provider";
import { readContract,writeContract,simulateContract,getBalance, getAccount, waitForTransactionReceipt, watchContractEvent} from '@wagmi/core';
import { PointsUpgradableAbi } from "@/abis/PointsUpgradable";
import { RotatingCircle } from "./rotating";
import { MotionBlur } from "./motionblur";


export default function Lootbox() {

  const { address } = useAccount();
  const [claimedTime, setClaimedTime ] = useState(null);  
  const [claimable, setClaimable] = useState(false);
  const [claimCooldown, setClaimCooldown] = useState(null);
  const [points, setPoints ] = useState(null);
  const [isShaking, setIsShaking] = useState(false);

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
        if(address!=null){
            readContract(config, {
                abi: PointsUpgradableAbi, 
                address:process.env.NEXT_PUBLIC_POINTS_ADDRESS as `0x${string}`, 
                functionName:"balanceOf", 
                args:[address] 
            }).then((data) => {
                console.log("user points:",data);
                setPoints(data);
            });
        }
    },[address,claimable])

  useEffect(() => {
    if(address !=null && claimCooldown != null){
        readContract(config, {
            abi: PointsUpgradableAbi, 
            address:process.env.NEXT_PUBLIC_POINTS_ADDRESS as `0x${string}`, 
            functionName:"getLastClaimed", 
            args:[address] 
        }).then((data) => {
            console.log("WE GOT DATA:",data);     
            const lastClaimedTime = Number(data as bigint);  
            setClaimedTime(lastClaimedTime);
            const currentTimeSecs = (new Date()).getTime()/1000;                     
            if(lastClaimedTime === 0 || (currentTimeSecs - lastClaimedTime > claimCooldown)){
                console.log("CLAIMABLE");
                setClaimable(true);
            }else{
                console.log("NOT CLAIMABLE:",( (lastClaimedTime + claimCooldown)- currentTimeSecs)*1000);
                let context = setTimeout(()=>{
                    console.log("CALLING SET CLAIMABLE");
                    setClaimable(true);
                },((lastClaimedTime + claimCooldown)- currentTimeSecs)*1000);
                
                return ()=>{
                  console.log("CLEARING TIMEOUT");
                  clearTimeout(context)
                };
            }
            
        });
    }
  }, [address,claimCooldown,claimable])

  useEffect(() => {
    (window as any).handleStart = () => {
      const event = new Event('startRotation');
      window.dispatchEvent(event);
    };

    (window as any).handleStop = () => {
      const event = new Event('stopRotation');
      window.dispatchEvent(event);
    };
  }, []);
 
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

        // let unwatch;
        // unwatch = watchContractEvent(config.getClient(), {
        //     address: process.env.NEXT_PUBLIC_POINTS_ADDRESS as `0x${string}`,
        //     abi:PointsUpgradableAbi,
        //     eventName: 'LootBoxOpened',            
        //     onLogs(logs) {                
        //         console.log("Lootbox opened with rarity:"+logs[0].args.lootBoxRarity);
        //         unwatch();
        //     },
        // })
        // console.log("setup log watching");
        const tx = await writeContract(config, {
                abi: PointsUpgradableAbi, 
                address:process.env.NEXT_PUBLIC_POINTS_ADDRESS as `0x${string}`, 
                functionName:"claimLootBoxWithEntropy",      
                args:[randomHexValue],  
                value:claimFee,
                connector
            } as any);

        (window as any).handleStart()
        setIsShaking(true);
        console.log("tx hash:",tx);

        waitForTransactionReceipt(config, {
            hash:tx
        }).then(async (receipt)=>{
            console.log("receipt",receipt);    
             let unwatch = watchContractEvent(config, {
                address: process.env.NEXT_PUBLIC_POINTS_ADDRESS as `0x${string}`,
                abi:PointsUpgradableAbi,
                eventName: 'LootBoxOpened',
                args: {
                    claimer:address
                },
                fromBlock:receipt.blockNumber,
                poll:true,
                onError:(e)=>{
                    console.error(e);
                    unwatch();
                     (window as any).handleStop();
                     setIsShaking(false);
                },
                onLogs(logs) {                
                    console.log(logs);
                    unwatch();
                    console.log("unwatched");
                    setClaimable(false);
                     (window as any).handleStop()
                     setIsShaking(false);
                }
            });
        });       
        
       
  }

  return (
   <div className="mb-32 grid text-center lg:mb-0 lg:w-full lg:max-w-5xl lg:grid-cols-4 lg:text-left">
     
     <div className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30">
        <h2 className={`mb-3 text-2xl font-semibold`}>Points Balance</h2>
        <div className={`m-0 max-w-[30ch] text-xl opacity-50`}>
          {points ? (
            <p>              
              {Number(formatUnits(points,6)).toFixed(6)}{" "}
              PTS
            </p>
          ) : (
            <p>0 PTS</p>
          )}
        </div>
      </div>   
    <div className="h-96 w-full rounded" >     
        <Canvas gl={{alpha:true,antialias:true}}  className="rounded-lg">
        <color attach='background' args={["white"]} />
            <OrbitControls />
        <OrthographicCamera
            makeDefault
             zoom={140}
            // top={20}
            // bottom={-20}
            // left={-40}
            // right={40}
            near={0}
            far={20}
            position={[0, 0, 2]}
        />
        {/* <directionalLight position={[0, 0, 5]} color="white" /> */}
        {isShaking &&
          <CameraShake maxYaw={0.01} maxPitch={0.5} maxRoll={0.5} yawFrequency={0.5} pitchFrequency={2.5} rollFrequency={2.4} intensity={.6 }/>
        }
        {/* <Circle /> */}
        <RotatingCircle items={[{
            text:"100pts",
            textColor:"white",
            color:"blue"
        },{
            text:"200pts",
            textColor:"white",
            color:"blue"
        },{
            text:"500pts",
            textColor:"white",
            color:"blue"
        },{
            text:"1000pts",
            textColor:"white",
            color:"blue"
        }] }/>
        {/* <Box /> */}
        
            {true && <EffectComposer>                          
             <ChromaticAberration
                blendFunction={BlendFunction.NORMAL} // blend mode
                offset={new THREE.Vector2(0.02, 0.02)} // color offset
                radialModulation={true}
                modulationOffset={0.01} // shift effect
                opacity={0.5}
                />
            <Bloom luminanceThreshold={0.8} luminanceSmoothing={0.6} height={100} />
            
            </EffectComposer>}
          {false && <MotionBlur />}
         
        </Canvas>
    </div>
    <div style={{ position: 'absolute', top: '10px', left: '10px' }}>
      <button onClick={() => (window as any).handleStart()} className="mr-2 rounded bg-blue-500 px-4 py-2 text-white">
      Start Rotation
      </button>
      <button onClick={() => (window as any).handleStop()} className="rounded bg-red-500 px-4 py-2 text-white">
      Stop Rotation
      </button>
    </div>
     <div className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30">     
        <button className="btn"  disabled={!claimable} onClick={()=>{ 
          
          submitLootboxClaim()}}>
            {getButtonMessage()}
        </button>
     </div>
    </div>
  );
}