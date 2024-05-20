import { ReactElement, useEffect } from "react";
import "./App.scss";
import AppRouter from "./Router/AppRouter";
import { useAppDispatch } from "../Redux/store";
import { initApp } from "../Redux/app/appReducer";
import {
  PROVIDER_ID,
  useInitializeProviders,
  WalletProvider,
} from "@txnlab/use-wallet";
import { nodeParams } from "../utils/voiXUtils";

function App(): ReactElement {
  const dispatch = useAppDispatch();
  useEffect(() => {
    dispatch(initApp());
  }, []);

  const useWalletConfig = useInitializeProviders({
    providers: [{ id: PROVIDER_ID.KIBISIS }],
    nodeConfig: {
      network: nodeParams.name,
      nodeServer: nodeParams.algod.url,
    },
  });

  return (
    <div className="app-root">
      <div className="app-wrapper">
        <div className="app-container">
          <WalletProvider value={useWalletConfig}>
            <AppRouter></AppRouter>
          </WalletProvider>
        </div>
      </div>
    </div>
  );
}

export default App;
