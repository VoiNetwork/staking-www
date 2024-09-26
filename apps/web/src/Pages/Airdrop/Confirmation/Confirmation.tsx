import React, { ReactElement, useState } from "react";
import "./Confirmation.scss";
import {
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@mui/material";
import { Close } from "@mui/icons-material";
import { ModalGrowTransition } from "@repo/theme";
import { AccountData, CoreStaker } from "@repo/voix";
import voiStakingUtils from "../../../utils/voiStakingUtils";
import { waitForConfirmation } from "@algorandfoundation/algokit-utils";
import { useWallet } from "@txnlab/use-wallet-react";
import { useLoader, useSnackbar } from "@repo/ui";
import humanizeDuration from "humanize-duration";
import party from "party-js";

const formatNumber = (number: number): string => {
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    compactDisplay: "short",
    maximumFractionDigits: 1,
  }).format(number);
};

interface CompoundInterestProps {
  principal: number;
  rate: number;
  time: number;
  compoundingsPerYear: number;
}
const CompoundInterest: React.FC<CompoundInterestProps> = (
  props: CompoundInterestProps
) => {
  const r = props.rate / 100; // Convert percentage to decimal
  const A =
    props.principal *
    Math.pow(
      1 + r / props.compoundingsPerYear,
      props.compoundingsPerYear * props.time
    );

  return <div>{formatNumber(A)} VOI</div>;
};

interface LockupProps {
  show: boolean;
  onClose: () => void;
  accountData: AccountData;
  address: string;
  onSuccess: () => void;
}

function Confirmation({
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

  const [period, setPeriod] = useState<string>(
    String(accountData.global_period)
  );

  const rate = (period: number) => {
    switch (period) {
      case 1:
        return 10;
      case 2:
        return 12;
      case 3:
        return 15;
      case 4:
        return 18;
      case 5:
        return 20;
      default:
        return 0;
    }
  };

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
        }
      );
      await waitForConfirmation(
        txn.txID(),
        20,
        voiStakingUtils.network.getAlgodClient()
      );
      await new Promise((resolve) => setTimeout(resolve, 8000)); // TODO replace with indexer confirmation
      showSnack("Transaction successful", "success");
      party.confetti(document.body, {
        count: party.variation.range(200, 300),
        size: party.variation.range(1, 1.4),
      });
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
              width: "500px",
            },
          }}
        >
          <DialogTitle>
            <div>Confirmation</div>
            <div>
              <Close onClick={handleClose} className="close-modal" />
            </div>
          </DialogTitle>
          <DialogContent>
            <div className="lockup-wrapper">
              <div className="lockup-container">
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
                    <div>
                      Are you sure you want to lockup for{" "}
                      {humanizeDuration(
                        Number(accountData.global_period) *
                          Number(accountData.global_lockup_delay) *
                          Number(accountData.global_period_seconds) *
                          1000,
                        { units: ["y"], round: true }
                      )}
                    </div>
                  </Grid>
                  <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Lockup Period</TableCell>
                          {/*<TableCell>Rate</TableCell>*/}
                          {accountData?.global_initial !== "0" ? (
                            <TableCell sx={{ textAlign: "right" }}>
                              Receive
                            </TableCell>
                          ) : null}
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {new Array(periodLimit + 1).fill(0).map((_, i) => {
                          return (
                            <TableRow selected={i === Number(period)}>
                              <TableCell sx={{ p: 1 }}>
                                {humanizeDuration(
                                  i *
                                    Number(accountData?.global_lockup_delay) *
                                    Number(accountData?.global_period_seconds) *
                                    1000,
                                  { units: ["y"], round: true }
                                )}
                              </TableCell>
                              {accountData?.global_initial !== "0" ? (
                                <TableCell sx={{ textAlign: "right", p: 1 }}>
                                  <CompoundInterest
                                    principal={
                                      Number(accountData?.global_initial) / 1e6
                                    }
                                    time={i}
                                    rate={rate(i)}
                                    compoundingsPerYear={1}
                                  />
                                  <div
                                    style={{ color: "gray", fontSize: "12px" }}
                                  >
                                    <CompoundInterest
                                      principal={
                                        Number(accountData?.global_initial) /
                                        1e6
                                      }
                                      time={i}
                                      rate={rate(i)}
                                      compoundingsPerYear={1}
                                      difference={true}
                                      showPercentIncrease={true}
                                    />
                                  </div>
                                </TableCell>
                              ) : null}
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </Grid>
                  <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
                    {Number(period) === 0 ? (
                      <div>--None--</div>
                    ) : (
                      <div>
                        Lockup duration:{" "}
                        {new CoreStaker(accountData).getPeriodInDuration(
                          Number(period),
                          { units: ["y"], round: true }
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

export default Confirmation;
