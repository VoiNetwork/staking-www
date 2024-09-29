import React, { ReactElement, useEffect, useMemo, useState } from "react";
import "./Lockup.scss";
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  FormControl,
  FormHelperText,
  FormLabel,
  Grid,
  Input,
  InputAdornment,
  MenuItem,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import { Close } from "@mui/icons-material";
import { ModalGrowTransition } from "@repo/theme";
import { AccountData, CoreStaker } from "@repo/voix";
import voiStakingUtils from "../../../utils/voiStakingUtils";
import { waitForConfirmation } from "@algorandfoundation/algokit-utils";
import { useWallet } from "@txnlab/use-wallet-react";
import { useLoader, useSnackbar } from "@repo/ui";
import humanizeDuration from "humanize-duration";
import { useSelector } from "react-redux";
import { RootState, useAppDispatch } from "../../../Redux/store";
import { NumericFormat } from "react-number-format";
import algosdk, { algosToMicroalgos, microalgosToAlgos } from "algosdk";
import { CoreAccount, NodeClient, ZERO_ADDRESS_STRING } from "@repo/algocore";
import { loadAvailableBalance } from "@/Redux/staking/userReducer";

const StakingBreakdown = ({
  stakeAmount,
  lockupDuration,
  vestingDuration,
  stakeableAmount,
}) => {
  return (
    <div
      style={{
        //width: "350px",
        border: "1px solid #ccc",
        padding: "20px",
        borderRadius: "8px",
        backgroundColor: "#f9f9f9",
      }}
    >
      <h2 style={{ textAlign: "center" }}>Staking Breakdown</h2>
      <hr />
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: "10px",
        }}
      >
        <span>Stake Amount:</span>
        <span>{stakeAmount.toFixed(3)} VOI</span>
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: "10px",
        }}
      >
        <span>Lockup Duration:</span>
        <span>{lockupDuration}</span>
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: "10px",
        }}
      >
        <span>Vesting Duration:</span>
        <span>{vestingDuration}</span>
      </div>
      <hr />
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontWeight: "bold",
        }}
      >
        <span>
          Stakeable Amount&nbsp;
          <sup style={{ fontSize: "10px", color: "darkgray" }}>1:</sup>
        </span>
        <span>{stakeableAmount.toFixed(3)} VOI</span>
      </div>
      <div style={{ marginTop: "10px", color: "darkgray" }}>
        <sup style={{ fontSize: "10px" }}>1</sup>
        {` `}
        <span style={{ color: "darkgray", fontSize: "12px" }}>
          Actual amount may vary depending on conditions of staking program
        </span>
      </div>
    </div>
  );
};

const CostBreakdown = ({ stakeAmount, txnCost }) => {
  const totalCost = (stakeAmount + txnCost).toFixed(4);

  return (
    <div
      style={{
        //width: "300px",
        border: "1px solid #ccc",
        padding: "20px",
        borderRadius: "8px",
        backgroundColor: "#f9f9f9",
      }}
    >
      <h2 style={{ textAlign: "center" }}>Token Transfer Breakdown</h2>
      <hr />
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginTop: "10px",
          marginBottom: "10px",
        }}
      >
        <span>Stake Amount:</span>
        <span>{stakeAmount.toFixed(4)} VOI</span>
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: "10px",
        }}
      >
        <span>Transcation Costs:</span>
        <span>{txnCost.toFixed(4)} VOI</span>
      </div>
      <hr />
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontWeight: "900",
        }}
      >
        <span>Total Tokens Transfered:</span>
        <span>{totalCost} VOI</span>
      </div>
    </div>
  );
};

const CTC_INFO_STAKING_FACTORY = 295512; // staking factory apid
const ADDR_STAKING_FUNDER =
  "FYWCMNT4URFQ4VTQ746KBJDMD53VELRRLBJXRKONC6BFF5XIOYLLQPQILU";

const formatNumber = (number: number): string => {
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    compactDisplay: "short",
    maximumFractionDigits: 1,
  }).format(number);
};

interface LockupProps {
  show: boolean;
  onClose: () => void;
  address: string;
  onSuccess: () => void;
  rate: (period: number) => number;
}

const txnCost = (1.3455 + 0.5) * 1e6;

