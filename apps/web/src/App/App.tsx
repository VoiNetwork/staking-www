import { ReactElement, useEffect } from "react";
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
  const walletManager = new WalletManager({
    wallets: [
      WalletId.KIBISIS,
      {
        id: WalletId.LUTE,
        options: { siteName: "VoiX" },
      },
    ],
    algod: {
      baseServer: node.algod.url,
      port: node.algod.port,
      token: node.algod.token,
    },
    network: NetworkId.TESTNET,
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
