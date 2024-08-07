import { ReactElement, useState } from "react";
import "./Lockup.scss";
import {
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  FormControl,
  FormLabel,
  Grid,
  MenuItem,
  Select,
} from "@mui/material";
import { Close } from "@mui/icons-material";
import { ModalGrowTransition } from "@repo/theme";
import { AccountData, CoreStaker } from "@repo/voix";
import voiStakingUtils from "../../../utils/voiStakingUtils";
import { waitForConfirmation } from "@algorandfoundation/algokit-utils";
import { useWallet } from "@txnlab/use-wallet-react";
import { useLoader, useSnackbar } from "@repo/ui";

interface LockupProps {
  show: boolean;
  onClose: () => void;
  accountData: AccountData;
  address: string;
  onSuccess: () => void;
}

function Lockup({
  show,
  onClose,
  accountData,
  address,
  onSuccess,
}: LockupProps): ReactElement {
  const { transactionSigner } = useWallet();

  const { showException, showSnack } = useSnackbar();
  const { showLoader, hideLoader } = useLoader();

  const periodLimit = new CoreStaker(accountData).lockupPeriodLimit();

  const [period, setPeriod] = useState<string>("0");

  function handleClose() {
    onClose();
    resetState();
  }

  function resetState() {
    setPeriod("0");
  }

  async function lockup() {
    try {
      showLoader("Opting for lockup");
      const txn = await new CoreStaker(accountData).lock(
        voiStakingUtils.network.getAlgodClient(),
        Number(period),
        {
          addr: address,
          signer: transactionSigner,
        },
      );
      await waitForConfirmation(
        txn.txID(),
        20,
        voiStakingUtils.network.getAlgodClient(),
      );
      showSnack("Transaction successful", "success");

      onSuccess();
    } catch (e) {
      showException(e);
    } finally {
      hideLoader();
    }
  }

  return (
    <div>
      {show ? (
        <Dialog
          onClose={handleClose}
          fullWidth
          open={show}
          TransitionComponent={ModalGrowTransition}
          transitionDuration={400}
          className="classic-modal round"
          maxWidth={"xs"}
          sx={{
            ".MuiPaper-root": {
              width: "300px",
            },
          }}
        >
          <DialogTitle>
            <div>Lockup</div>
            <div>
              <Close onClick={handleClose} className="close-modal" />
            </div>
          </DialogTitle>
          <DialogContent>
            <div className="lockup-wrapper">
              <div className="lockup-container">
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
                    <FormControl fullWidth variant="outlined">
                      <FormLabel className="classic-label">Period</FormLabel>
                      <Select
                        className="classic-select"
                        value={period}
                        onChange={(ev) => {
                          setPeriod(ev.target.value);
                        }}
                        fullWidth
                        color={"primary"}
                      >
                        {Array.from(
                          { length: periodLimit + 1 },
                          (_, i) => i,
                        ).map((dec) => {
                          return (
                            <MenuItem value={dec} key={dec}>
                              {dec}
                            </MenuItem>
                          );
                        })}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
                    {Number(period) === 0 ? (
                      <div>--None--</div>
                    ) : (
                      <div>
                        {new CoreStaker(accountData).getPeriodInDuration(
                          Number(period),
                        )}
                      </div>
                    )}
                  </Grid>
                  <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
                    <Button
                      sx={{ marginTop: "20px" }}
                      variant={"contained"}
                      fullWidth
                      color={"primary"}
                      size={"large"}
                      onClick={lockup}
                    >
                      Confirm
                    </Button>
                  </Grid>
                </Grid>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      ) : (
        ""
      )}
    </div>
  );
}

export default Lockup;
