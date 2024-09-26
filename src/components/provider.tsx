"use client";

import { http, WagmiProvider ,cookieToInitialState,createConfig} from "wagmi";
import { RainbowKitProvider, darkTheme, getDefaultConfig } from "@rainbow-me/rainbowkit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { base } from "viem/chains";

export const config = getDefaultConfig({
    appName: 'Defi-Rewards-Poc',
    projectId: 'YOUR_PROJECT_ID',
    chains: [base],
    ssr: false, // If your dApp uses server side rendering (SSR),
    transports: {
      [base.id]: http(process.env.NEXT_PUBLIC_BASE_URL as string),
    },
})

const queryClient = new QueryClient();

type Props = {
  children: React.ReactNode;
  cookie?: string | null;
};

export default function Providers({ children, cookie }: Props) {
    const initialState = cookieToInitialState(config, cookie);
  return (
    <WagmiProvider config={config} initialState={initialState}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
        //   theme={darkTheme({
        //     accentColor: "#0E76FD",
        //     accentColorForeground: "white",
        //     borderRadius: "large",
        //     fontStack: "system",
        //     overlayBlur: "small",
        //   })}
        >
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}