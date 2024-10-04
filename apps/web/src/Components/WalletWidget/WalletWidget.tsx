import React, { ReactElement, useState } from "react";
import "./WalletWidget.scss";
import { Button, ListItemText, Menu, MenuItem } from "@mui/material";
import { useWallet } from "@txnlab/use-wallet-react";
import { ArrowDropDown, Wallet } from "@mui/icons-material";
import { copyContent, ellipseString } from "@repo/utils";
import ConnectWallet from "./ConnectWallet/ConnectWallet";
import { BlockPackExplorer, CoreNode } from "@repo/algocore";
import { RootState } from "../../Redux/store";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

function WalletWidget(): ReactElement {
  const navigate = useNavigate();
  const [menuAnchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const { activeAccount, activeWallet } = useWallet();
  const [isConnectWalletVisible, setConnectWalletVisibility] =
    useState<boolean>(false);

  const { genesis, health, versionsCheck, status, ready } = useSelector(
    (state: RootState) => state.node
  );
  const coreNodeInstance = new CoreNode(
    status,
    versionsCheck,
    genesis,
    health,
    ready
  );

  function closeMenu() {
    setAnchorEl(null);
  }

  return (
    <div className="wallet-widget-wrapper">
      <div className="wallet-widget-container">
        <div>
          {activeAccount ? (
            <div>
              <Button
                variant="outlined"
                color="primary"
                className="blacffk-button !hidden sm:!flex"
                endIcon={<ArrowDropDown></ArrowDropDown>}
                onClick={(ev) => {
                  setAnchorEl(ev.currentTarget);
                }}
              >
                {ellipseString(activeAccount.address, 15)}
              </Button>
              <Button
                variant="outlined"
                color="primary"
                className="blacffk-button sm:!hidden"
                endIcon={<ArrowDropDown></ArrowDropDown>}
                onClick={(ev) => {
                  setAnchorEl(ev.currentTarget);
                }}
              >
                {ellipseString(activeAccount.address, 5)}
              </Button>
              <Menu
                anchorEl={menuAnchorEl}
                className="classic-menu"
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
                    transform: "translateX(0px) translateY(5px) !important",
                  },
                }}
                onClose={closeMenu}
              >
                <MenuItem
                  onClick={(ev) => {
                    ev.stopPropagation();
                    ev.preventDefault();
                    closeMenu();
                    new BlockPackExplorer(coreNodeInstance).openAddress(
                      activeAccount.address
                    );
                  }}
                >
                  <ListItemText disableTypography>
                    View in explorer
                  </ListItemText>
                </MenuItem>
                <MenuItem
                  onClick={(e) => {
                    copyContent(e, activeAccount.address);
                    closeMenu();
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                >
                  <ListItemText disableTypography>Copy address</ListItemText>
                </MenuItem>
                <MenuItem
                  onClick={(ev) => {
                    ev.stopPropagation();
                    ev.preventDefault();
                    closeMenu();
                    setConnectWalletVisibility(true);
                  }}
                >
                  <ListItemText disableTypography>Switch wallet</ListItemText>
                </MenuItem>
                <MenuItem
                  onClick={async (ev) => {
                    ev.preventDefault();
                    ev.stopPropagation();
                    closeMenu();
                    await activeWallet?.disconnect();
                  }}
                >
                  <ListItemText disableTypography>Disconnect</ListItemText>
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
                color="primary"
                startIcon={<Wallet></Wallet>}
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
            navigate("/overview");
          }}
        ></ConnectWallet>
      </div>
    </div>
  );
}

export default WalletWidget;
