import "./LeftPanel.scss";
import { Tab, Tabs } from "@mui/material";
import { Link, useLocation } from "react-router-dom";
import { ReactElement, useEffect } from "react";
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

function LeftPanel(): ReactElement {
  const location = useLocation();
  const { activeAccount } = useWallet();
  const dispatch = useAppDispatch();

  let route: any = location.pathname;
  route = route.substring(1);
  route = route.split("/");
  route = route[0];

  const routes: string[] = [
    "overview",
    "stake",
    "deposit",
    "withdraw",
    "transfer",
    "delegate",
    "airdrop",
  ];

  if (routes.indexOf(route) === -1) {
    route = false;
  }

  useEffect(() => {
    if (activeAccount?.address) {
      dispatch(loadAccountData(activeAccount.address));
    }
  }, [activeAccount]);

  const airdropTabs = [
    {
      label: "Airdrop",
      value: "airdrop",
      icon: <Redeem></Redeem>,
    },
  ];

  const dashboardTabs = [
    {
      label: "Overview",
      value: "overview",
      icon: <HomeOutlined></HomeOutlined>,
    },
    {
      label: "Stake",
      value: "stake",
      icon: <AdjustOutlined></AdjustOutlined>,
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
            {route === "airdrop"
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
              : null}
            {route !== "airdrop"
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

            {/*
            <Tab
              label="Airdrop"
              value="airdrop"
              iconPosition="start"
              component={Link}
              to={`/airdrop`}
              icon={<Redeem></Redeem>}
            />
            <Tab
              label="Overview"
              value="overview"
              iconPosition="start"
              component={Link}
              to={`/overview`}
              icon={<HomeOutlined></HomeOutlined>}
            />
            <Tab
              label="Stake"
              value="stake"
              iconPosition="start"
              component={Link}
              to={`/stake`}
              icon={<AdjustOutlined></AdjustOutlined>}
            />
            <Tab
              label="Deposit"
              value="deposit"
              iconPosition="start"
              component={Link}
              to={`/deposit`}
              icon={<AdfScannerOutlined></AdfScannerOutlined>}
            />
            <Tab
              label="Withdraw"
              value="withdraw"
              iconPosition="start"
              component={Link}
              to={`/withdraw`}
              icon={<Payments></Payments>}
            />
            <Tab
              label="Transfer"
              value="transfer"
              iconPosition="start"
              component={Link}
              to={`/transfer`}
              icon={<MoveDown></MoveDown>}
            />
            <Tab
              label="Delegate"
              value="delegate"
              iconPosition="start"
              component={Link}
              to={`/delegate`}
              icon={<SupervisorAccount></SupervisorAccount>}
            />
              */}
          </Tabs>
        </div>
      </div>
    </div>
  );
}

export default LeftPanel;
