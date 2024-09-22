import React from "react";
import "./LeftPanel.scss";
import { Tab, Tabs } from "@mui/material";
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
    "deposit",
    "withdraw",
    "transfer",
    "delegate",
  ];

  const airdropRoutes: string[] = ["airdrop"];

  const stakingRoutes: string[] = ["staking"];

  const settingRoutes: string[] = ["setting"];

  const routes: string[] = [
    ...dashboardRoutes,
    ...airdropRoutes,
    ...stakingRoutes,
    ...settingRoutes,
  ];

  if (routes.indexOf(route) === -1) {
    route = false;
  }

  useEffect(() => {
    if (activeAccount?.address) {
      dispatch(loadAccountData(activeAccount.address));
    }
  }, [activeAccount]);

  // const airdropTabs = [
  //   {
  //     label: "Overview",
  //     value: "overview",
  //     icon: <HomeOutlined></HomeOutlined>,
  //   },
  //   {
  //     label: "Airdrop",
  //     value: "airdrop",
  //     icon: <Redeem></Redeem>,
  //   },
  // ];

  // const stakingTabs = [
  //   {
  //     label: "Overview",
  //     value: "overview",
  //     icon: <HomeOutlined></HomeOutlined>,
  //   },
  //   {
  //     label: "Staking",
  //     value: "staking",
  //     icon: <AdjustOutlined></AdjustOutlined>,
  //   },
  // ];

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
      label: "Overview",
      value: "overview",
      icon: <HomeOutlined></HomeOutlined>,
    },
    {
      label: "Lockup Config",
      value: "airdrop",
      icon: <LockClockIcon></LockClockIcon>,
    },
    {
      label: "Stake",
      value: "stake",
      icon: <AdjustOutlined></AdjustOutlined>,
    },
    /*
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
            {/*route === "airdrop"
              ? airdropTabs.map((tab) => (
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
            {/* {route === "staking"
              ? stakingTabs.map((tab) => (
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
              : null} */}
            {route === "setting"
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
              : null}
            {["staking", "setting"].indexOf(route) === -1
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
