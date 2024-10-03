import React from "react";
import "./LeftPanel.scss";
import { Box, Divider, Tab, Tabs } from "@mui/material";
import { Link, useLocation } from "react-router-dom";
import { ReactElement, useEffect } from "react";
import {
  AdfScannerOutlined,
  AdjustOutlined,
  HomeOutlined,
  Payments,
  Redeem,
  SupervisorAccount,
} from "@mui/icons-material";
import logo from "../../assets/images/full-logo.png";
import { useWallet } from "@txnlab/use-wallet-react";
import { loadAccountData } from "../../Redux/staking/userReducer";
import { useAppDispatch } from "../../Redux/store";
import LockClockIcon from "@mui/icons-material/LockClock";
import {
  dashboardRoutes,
  dashboardTabs,
  settingRoutes,
} from "../../constants/routes";
import LinkIcon from "@mui/icons-material/Link";

function LeftPanel(): ReactElement {
  const location = useLocation();
  const { activeAccount } = useWallet();
  const dispatch = useAppDispatch();

  let route: any = location.pathname;
  route = route.substring(1);
  route = route.split("/");
  route = route[0];

  const routes: string[] = [...dashboardRoutes, ...settingRoutes];

  if (routes.indexOf(route) === -1) {
    route = false;
  }

  useEffect(() => {
    if (activeAccount?.address) {
      dispatch(loadAccountData(activeAccount.address));
    }
  }, [activeAccount]);

  // const settingTabls = [
  //   {
  //     label: "Overview",
  //     value: "overview",
  //     icon: <HomeOutlined></HomeOutlined>,
  //   },
  //   {
  //     label: "Setting",
  //     value: "setting",
  //     icon: <AdjustOutlined></AdjustOutlined>,
  //   },
  // ];

  return (
    <div className="left-panel-wrapper ">
      <div className="left-panel-container">
        <div className="logo flex items-center justify-center">
          <img src={logo} alt={"logo"} />
        </div>
        <div className="nav-tabs">
          <Tabs
            value={route}
            variant={"standard"}
            indicatorColor={"primary"}
            orientation={"vertical"}
            className="vertical-pills"
          >
            {/*route === "setting"
              ? settingTabls.map((tab) => (
                  <Tab
                    key={tab.value}
                    label={tab.label}
                    value={tab.value}
                    iconPosition="start"
                    component={Link}
                    to={`/${tab.value}`}
                    icon={tab.icon}
                  />
                ))
              : null*/}
            {["setting"].indexOf(route) === -1
              ? dashboardTabs.map((tab) => (
                  <Tab
                    key={tab.value}
                    label={tab.label}
                    value={tab.value}
                    iconPosition="start"
                    component={Link}
                    to={`/${tab.value}`}
                    icon={tab.icon}
                  />
                ))
              : null}
          </Tabs>
        </div>
      </div>
    </div>
  );
}

export default LeftPanel;
