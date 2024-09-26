import "./LeftPanel.scss";
import { Tab, Tabs } from "@mui/material";
import { Link, useLocation } from "react-router-dom";
import React, { ReactElement, useEffect } from "react";
import {
  AdfScannerOutlined,
  AdjustOutlined,
  HomeOutlined,
  MoveDown,
  Payments,
  Redeem,
  SupervisorAccount,
} from "@mui/icons-material";
import logo from "../../assets/images/full-logo.png";
import { useWallet } from "@txnlab/use-wallet-react";
import { loadAccountData } from "../../Redux/staking/userReducer";
import { useAppDispatch } from "../../Redux/store";
import LockClockIcon from "@mui/icons-material/LockClock";

function LeftPanel(): ReactElement {
  const location = useLocation();
  const { activeAccount } = useWallet();
  const dispatch = useAppDispatch();

  let route: any = location.pathname;
  route = route.substring(1);
  route = route.split("/");
  route = route[0];

  const dashboardRoutes: string[] = [
    "overview",
    "stake",
    "staking",
    "deposit",
    "withdraw",
    "transfer",
    "delegate",
  ];

  const settingRoutes: string[] = ["setting"];

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

  const dashboardTabs = [
    {
      label: "Contracts Overview",
      value: "overview",
      icon: <HomeOutlined></HomeOutlined>,
    },
    /*
    {
      label: "Lockup Config",
      value: "airdrop",
      icon: <LockClockIcon></LockClockIcon>,
    },
    */
    {
      label: "Earn Block Rewards",
      value: "stake",
      icon: <AdjustOutlined></AdjustOutlined>,
    },
    {
      label: "Staking Program",
      value: "staking",
      icon: <LockClockIcon></LockClockIcon>,
    },
    {
      label: "Deposit",
      value: "deposit",
      icon: <AdfScannerOutlined></AdfScannerOutlined>,
    },
    {
      label: "Withdraw",
      value: "withdraw",
      icon: <Payments></Payments>,
    },
    /*
    {
      label: "Transfer",
      value: "transfer",
      icon: <MoveDown></MoveDown>,
    },
    {
      label: "Delegate",
      value: "delegate",
      icon: <SupervisorAccount></SupervisorAccount>,
    },
    */
  ];
  return (
    <div className="left-panel-wrapper">
      <div className="left-panel-container">
        <div className="logo">
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
