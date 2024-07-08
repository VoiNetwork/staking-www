import "./LeftPanel.scss";
import { Tab, Tabs } from "@mui/material";
import { useLocation } from "react-router-dom";
import { ReactElement } from "react";
import {
  AdfScannerOutlined,
  AdjustOutlined,
  HomeOutlined,
  Payments,
  SettingsOutlined,
} from "@mui/icons-material";
import logo from "../../assets/images/full-logo.png";

function LeftPanel(): ReactElement {
  const location = useLocation();

  let route: any = location.pathname;
  route = route.substring(1);
  route = route.split("/");
  route = route[0];

  const routes = ["overview", "stake", "deposit", "withdraw", "config"];
  if (routes.indexOf(route) === -1) {
    route = false;
  }

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
            <Tab
              label="Overview"
              value="overview"
              iconPosition="start"
              component="a"
              href={`#/overview`}
              icon={<HomeOutlined></HomeOutlined>}
            />
            <Tab
              label="Stake"
              value="stake"
              iconPosition="start"
              component="a"
              href={`#/stake`}
              icon={<AdjustOutlined></AdjustOutlined>}
            />
            <Tab
              label="Deposit"
              value="deposit"
              iconPosition="start"
              component="a"
              href={`#/deposit`}
              icon={<AdfScannerOutlined></AdfScannerOutlined>}
            />
            <Tab
              label="Withdraw"
              value="withdraw"
              iconPosition="start"
              component="a"
              href={`#/withdraw`}
              icon={<Payments></Payments>}
            />
            <Tab
              label="Config"
              value="config"
              iconPosition="start"
              component="a"
              href={`#/config`}
              icon={<SettingsOutlined></SettingsOutlined>}
            />
          </Tabs>
        </div>
      </div>
    </div>
  );
}

export default LeftPanel;
