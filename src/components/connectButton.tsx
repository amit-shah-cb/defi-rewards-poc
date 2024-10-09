"use client";

import { useEffect, useRef } from "react";
import {
  useConnectModal,
  useAccountModal,
  useChainModal,
} from "@rainbow-me/rainbowkit";
import { useAccount, useDisconnect } from "wagmi";
import { useProfile } from "@/hooks/useProfile";

export const ConnectBtn = () => {
  const { isConnecting, address, isConnected, chain } = useAccount();


  const { openConnectModal } = useConnectModal();
  const { openAccountModal } = useAccountModal();
  const { openChainModal } = useChainModal();
  const { disconnect } = useDisconnect();

  const isMounted = useRef(false);

  const profile = useProfile(address);

  useEffect(() => {
    isMounted.current = true;
  }, []);

  if (!isConnected) {
    return (
      <button
        className="btn"
        onClick={async () => {
          // Disconnecting wallet first because sometimes when is connected but the user is not connected
          if (isConnected) {
            disconnect();
          }
          openConnectModal?.();
        }}
        disabled={isConnecting}
      >
        {isConnecting ? <span className="loading loading-spinner"></span> : 'Connect'}
      </button>
    );
  }

  if (isConnected && !chain) {
    return (
      <button className="btn" onClick={openChainModal}>
        Wrong network
      </button>
    );
  }

  return (
    <div className="flex w-full max-w-5xl items-center justify-end">
      <div
        className="flex cursor-pointer items-center justify-center gap-x-2 rounded-full  px-4 py-2 font-mono font-bold bg-[#eef0f3]"
        onClick={async () => openAccountModal?.()}
      >
        <div
          role="button"
          tabIndex={1}
          className="flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-full"
          style={{
            backgroundColor: "white",
            boxShadow: "0px 2px 2px 0px rgba(81, 98, 255, 0.20)",
          }}
        >

        </div>
        <div className="max-w-40 text-ellipsis overflow-hidden">
          <p className="text-ellipsis overflow-hidden">{profile ?? address}</p>
        </div>
      </div>
    </div>
  );
};