"use client";

import { useAccount, useBalance, useEnsName } from "wagmi";
import { formatUnits } from "viem";
import { useEffect, useState } from "react";
import { PointsUpgradableAbi } from '@/abis/PointsUpgradable';
import { readContract } from '@wagmi/core';
import {config } from '@/components/provider';

export default function Profile() {

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
  }, [points, address])

  return (
    <div className="mb-32 grid text-center lg:mb-0 lg:w-full lg:max-w-5xl lg:grid-cols-4 lg:text-left">
      {/* <div className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30">
        <h2 className="mb-3 text-2xl font-semibold">Wallet address</h2>
        <p className="m-0 w-[30ch] text-sm opacity-50">
          {address as string  || ""}
        </p>
      </div> */}

      {/* <div className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30">
        <h2 className={`mb-3 text-2xl font-semibold`}>Network</h2>
        <p className={`m-0 max-w-[30ch] text-sm opacity-50`}>
          {chain?.name || ""}
        </p>
      </div> */}

      <div className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30">
        <h2 className={`mb-3 text-2xl font-semibold`}>Points Balance</h2>
        <div className={`m-0 max-w-[30ch] text-xl opacity-50`}>
          {points ? (
            <p>              
              {Number(formatUnits(points,6)).toFixed(4)}{" "}
              PTS
            </p>
          ) : (
            <p>0 PTS</p>
          )}
        </div>
      </div>

      {/* <div className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30">
        <h2 className={`mb-3 text-2xl font-semibold`}>EnsName</h2>
        <p className={`m-0 max-w-[30ch] text-balance text-sm opacity-50`}>
          {ens.data || ""}
        </p>
      </div> */}
    </div>
  );
}