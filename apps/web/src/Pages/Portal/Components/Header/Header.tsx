import { ReactElement, useState } from "react";
import "./Header.scss";
import {
  Button,
  Grid,
  Link,
  ListItemText,
  Menu,
  MenuItem,
  Tab,
  Tabs,
} from "@mui/material";
import { useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "../../../../Redux/store";
import { CoreNode } from "@repo/algocore";
import { useWallet } from "@txnlab/use-wallet";
import { ArrowDropDown, Wallet } from "@mui/icons-material";
import { copyContent, ellipseString } from "@repo/utils";
import { Explorer } from "@repo/algocore/src/explorer/explorer";
import ConnectWallet from "../ConnectWallet/ConnectWallet";
import { GreyColors } from "@repo/theme";

export const mainMenu = {
  ".MuiPaper-root": {
    boxShadow:
      "0px 5px 5px -3px rgb(0 0 0 / 20%), 0px 8px 10px 1px rgb(0 0 0 / 14%), 0px 3px 14px 2px rgb(0 0 0 / 12%) !important",
  },
};

export const primaryMenu = {
  fontSize: "14px",
  color: GreyColors.FormLabel,
  svg: {
    color: GreyColors.FormLabel,
  },
};

function Header(): ReactElement {
  const location = useLocation();

  let route: string | boolean = location.pathname;
  route = route.substring(1);
  if (route) {
    route = route.split("/")[1] || "";

    const routes = ["overview", "stake", "deposit", "withdraw", "config"];
    if (routes.indexOf(route) === -1) {
      route = false;
    }
  }

  const { genesis, health, versionsCheck, status } = useSelector(
    (state: RootState) => state.node,
  );
  const coreNodeInstance = new CoreNode(status, versionsCheck, genesis, health);

  const [menuAnchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const { activeAccount, providers } = useWallet();

  const activeProvider = providers?.find((provider) => {
    return provider.isConnected;
  });

  const [isConnectWalletVisible, setConnectWalletVisibility] =
    useState<boolean>(false);

  function closeMenu() {
    setAnchorEl(null);
  }

  return (
    <div className="header-wrapper">
      <div className="header-container">
        <Grid container spacing={0}>
          <Grid item xs={2} sm={2} md={2} lg={2} xl={2}>
            <div className="logo">
              <div className="logo-container hover">
                <Link href="/">VoiX</Link>
              </div>
            </div>
          </Grid>
          <Grid item xs={8} sm={8} md={8} lg={8} xl={8}>
            <div className="tool-bar">
              <div>
                <Tabs
                  value={route}
                  className="explorer-tabs"
                  orientation="horizontal"
                  indicatorColor={"primary"}
                  textColor="secondary"
                  TabIndicatorProps={{
                    children: <span className="MuiTabs-indicatorSpan" />,
                  }}
                >
                  <Tab
                    label="Overview"
                    value="overview"
                    component="a"
                    href={`/#/portal/overview`}
                  />
                  <Tab
                    label="Stake"
                    value="stake"
                    component="a"
                    href={`/#/portal/stake`}
                  />
                  <Tab
                    label="Deposit"
                    value="deposit"
                    component="a"
                    href={`/#/portal/deposit`}
                  />
                  <Tab
                    label="Withdraw"
                    value="withdraw"
                    component="a"
                    href={`/#/portal/withdraw`}
                  />
                  <Tab
                    label="Config"
                    value="config"
                    component="a"
                    href={`/#/portal/config`}
                  />
                </Tabs>
              </div>
            </div>
          </Grid>
          <Grid item xs={2} sm={2} md={2} lg={2} xl={2}>
            <div className="actions">
              <div>
                {activeAccount ? (
                  <div>
                    <Button
                      variant="contained"
                      className="grey-button"
                      endIcon={<ArrowDropDown></ArrowDropDown>}
                      color="primary"
                      onClick={(ev) => {
                        setAnchorEl(ev.currentTarget);
                      }}
                    >
                      {activeProvider ? (
                        <img
                          className="provider-logo"
                          src={activeProvider.metadata.icon}
                          alt="provider-logo"
                        />
                      ) : (
                        ""
                      )}
                      {ellipseString(activeAccount.address, 15)}
                    </Button>
                    <Menu
                      anchorEl={menuAnchorEl}
                      sx={mainMenu}
                      open={Boolean(menuAnchorEl)}
                      disableAutoFocusItem={true}
                      anchorOrigin={{
                        vertical: "bottom",
                        horizontal: "right",
                      }}
                      transformOrigin={{
                        vertical: "top",
                        horizontal: "right",
                      }}
                      PaperProps={{
                        sx: {
                          transform:
                            "translateX(0px) translateY(5px) !important",
                        },
                      }}
                      onClose={closeMenu}
                    >
                      <MenuItem
                        sx={primaryMenu}
                        onClick={(ev) => {
                          new Explorer(coreNodeInstance).openAddress(
                            activeAccount?.address,
                          );
                          ev.stopPropagation();
                          ev.preventDefault();
                          closeMenu();
                        }}
                      >
                        <ListItemText disableTypography>
                          View in explorer
                        </ListItemText>
                      </MenuItem>
                      <MenuItem
                        sx={primaryMenu}
                        onClick={(e) => {
                          copyContent(e, activeAccount.address);
                          closeMenu();
                          e.preventDefault();
                          e.stopPropagation();
                        }}
                      >
                        <ListItemText disableTypography>
                          Copy address
                        </ListItemText>
                      </MenuItem>
                      <MenuItem
                        sx={primaryMenu}
                        onClick={(ev) => {
                          setConnectWalletVisibility(true);
                          ev.stopPropagation();
                          ev.preventDefault();
                          closeMenu();
                        }}
                      >
                        <ListItemText disableTypography>
                          Switch wallet
                        </ListItemText>
                      </MenuItem>
                      <MenuItem
                        sx={primaryMenu}
                        onClick={(ev) => {
                          providers?.forEach(async (provider) => {
                            if (
                              provider.metadata.id === activeAccount.providerId
                            ) {
                              await provider.disconnect();
                              setConnectWalletVisibility(false);
                            }
                          });
                          ev.preventDefault();
                          ev.stopPropagation();
                          closeMenu();
                        }}
                      >
                        <ListItemText disableTypography>
                          Disconnect
                        </ListItemText>
                      </MenuItem>
                    </Menu>
                  </div>
                ) : (
                  ""
                )}
              </div>
              <div>
                {activeAccount ? (
                  <div></div>
                ) : (
                  <div>
                    <Button
                      variant="contained"
                      className="purple-button"
                      startIcon={<Wallet></Wallet>}
                      color="primary"
                      onClick={() => {
                        setConnectWalletVisibility(true);
                      }}
                    >
                      Connect wallet
                    </Button>
                  </div>
                )}
              </div>
              <ConnectWallet
                show={isConnectWalletVisible}
                onClose={() => {
                  setConnectWalletVisibility(false);
                }}
              ></ConnectWallet>
            </div>
          </Grid>
        </Grid>
      </div>
    </div>
  );
}

export default Header;
