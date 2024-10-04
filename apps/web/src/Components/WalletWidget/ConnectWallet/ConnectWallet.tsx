import "./ConnectWallet.scss";

import React, { ReactElement } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  MenuItem,
  Select,
} from "@mui/material";
import { useWallet } from "@txnlab/use-wallet-react";
import { ModalGrowTransition } from "@repo/theme";
import { Close } from "@mui/icons-material";

interface ConnectWalletProps {
  show: boolean;
  onClose?: () => void;
}

function ConnectWallet({
  show = false,
  onClose,
}: ConnectWalletProps): ReactElement {
  const { activeAccount, wallets } = useWallet();

  function handleClose() {
    if (onClose) {
      onClose();
    }
  }

  return (
    <div>
      {show ? (
        <Dialog
          onClose={handleClose}
          fullWidth={true}
          maxWidth={"xs"}
          open={show}
          className="connect-wallet classic-modal round"
          TransitionComponent={ModalGrowTransition}
          transitionDuration={400}
        >
          <DialogTitle>
            <div>Connect Wallet</div>
            <div>
              <Close onClick={handleClose} className="close-modal" />
            </div>
          </DialogTitle>
          <DialogContent>
            <div className="connect-wallet-wrapper">
              <div className="connect-wallet-container">
                <div className="connect-wallet-body">
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
                      {wallets?.map((wallet) => (
                        <div
                          key={wallet.id}
                          className={`wallet ${
                            wallet.isActive ? "selected" : ""
                          }`}
                        >
                          <div className="wallet-meta">
                            <div>
                              <h4>
                                <img
                                  className="icon"
                                  alt={`${wallet.metadata.name} icon`}
                                  src={wallet.metadata.icon}
                                />
                                {wallet.metadata.name}
                              </h4>
                            </div>
                            <div>
                              {wallet.isConnected ? (
                                <Button
                                  sx={{ width: "100px" }}
                                  onClick={wallet.disconnect}
                                  variant={"outlined"}
                                  color="error"
                                  size={"small"}
                                >
                                  Disconnect
                                </Button>
                              ) : (
                                ""
                              )}
                              {!wallet.isConnected ? (
                                <Button
                                  sx={{ width: "100px" }}
                                  onClick={() => {
                                    wallet.connect().then(() => {
                                      onClose && onClose();
                                    });
                                  }}
                                  variant={"outlined"}
                                  color="primary"
                                  size={"small"}
                                >
                                  Connect
                                </Button>
                              ) : (
                                ""
                              )}
                            </div>
                          </div>

                          {wallet.isActive && wallet.accounts.length > 0 ? (
                            <div className="wallet-accounts">
                              <Select
                                className="classic-select"
                                fullWidth
                                value={activeAccount?.address}
                                onChange={(e) => {
                                  wallet.setActiveAccount(e.target.value);
                                }}
                                color={"primary"}
                              >
                                {wallet.accounts.map((account) => {
                                  return (
                                    <MenuItem
                                      value={account.address}
                                      key={account.address}
                                    >
                                      {account.address}
                                    </MenuItem>
                                  );
                                })}
                              </Select>
                            </div>
                          ) : (
                            ""
                          )}
                        </div>
                      ))}
                    </Grid>
                  </Grid>
                </div>
              </div>
            </div>
          </DialogContent>
          <DialogActions></DialogActions>
        </Dialog>
      ) : (
        ""
      )}
    </div>
  );
}

export default ConnectWallet;