function Lockup({
  show,
  onClose,
  address,
  onSuccess,
  rate,
}: LockupProps): ReactElement {
  const { transactionSigner, activeAccount, signTransactions } = useWallet();

  const dispatch = useAppDispatch();

  const [amount, setAmount] = useState<string>("");

  const { availableBalance } = useSelector((state: RootState) => state.user);
  useEffect(() => {
    if (!activeAccount) return;
    dispatch(loadAvailableBalance(activeAccount.address));
  }, [activeAccount]);

  console.log({ availableBalance });

  const [accountInfo, setAccountInfo] = useState<any>(null);
  useEffect(() => {
    if (activeAccount) {
      const algod = voiStakingUtils.network.getAlgodClient();
      algod
        .accountInformation(address)
        .do()
        .then((account: any) => {
          setAccountInfo(account);
        });
    }
  }, [activeAccount]);

  console.log({ accountInfo });

  const { showException, showSnack } = useSnackbar();
  const { showLoader, hideLoader } = useLoader();

  const periodLimit = 17;

  const [period, setPeriod] = useState<string>("0");

  function handleClose() {
    onClose();
    resetState();
  }

  function resetState() {
    setPeriod("0");
  }

  async function lockup() {
    if (!activeAccount) {
      return;
    }
    try {
      showLoader("Opting for lockup");
      const algod = voiStakingUtils.network.getAlgodClient();
      const txns = await CoreStaker.create(
        algod,
        CTC_INFO_STAKING_FACTORY,
        {
          amount: algosToMicroalgos(Number(amount)),
          funder: ADDR_STAKING_FUNDER,
          owner: activeAccount.address,
          delegate: ZERO_ADDRESS_STRING,
          period: Number(period),
        },
        {
          addr: address,
          signer: transactionSigner,
        }
      );
      const stxns: any = await signTransactions(
        txns.map((t) => new Uint8Array(Buffer.from(t, "base64")))
      );
      const { txId } = await algod.sendRawTransaction(stxns).do();
      const { confirmedRound } = await waitForConfirmation(txId, 20, algod);
      await new Promise((resolve) => setTimeout(resolve, 8000)); // TODO replace with indexer confirmation
      showSnack("Transaction successful", "success");
      onSuccess();
    } catch (e) {
      showException(e);
    } finally {
      hideLoader();
    }
  }

  const error = useMemo(() => {
    if (availableBalance <= txnCost) return false;
    return (
      amount !== "" &&
      (isNaN(Number(amount)) ||
        Number(amount) <= 0 ||
        Number(amount) > microalgosToAlgos(availableBalance - txnCost))
    );
  }, [amount]);

  const errorMessage = useMemo(() => {
    if (availableBalance <= txnCost) return "No balance available";
    if (error) {
      if (isNaN(Number(amount))) {
        return "Please enter a valid number";
      } else if (Number(amount) <= 0) {
        return "Please enter a positive number";
      } else if (
        Number(amount) > microalgosToAlgos(availableBalance - txnCost)
      ) {
        return `Insufficient balance (Min: ${microalgosToAlgos(txnCost)} VOI)`;
      }
    }
    return "";
  }, [amount, error]);

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
          maxWidth={"sm"}
          sx={{
            ".MuiPaper-root": {
              width: "500px",
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
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
                    <h6>Step 1: Specify stake amount</h6>
                  </Grid>
                  <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
                    {/* add text input for stake amount */}
                    <FormControl fullWidth variant="outlined">
                      <FormLabel className="classic-label">Amount</FormLabel>
                      <Input
                        disabled={availableBalance <= txnCost}
                        error={error}
                        value={amount}
                        onChange={(e: any) => {
                          setAmount(e.target.value);
                        }}
                        className="classic-input"
                        type="number"
                        endAdornment={
                          <InputAdornment position="end">VOI</InputAdornment>
                        }
                        aria-describedby="input-error-text"
                      />
                      {error && (
                        <FormHelperText id="input-error-text">
                          {errorMessage}
                        </FormHelperText>
                      )}

                      {
                        <Box
                          mt={1}
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                          }}
                        >
                          <Typography variant="caption">
                            {accountInfo &&
                            availableBalance >= txnCost &&
                            algosToMicroalgos(Number(amount)) <=
                              availableBalance - txnCost ? (
                              <NumericFormat
                                value={Math.max(
                                  0,
                                  microalgosToAlgos(availableBalance - txnCost)
                                )}
                                suffix=" VOI available"
                                displayType={"text"}
                                thousandSeparator={true}
                                decimalScale={6}
                              ></NumericFormat>
                            ) : (
                              `Insufficient balance (Min: ${microalgosToAlgos(txnCost)} VOI)`
                            )}
                          </Typography>
                          {activeAccount && availableBalance > txnCost ? (
                            <Button
                              size="small"
                              variant="text"
                              color="primary"
                              onClick={() => {
                                setAmount(
                                  microalgosToAlgos(
                                    availableBalance - txnCost
                                  ).toString()
                                );
                              }}
                            >
                              Max
                            </Button>
                          ) : null}
                        </Box>
                      }
                    </FormControl>
                  </Grid>
                  {/*<Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
                    <FormControl fullWidth variant="outlined">
                      <FormLabel className="classic-label">Selection</FormLabel>
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
                          (_, i) => i
                        ).map((dec) => {
                          return (
                            <MenuItem value={dec} key={dec}>
                              {dec}
                            </MenuItem>
                          );
                        })}
                      </Select>
                    </FormControl>
                      </Grid>*/}
                  <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
                    <h6>Step 2: Choose lockup</h6>
                  </Grid>
                  <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
                    <Table>
                      <TableHead>
                        <tr>
                          <th>Lockup</th>
                          <th>Vesting</th>
                          <th>Rate</th>
                          <th>Total</th>
                        </tr>
                      </TableHead>
                      <TableBody>
                        {new Array(periodLimit + 1).fill(0).map((_, i) => {
                          return (
                            <TableRow
                              selected={
                                availableBalance > txnCost &&
                                i === Number(period) &&
                                !error
                              }
                              hover={true}
                              onClick={() => {
                                if (availableBalance <= txnCost || error)
                                  return;
                                setPeriod(i.toString());
                              }}
                            >
                              <TableCell>
                                {humanizeDuration(
                                  (i + 1) *
                                    1 * // lockup delay
                                    2_630_000 * // period seconds
                                    1000,
                                  { units: ["mo"], round: true }
                                )}
                              </TableCell>
                              <TableCell>
                                {humanizeDuration(
                                  Math.min(i + 1, 12) * 2630000 * 1000,
                                  {
                                    units: ["mo"],
                                    round: true,
                                  }
                                )}
                              </TableCell>
                              <TableCell>
                                {(rate(i + 1) * 100).toFixed(2)}%
                              </TableCell>
                              <TableCell>
                                {!error && Number(amount) > 0 ? (
                                  <NumericFormat
                                    value={((amt, r) => amt + r * amt)(
                                      Number(amount),
                                      rate(i + 1)
                                    )}
                                    //suffix=" Voi"
                                    displayType={"text"}
                                    thousandSeparator={true}
                                    decimalScale={6}
                                  ></NumericFormat>
                                ) : (
                                  "-"
                                )}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </Grid>
                  <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
                    <h6>Step 3: Confirm lockup</h6>
                  </Grid>
                  <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
                    <StakingBreakdown
                      stakeAmount={Number(amount)}
                      lockupDuration={humanizeDuration(
                        2630000 * (Number(period) + 1) * 1000,
                        {
                          units: ["mo"],
                          round: true,
                        }
                      )}
                      vestingDuration={humanizeDuration(
                        Math.min(Number(period) + 1, 12) * 2630000 * 1000,
                        {
                          units: ["mo"],
                          round: true,
                        }
                      )}
                      stakeableAmount={
                        !error && Number(amount) > 0
                          ? ((amt, r) => amt + r * amt)(
                              Number(amount),
                              rate(Number(period) + 1)
                            )
                          : 0
                      }
                    />
                  </Grid>
                  <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
                    <h6>Step 4: Confirm token transfer</h6>
                  </Grid>
                  <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
                    <CostBreakdown
                      stakeAmount={Number(amount)}
                      txnCost={microalgosToAlgos(txnCost)}
                    />
                  </Grid>
                  <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
                    <Button
                      disabled={txnCost >= availableBalance || error || !amount}
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
