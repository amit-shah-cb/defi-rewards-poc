"use client";

import { useAccount, useBalance, useEnsName, useWatchContractEvent } from "wagmi";
import { AbiEvent, bytesToBigInt, decodeEventLog, formatBlock, formatUnits, parseAbiItem } from "viem";
import { useEffect, useRef, useState } from "react";

import * as THREE from 'three'

import { extend, Object3DNode, useFrame } from '@react-three/fiber'
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader'
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry'

import { Canvas } from '@react-three/fiber'
import { Bloom, EffectComposer, ChromaticAberration, Outline } from '@react-three/postprocessing'
import { BlendFunction } from 'postprocessing'
import { OrbitControls, OrthographicCamera, View as ViewImpl, CameraShake } from '@react-three/drei'
import { config } from "@/components/provider";
import { readContract, writeContract, simulateContract, getBalance, getAccount, waitForTransactionReceipt, watchContractEvent, getPublicClient } from '@wagmi/core';
import { PointsUpgradableAbi } from "@/abis/PointsUpgradable";
import { RotateState, RotatingCircle } from "./rotating";
import { MotionBlur } from "./motionblur";
import { ThreeEffects } from "./effects";
import { Balance } from "./Balance";
import { SpinButton } from "./SpinButton";
import { getLogs } from "viem/actions";

export interface LootboxProps {
  shakeEnabled?: boolean;
}

