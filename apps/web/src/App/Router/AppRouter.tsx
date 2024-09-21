import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { ReactElement, useEffect, useState } from "react";
import LeftPanel from "../../Components/LeftPanel/LeftPanel";
import { useSelector } from "react-redux";
import { RootState, useAppDispatch } from "../../Redux/store";
import WalletWidget from "../../Components/WalletWidget/WalletWidget";
import Overview from "../../Pages/Overview/Overview";
import { useWallet } from "@txnlab/use-wallet-react";
import Stake from "../../Pages/Stake/Stake";
import { loadAccountData } from "../../Redux/staking/userReducer";
import Withdraw from "../../Pages/Withdraw/Withdraw";
import Deposit from "../../Pages/Deposit/Deposit";
import Transfer from "../../Pages/Transfer/Transfer";
import ContractPicker from "../../Components/pickers/ContractPicker/ContractPicker";
import Delegate from "../../Pages/Delegate/Delegate";
import Airdrop from "../../Pages/Airdrop/Airdrop";
//import Staking from "../../Pages/Staking/Staking";
import Setting from "../../Pages/Setting/Setting";
import Participate from "../../Pages/Participate/Participate";
import voiStakingUtils from "../../utils/voiStakingUtils";
import { CoreAccount } from "@repo/algocore";
import { AccountResult } from "@algorandfoundation/algokit-utils/types/indexer";
import { Box } from "@mui/material";

function AppRouter(): ReactElement {
  const { selectedNode } = useSelector((state: RootState) => state.nodes);
  const { activeAccount } = useWallet();

  const dispatch = useAppDispatch();

  const isAirdrop = document.location?.pathname?.includes("airdrop");
  const isStaking = document.location?.pathname?.includes("staking");
  const isSetting = document.location?.pathname?.includes("setting");
  const isAccount = document.location?.pathname?.includes("account");

  useEffect(() => {
    if (activeAccount?.address) {
      dispatch(loadAccountData(activeAccount.address));
    }
  }, [activeAccount]);

  const [availableBalance, setAvailableBalance] = useState<number>(-1);
  useEffect(() => {
    if (!activeAccount) return;
    const algodClient = voiStakingUtils.network.getAlgodClient();
    algodClient
      .accountInformation(activeAccount.address)
      .do()
      .then((account) => {
        setAvailableBalance(
          new CoreAccount(account as AccountResult).availableBalance()
        );
      });
  }, [activeAccount]);

  return (
    <BrowserRouter>
      <div className="app-container">
        <div className="app-container-body">
          <div className="app-left">
            <LeftPanel></LeftPanel>
          </div>
          <div className="app-right">
            <div className="content-wrapper">
              <div className="content-container">
                <div
                  className="content-header"
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "flex-end",
                    alignItems: "center",
                    gap: 10,
                  }}
                >
                  <Box sx={{ display: { xs: "none", sm: "block" } }}>
                    {availableBalance >= 0 ? (
                      <div className="balance">
                        {(availableBalance / 1e6).toFixed(6)} VOI
                      </div>
                    ) : null}
                  </Box>
                  <WalletWidget></WalletWidget>
                </div>
                {selectedNode && (
                  <div className="content-body">
                    {activeAccount && (
                      <Routes>
                        <Route
                          path="/overview"
                          element={<Overview></Overview>}
                        ></Route>
                        <Route path="/stake" element={<Stake></Stake>}></Route>
                        <Route
                          path="/deposit"
                          element={<Deposit></Deposit>}
                        ></Route>
                        <Route
                          path="/withdraw"
                          element={<Withdraw></Withdraw>}
                        ></Route>
                        <Route
                          path="/transfer"
                          element={<Transfer></Transfer>}
                        ></Route>
                        <Route
                          path="/delegate"
                          element={<Delegate></Delegate>}
                        ></Route>
                        <Route
                          path="/airdrop"
                          element={<Airdrop></Airdrop>}
                        ></Route>
                        {/*<Route
                          path="/staking"
                          element={<Staking></Staking>}
                          ></Route>*/}
                        <Route
                          path="/setting"
                          element={<Setting></Setting>}
                        ></Route>
                        <Route
                          path="/account"
                          element={<Participate></Participate>}
                        ></Route>
                        <Route
                          path="*"
                          element={<Navigate to="/overview" replace />}
                        />
                      </Routes>
                    )}
                    {!activeAccount && (
                      <div className="info-msg">Please connect your wallet</div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default AppRouter;
