import "./ConnectWallet.scss";
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
import CloseIcon from "@mui/icons-material/Close";
import { useWallet } from "@txnlab/use-wallet";
import { ModalGrowTransition } from "@repo/theme";

interface ConnectWalletProps {
  show: boolean;
  onClose?: () => void;
}

function ConnectWallet({
  show = false,
  onClose,
}: ConnectWalletProps): JSX.Element {
  const { providers, activeAccount } = useWallet();

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
          className="connect-wallet custom-modal"
          TransitionComponent={ModalGrowTransition}
          transitionDuration={400}
        >
          <DialogTitle>
            <div className="header">
              <div>
                <div className="title">Connect wallet</div>
              </div>
              <CloseIcon
                className="modal-close-button hover"
                onClick={handleClose}
              />
            </div>
          </DialogTitle>
          <DialogContent>
            <div className="connect-wallet-wrapper">
              <div className="connect-wallet-container">
                <div className="connect-wallet-body">
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
                      {providers?.map((provider) => (
                        <div
                          key={provider.metadata.id}
                          className={`provider ${
                            provider.isActive ? "selected" : ""
                          }`}
                        >
                          <div className="provider-meta">
                            <div>
                              <h4>
                                <img
                                  className="icon"
                                  alt={`${provider.metadata.name} icon`}
                                  src={provider.metadata.icon}
                                />
                                {provider.metadata.name}
                              </h4>
                            </div>
                            <div>
                              {provider.isConnected ? (
                                <Button
                                  onClick={provider.disconnect}
                                  variant={"outlined"}
                                  color="error"
                                  size={"small"}
                                >
                                  Disconnect
                                </Button>
                              ) : (
                                ""
                              )}
                              {!provider.isConnected ? (
                                <Button
                                  className="grey-button"
                                  sx={{ width: "100px" }}
                                  onClick={provider.connect}
                                  variant={"contained"}
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

                          {provider.isActive && provider.accounts.length > 0 ? (
                            <div className="provider-wallets">
                              <Select
                                //sx={selectBoxStyling}
                                value={activeAccount?.address}
                                onChange={(e) => {
                                  provider.setActiveAccount(e.target.value);
                                }}
                                color={"primary"}
                                className="classic-select"
                              >
                                {provider.accounts.map((account) => {
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
