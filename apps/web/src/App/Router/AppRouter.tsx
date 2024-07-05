import { HashRouter, Navigate, Route, Routes } from "react-router-dom";
import { ReactElement } from "react";
import LeftPanel from "../../Components/LeftPanel/LeftPanel";
import { useSelector } from "react-redux";
import { RootState } from "../../Redux/store";
import WalletWidget from "../../Components/WalletWidget/WalletWidget";

function AppRouter(): ReactElement {
  const { selectedNode } = useSelector((state: RootState) => state.nodes);

  return (
    <HashRouter>
      <div className="app-container">
        <div className="app-container-body">
          <div className="app-left">
            <LeftPanel></LeftPanel>
          </div>
          <div className="app-right">
            <div className="content-wrapper">
              <div className="content-container">
                <div className="content-header">
                  <WalletWidget></WalletWidget>
                </div>
                {selectedNode && (
                  <div className="content-body">
                    <Routes>
                      <Route
                        path="/overview"
                        element={<div>Overview</div>}
                      ></Route>
                      <Route path="/stake" element={<div>Stake</div>}></Route>
                      <Route
                        path="/deposit"
                        element={<div>Deposit</div>}
                      ></Route>
                      <Route
                        path="/withdraw"
                        element={<div>Withdraw</div>}
                      ></Route>
                      <Route path="/config" element={<div>Config</div>}></Route>
                      <Route
                        path="*"
                        element={<Navigate to="/overview" replace />}
                      />
                    </Routes>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </HashRouter>
  );
}

export default AppRouter;
