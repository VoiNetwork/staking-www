import { ReactElement, useState } from "react";
import "./Register.scss";
import {
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  FormControl,
  FormLabel,
  Grid,
} from "@mui/material";
import { Close } from "@mui/icons-material";
import { ModalGrowTransition, ShadedInput } from "@repo/theme";
import { AccountData, CoreStaker } from "@repo/voix";
import voiStakingUtils from "../../../utils/voiStakingUtils";
import { waitForConfirmation } from "@algorandfoundation/algokit-utils";
import { useWallet } from "@txnlab/use-wallet-react";
import { useLoader, useSnackbar } from "@repo/ui";
import { isNumber } from "@repo/utils";
import party from "party-js";
import algosdk from "algosdk";

interface RegisterProps {
  show: boolean;
  onClose: () => void;
  //accountData: AccountData;
  address: string;
  onSuccess: (id: string) => void;
}

function Register({
  show,
  onClose,
  //accountData,
  address,
  onSuccess,
}: RegisterProps): ReactElement {
  const { transactionSigner } = useWallet();

  const { showException, showSnack } = useSnackbar();
  const { showLoader, hideLoader } = useLoader();

  const [selectionKey, setSelectionKey] = useState<string>("");
  const [stateProofKey, setStateProofKey] = useState<string>("");

  const [voteKey, setVoteKey] = useState<string>("");
  const [voteKeyDilution, setVoteKeyDilution] = useState<string>("");

  const [voteFirst, setVoteFirst] = useState<string>("");
  const [voteLast, setVoteLast] = useState<string>("");

  function handleClose() {
    onClose();
  }

  async function register() {
    if (!selectionKey) {
      showSnack("Invalid selection key", "error");
      return;
    }

    if (!stateProofKey) {
      showSnack("Invalid state proof key", "error");
      return;
    }

    if (!voteKey) {
      showSnack("Invalid vote key", "error");
      return;
    }

    if (!voteKeyDilution || !isNumber(voteKeyDilution)) {
      showSnack("Invalid vote key dilution", "error");
      return;
    }
    if (!voteFirst || !isNumber(voteFirst)) {
      showSnack("Invalid vote first valid", "error");
      return;
    }

    if (!voteLast || !isNumber(voteLast)) {
      showSnack("Invalid vote last valid", "error");
      return;
    }

    try {
      showLoader("Registering your participation key");
      const atc = new algosdk.AtomicTransactionComposer();
      const algodClient = voiStakingUtils.network.getAlgodClient();
      const suggestedParams = await algodClient.getTransactionParams().do();
      const keyRegTxn =
        algosdk.makeKeyRegistrationTxnWithSuggestedParamsFromObject({
          from: address,
          selectionKey: new Uint8Array(Buffer.from(selectionKey, "base64")),
          stateProofKey: new Uint8Array(Buffer.from(stateProofKey, "base64")),
          voteKey: new Uint8Array(Buffer.from(voteKey, "base64")),
          voteFirst: Number(voteFirst),
          voteLast: Number(voteLast),
          voteKeyDilution: Number(voteKeyDilution),
          suggestedParams,
          note: new Uint8Array(Buffer.from("voix:uparticipate1")),
        });
      atc.addTransaction({ txn: keyRegTxn, signer: transactionSigner });
      const {
        txIDs: [txnId],
      } = await atc.execute(algodClient, 4);
      party.confetti(document.body, {
        count: party.variation.range(200, 300),
        size: party.variation.range(1, 1.4),
      });
      onSuccess(txnId);
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
              width: "400px",
            },
          }}
        >
          <DialogTitle>
            <div>Register</div>
            <div>
              <Close onClick={handleClose} className="close-modal" />
            </div>
          </DialogTitle>
          <DialogContent>
            <div className="register-wrapper">
              <div className="register-container">
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
                    <FormControl fullWidth variant="outlined">
                      <FormLabel className="classic-label">
                        Selection key
                      </FormLabel>
                      <ShadedInput
                        value={selectionKey}
                        onChange={(ev) => {
                          setSelectionKey(ev.target.value);
                        }}
                        multiline
                        rows={2}
                        fullWidth
                      />
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
                    <FormControl fullWidth variant="outlined">
                      <FormLabel className="classic-label">
                        State proof key
                      </FormLabel>
                      <ShadedInput
                        value={stateProofKey}
                        onChange={(ev) => {
                          setStateProofKey(ev.target.value);
                        }}
                        multiline
                        rows={3}
                        fullWidth
                      />
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
                    <FormControl fullWidth variant="outlined">
                      <FormLabel className="classic-label">Vote key</FormLabel>
                      <ShadedInput
                        value={voteKey}
                        onChange={(ev) => {
                          setVoteKey(ev.target.value);
                        }}
                        multiline
                        rows={2}
                        fullWidth
                      />
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
                    <FormControl fullWidth variant="outlined">
                      <FormLabel className="classic-label">
                        Vote key dilution
                      </FormLabel>
                      <ShadedInput
                        value={voteKeyDilution}
                        onChange={(ev) => {
                          setVoteKeyDilution(ev.target.value);
                        }}
                        fullWidth
                      />
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
                    <FormControl fullWidth variant="outlined">
                      <FormLabel className="classic-label">
                        Vote first valid
                      </FormLabel>
                      <ShadedInput
                        value={voteFirst}
                        onChange={(ev) => {
                          setVoteFirst(ev.target.value);
                        }}
                        fullWidth
                      />
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
                    <FormControl fullWidth variant="outlined">
                      <FormLabel className="classic-label">
                        Vote last valid
                      </FormLabel>
                      <ShadedInput
                        value={voteLast}
                        onChange={(ev) => {
                          setVoteLast(ev.target.value);
                        }}
                        fullWidth
                      />
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
                    <Button
                      sx={{ marginTop: "20px" }}
                      variant={"contained"}
                      fullWidth
                      color={"primary"}
                      size={"large"}
                      onClick={register}
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

export default Register;
