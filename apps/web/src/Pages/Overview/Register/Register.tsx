import React, { ReactElement, useState } from "react";
import "./Register.scss";
import {
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  FormControl,
  FormLabel,
  Grid,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
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
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ShellCommand from "@/Components/ShellCommand/ShellCommand";

interface RegisterProps {
  show: boolean;
  onClose: () => void;
  accountData: AccountData;
  address: string;
  onSuccess: (id: string) => void;
}

function Register({
  show,
  onClose,
  accountData,
  address,
  onSuccess,
}: RegisterProps): ReactElement {
  const { transactionSigner } = useWallet();

  const { showException, showSnack } = useSnackbar();
  const { showLoader, hideLoader } = useLoader();

  //const [participationId, setParticipationId] = useState<string>("");

  const [parentAddress, setParentAddress] = useState<string>(
    accountData.contractAddress
  );

  const [selectionKey, setSelectionKey] = useState<string>("");
  const [stateProofKey, setStateProofKey] = useState<string>("");

  const [voteKey, setVoteKey] = useState<string>("");
  const [voteKeyDilution, setVoteKeyDilution] = useState<string>("");

  const [voteFirst, setVoteFirst] = useState<string>("");
  const [voteLast, setVoteLast] = useState<string>("");

  function handleClose() {
    onClose();
    setExpanded(false);
  }

  const [expanded, setExpanded] = useState<boolean>(false);

  const handleAccordionChange = () => {
    setExpanded(!expanded);
  };

  async function register() {
    /*
    if(!participationId) {
      showSnack("Invalid participation ID", "error");
      return;
    }
    */

    if (!parentAddress) {
      showSnack("Invalid parent address", "error");
      return;
    }

    if (accountData.contractAddress !== parentAddress) {
      showSnack(
        "Invalid parent address (must match contract address)",
        "error"
      );
      return;
    }

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
      const txnId = await new CoreStaker(accountData).stake(
        voiStakingUtils.network.getAlgodClient(),
        {
          selK: new Uint8Array(Buffer.from(selectionKey, "base64")),
          spKey: new Uint8Array(Buffer.from(stateProofKey, "base64")),
          voteK: new Uint8Array(Buffer.from(voteKey, "base64")),
          voteKd: Number(voteKeyDilution),
          voteFst: Number(voteFirst),
          voteLst: Number(voteLast),
        },
        {
          addr: address,
          signer: transactionSigner,
        }
      );
      await waitForConfirmation(
        txnId,
        20,
        voiStakingUtils.network.getAlgodClient()
      );

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
          sx={
            {
              /*
            ".MuiPaper-root": {
              width: "400px",
            },
            */
            }
          }
        >
          <DialogTitle>
            <div>Earn Block Rewards</div>
            <div>
              <Close onClick={handleClose} className="close-modal" />
            </div>
          </DialogTitle>
          <DialogContent>
            <div className="register-wrapper">
              <div className="register-container">
                <ShellCommand
                  description="Run the Voi Swarm installation script again:"
                  command={`/bin/bash -c "$(curl -fsSL https://get.voi.network/swarm)"`}
                />
                <Typography
                  variant="body2"
                  sx={{ color: "rgb(128, 130, 133)" }}
                >
                  See also:{" "}
                  <a
                    style={{ color: "#6f2ae2", textDecoration: "none" }}
                    href="https://voinetwork.github.io/voi-swarm/operating/staking-program/"
                    target="_blank"
                  >
                    Staking with Voi Swarm
                  </a>
                </Typography>
                <Accordion
                  expanded={expanded}
                  onChange={handleAccordionChange}
                  sx={{
                    boxShadow: "none",
                    "&:before": {
                      display: "none",
                    },
                    "&.Mui-expanded": {
                      margin: 0,
                    },
                  }}
                >
                  <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls="panel1a-content"
                    id="panel1a-header"
                    sx={{
                      borderBottom: "none",
                      padding: 0,
                    }}
                  >
                    <Typography>Advanced</Typography>
                  </AccordionSummary>
                  <AccordionDetails sx={{ padding: "8px 0" }}>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
                        <ShellCommand
                          description="Generate a new participation key for contract account:"
                          command={`~/voi/bin/generate-participation-key ${accountData.contractAddress}`}
                        />
                        <Typography
                          variant="body2"
                          sx={{ color: "rgb(128, 130, 133)" }}
                        >
                          Make node of Participation Id for next step.
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
                        <ShellCommand
                          description="Get participation key info:"
                          command={`~/voi/bin/goal account partkeyinfo`}
                        />
                        <Typography
                          variant="body2"
                          sx={{ color: "rgb(128, 130, 133)" }}
                        >
                          Make sure Participation Id matches the one generated
                          above.
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
                        <Typography variant="h6" gutterBottom>
                          Enter participation key info:
                        </Typography>
                      </Grid>
                      {/*
                  <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
                    <FormControl fullWidth variant="outlined">
                      <FormLabel className="classic-label">
                        Participation ID:
                      </FormLabel>
                      <ShadedInput
                        value={selectionKey}
                        onChange={(ev) => {
                          //setSelectionKey(ev.target.value);
                        }}
                        multiline
                        rows={2}
                        fullWidth
                      />
                    </FormControl>
                  </Grid>
                  */}
                      <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
                        <FormControl fullWidth variant="outlined">
                          <FormLabel className="classic-label">
                            Parent address:
                          </FormLabel>
                          <ShadedInput
                            value={parentAddress}
                            onChange={(ev) => {
                              setParentAddress(ev.target.value);
                            }}
                            multiline
                            rows={2}
                            fullWidth
                          />
                        </FormControl>
                      </Grid>

                      <Grid item xs={12} sm={12} md={6} lg={4} xl={4}>
                        <FormControl fullWidth variant="outlined">
                          <FormLabel className="classic-label">
                            First round:
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
                      <Grid item xs={12} sm={4} md={4} lg={4} xl={4}>
                        <FormControl fullWidth variant="outlined">
                          <FormLabel className="classic-label">
                            Last round:
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
                      <Grid item xs={12} sm={4} md={4} lg={4} xl={4}>
                        <FormControl fullWidth variant="outlined">
                          <FormLabel className="classic-label">
                            Key dilution:
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
                            Selection key:
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
                            Voting key:
                          </FormLabel>
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
                            State proof key:
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
                  </AccordionDetails>
                </Accordion>
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
