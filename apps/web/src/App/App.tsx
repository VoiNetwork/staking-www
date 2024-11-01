import React, { ReactElement, useEffect } from "react";
import "./App.scss";
import AppRouter from "./Router/AppRouter";
import { useAppDispatch } from "../Redux/store";
import { initApp } from "../Redux/app/appReducer";
import {
  NetworkId,
  WalletId,
  WalletManager,
  WalletProvider,
} from "@txnlab/use-wallet-react";
import { getPreConfiguredNodes } from "../Redux/network/nodesReducer";

function App(): ReactElement {
  const dispatch = useAppDispatch();
  useEffect(() => {
    dispatch(initApp());
  }, []);

  const node = getPreConfiguredNodes()[0];

  let walletConnectProjectId = import.meta.env.VITE_WALLET_CONNECT_PROJECT_ID;
  if (!walletConnectProjectId) {
    walletConnectProjectId = "e2fef7cf17012eaba443b7cf615f7815";
  }

  const walletConnectOptions = {
    projectId: walletConnectProjectId,
    metadata: {
      name: "VoiX",
      url: "https://staking.voi.network",
      description: "Voi Staking Platform",
      icons: ["https://staking.voi.network/favicon.ico"],
    },
    themeMode: "light",
  };

  const walletManager = new WalletManager({
    wallets: [
      WalletId.KIBISIS,
      {
        id: WalletId.LUTE,
        options: { siteName: "VoiX" },
      },
      {
        id: WalletId.BIATEC,
        options: walletConnectOptions,
      },
      {
        id: WalletId.WALLETCONNECT,
        options: walletConnectOptions,
      },
    ],
    algod: {
      baseServer: node.algod.url || "https://mainnet-api.voi.nodely.dev", // HACK: Use voimain as default
      port: node.algod.port,
      token: node.algod.token,
    },
    network: NetworkId.MAINNET,
  });

  return (
    <div className="app-root">
      <div className="app-wrapper">
        <WalletProvider manager={walletManager}>
          <AppRouter></AppRouter>
        </WalletProvider>
      </div>
    </div>
  );
}

export default App;
