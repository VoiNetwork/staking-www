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
import { ContractDetails, CoreStaker } from "@repo/voix";
import voiStakingUtils from "../../../utils/voiStakingUtils";
import { waitForConfirmation } from "@algorandfoundation/algokit-utils";
import { useWallet } from "@txnlab/use-wallet-react";
import { useLoader, useSnackbar } from "@repo/ui";

interface LockupProps {
  show: boolean;
  onClose: () => void;
  contractDetails: ContractDetails;
  address: string;
  onSuccess: () => void;
}

function Lockup({
  show,
  onClose,
  contractDetails,
  address,
  onSuccess,
}: LockupProps): ReactElement {
  const { transactionSigner } = useWallet();

  const { showException, showSnack } = useSnackbar();
  const { showLoader, hideLoader } = useLoader();

  const [decimals, setDecimals] = useState<string>("1");

  function handleClose() {
    onClose();
  }

  async function lockup() {
    try {
      showLoader("Opting for lockup");
      const txn = await new CoreStaker(contractDetails).lock(
        voiStakingUtils.network.getAlgodClient(),
        Number(decimals),
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
                      <FormLabel className="classic-label">Months</FormLabel>
                      <Select
                        className="classic-select"
                        value={decimals}
                        onChange={(ev) => {
                          setDecimals(ev.target.value);
                        }}
                        fullWidth
                        color={"primary"}
                      >
                        {Array.from({ length: 5 }, (_, i) => i + 1).map(
                          (dec) => {
                            return (
                              <MenuItem value={dec} key={dec}>
                                {dec}
                              </MenuItem>
                            );
                          },
                        )}
                      </Select>
                    </FormControl>
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