const DEFAULT_MESSAGE = "Spin the wheel daily and earn extra points with Coinbase Wallet";
export default function Lootbox(props: LootboxProps) {

  const { address } = useAccount();
  const [claimedTime, setClaimedTime] = useState(null);
  const [claimable, setClaimable] = useState(false);
  const [claimCooldown, setClaimCooldown] = useState(null);
  const [points, setPoints] = useState(null);
  const [isShaking, setIsShaking] = useState(false);
  const [rarity, setRarity] = useState(null);
  const [rotationsState, setRotationsState] = useState(RotateState.STOPPED);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState(DEFAULT_MESSAGE);
  const [items, setItems] = useState([])

  useEffect(() => {
    if (claimCooldown == null) {
      readContract(config, {
        abi: PointsUpgradableAbi,
        address: process.env.NEXT_PUBLIC_POINTS_ADDRESS as `0x${string}`,
        functionName: "getClaimCooldown",
        args: []
      }).then((data) => {
        setClaimCooldown(Number(data as bigint));
      });
    }
  }, [])

  useEffect(() => {
    if(items.length === 0) {
     readContract(config, {
        abi: PointsUpgradableAbi,
        address: process.env.NEXT_PUBLIC_POINTS_ADDRESS as `0x${string}`,
        functionName: "getLootBoxRarity",       
      }).then((data) => {
        console.log("getLastClaimed:", data);
        setItems(data.map((item) => {
          return {
            text: `${item} DRIP`,
            textColor:"white",
            color: "blue",
          }
        }))
      })
    }
  },[]);

  useEffect(() => {
    if (address != null) {
      readContract(config, {
        abi: PointsUpgradableAbi,
        address: process.env.NEXT_PUBLIC_POINTS_ADDRESS as `0x${string}`,
        functionName: "balanceOf",
        args: [address]
      }).then((data) => {
        console.log("user points:", data);
        setPoints(data);
      });     
    }
  }, [address, claimable])

  useEffect(() => {
    if (address != null && claimCooldown != null) {
      readContract(config, {
        abi: PointsUpgradableAbi,
        address: process.env.NEXT_PUBLIC_POINTS_ADDRESS as `0x${string}`,
        functionName: "getLastClaimed",
        args: [address]
      }).then((data) => {
        console.log("WE GOT DATA:", data);
        const lastClaimedTime = Number(data as bigint);
        setClaimedTime(lastClaimedTime);
        const currentTimeSecs = (new Date()).getTime() / 1000;
        if (lastClaimedTime === 0 || (currentTimeSecs - lastClaimedTime > claimCooldown)) {
          console.log("CLAIMABLE");
          setClaimable(true);
          setMessage(DEFAULT_MESSAGE);
        } else {
          console.log("NOT CLAIMABLE:", ((lastClaimedTime + claimCooldown) - currentTimeSecs) * 1000);
          let context = setTimeout(() => {
            console.log("CALLING SET CLAIMABLE");
            setClaimable(true);
            setMessage(DEFAULT_MESSAGE);
          }, ((lastClaimedTime + claimCooldown) - currentTimeSecs) * 1000);

          return () => {
            console.log("CLEARING TIMEOUT");
            clearTimeout(context)
          };
        }

      });
    }
  }, [address, claimCooldown, claimable])

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

  useEffect(() => {
    if (rarity != null) {
      (window as any).handleStop();
      setIsShaking(false);
    }
  }, [rarity])

  const notClaimable = !claimable && claimedTime != null && claimCooldown != null

  const getClaimFee = async () => {
    const fee = await readContract(config, {
      abi: PointsUpgradableAbi,
      address: process.env.NEXT_PUBLIC_POINTS_ADDRESS as `0x${string}`,
      functionName: "getLoopBoxClaimFee",
    });
    return fee;
  }

  const submitLootboxClaim = async () => {
    setIsSubmitting(true);   
    console.log("Click");
    const { connector } = getAccount(config)
    const claimFee = await getClaimFee();
    const balance = await getBalance(config, {
      address
    });
    if (balance.value < claimFee) {
      console.log("Insufficient balance:", balance, "claimFee:", claimFee);      
      setMessage("Insufficient balance. Please load $0.50 in ETH on BASE to your wallet.");     
      setIsSubmitting(false);
      return;
    }
    console.log("claimFee", claimFee);
    console.log("balance", balance);
    const randomBytes = crypto.getRandomValues(new Uint8Array(32))
    const randomHexValue = bytesToBigInt(randomBytes)

    try {
      const simulation = await simulateContract(config, {
        abi: PointsUpgradableAbi,
        address: process.env.NEXT_PUBLIC_POINTS_ADDRESS as `0x${string}`,
        functionName: "claimLootBoxWithEntropy",
        args: [randomHexValue],
        value: claimFee,
        connector,
        from: address
      })
    } catch (e) {
      console.error(e);
      setIsSubmitting(false);
      setClaimable(true)
      setMessage("Tx simulation failed. Try again.")
      return
    }
    try {
      const tx = await writeContract(config, {
        abi: PointsUpgradableAbi,
        address: process.env.NEXT_PUBLIC_POINTS_ADDRESS as `0x${string}`,
        functionName: "claimLootBoxWithEntropy",
        args: [randomHexValue],
        value: claimFee,
        connector
      } as any);
      setRarity(null);
      setRotationsState(RotateState.START);
      setIsShaking(true);

      waitForTransactionReceipt(config, {
        hash: tx
      }).then(async (receipt) => {
        const client = getPublicClient(config);
        let intervalId: NodeJS.Timeout | null = null;
        const fetchLogs = async () => {
          try {
            const logs = await client.getLogs({
              address: process.env.NEXT_PUBLIC_POINTS_ADDRESS as `0x${string}`,
              event: parseAbiItem('event LootBoxOpened(address indexed claimer, uint256 lootBoxRarity)'),
              fromBlock: receipt.blockNumber,
              toBlock: 'latest'
            })

            if (logs.length > 0) {
              if (intervalId) clearInterval(intervalId);
              const decodedLog = decodeEventLog({
                abi: PointsUpgradableAbi,
                data: logs[0].data,
                topics: logs[0].topics,
              })

              setRarity(Number((decodedLog as any).args.lootBoxRarity))
              setRotationsState(RotateState.STOP_ROTATING)
              setClaimable(false)
              setMessage("Congratulations you won $DRIP! \r\nComeback and spin the wheel again in:")
              setIsSubmitting(false)
            }
          } catch (e) {
            if (intervalId) clearInterval(intervalId);
            setRarity(null);
            setRotationsState(RotateState.ERROR);
            setIsShaking(false);
            setIsSubmitting(false);
            setClaimable(true)
            setMessage("There was an error spinning the wheel onchain. Please try again.")
          }
        }
        intervalId = setInterval(fetchLogs, 500);
        // Timeout to stop polling for logs after 1 minute
        setTimeout(() => {
          if (intervalId) clearInterval(intervalId);
          setRarity(null);
          setRotationsState(RotateState.STOP_ROTATING);
          setIsShaking(false);
          setIsSubmitting(false);
        }, 60000);
      });
    } catch (e) {
      setIsSubmitting(false);
    }



  }

  return (
    <div className="mb-32 grid text-center lg:mb-0 lg:w-full lg:max-w-5xl lg:grid-cols-4 lg:text-left">

      <Balance points={points} />
      <div className="h-96 w-full rounded" >
        <Canvas gl={{ alpha: true, antialias: true }} className="rounded-lg">
          <color attach='background' args={["white"]} />
          {/* <OrbitControls /> */}
          <OrthographicCamera
            makeDefault
            zoom={150}
            // top={20}
            // bottom={-20}
            // left={-40}
            // right={40}
            near={0}
            far={20}
            position={[0, 0, 2]}
          />
          {/* <directionalLight position={[0, 0, 5]} color="white" /> */}
          {props.shakeEnabled && isShaking &&
            <CameraShake maxYaw={0.01} maxPitch={0.5} maxRoll={0.5} yawFrequency={0.5} pitchFrequency={2.5} rollFrequency={2.4} intensity={.6} />
          }
          {/* <Circle /> */}
          <RotatingCircle items={items} rotationState={rotationsState} rarity={rarity} />
          {/* <Box /> */}
          <ThreeEffects motionBlurEnabled={false} />
          {false && <EffectComposer>
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
      <div className="mb-4 mt-2 h-[70px] flex-col items-center justify-center gap-2">
        <p className="text-lg font-semibold opacity-80">WIN $DRIP EVERYDAY</p>
        <p className={`${notClaimable ? "text-[#0052FF]" : ""}`}>{message}</p>
      </div>

      {/* <div style={{ position: 'absolute', bottom: '10px', left: '10px' }}>
        <button onClick={() => {
          setRarity(null);
          setRotationsState(RotateState.START);
        }} className="mr-2 rounded bg-blue-500 px-4 py-2 text-white">
          Start Rotation
        </button>
        <button onClick={() => {
          setRotationsState(RotateState.STOP_ROTATING);
        }}
          className="rounded bg-red-500 px-4 py-2 text-white">
          Stop Rotation
        </button>
      </div> */}

      <SpinButton isSubmitting={isSubmitting} claimable={claimable} submitLootboxClaim={submitLootboxClaim} claimedTime={claimedTime} claimCooldown={claimCooldown} />
    </div >
  );
}