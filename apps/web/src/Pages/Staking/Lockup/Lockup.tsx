import { ReactElement, useEffect, useMemo, useState } from "react";
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
import { RootState } from "../../../Redux/store";
import { NumericFormat } from "react-number-format";
import algosdk, { algosToMicroalgos, microalgosToAlgos } from "algosdk";
import { CoreAccount, NodeClient, ZERO_ADDRESS_STRING } from "@repo/algocore";

const CTC_INFO_STAKING_FACTORY = 87502365; // staking factory apid
const ADDR_STAKING_FUNDER =
  "BNERIHFXRPMF5RI4UQHMB6CFZ4RVXIBOJUNYEUXKDUSETECXDNGWLW5EOY";

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
  accountData: AccountData;
  address: string;
  onSuccess: () => void;
  rate: (period: number) => number;
}

function Lockup({
  show,
  onClose,
  accountData,
  address,
  onSuccess,
  rate,
}: LockupProps): ReactElement {
  const { transactionSigner, activeAccount, signTransactions } = useWallet();

  const [amount, setAmount] = useState<string>("");

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

  const { showException, showSnack } = useSnackbar();
  const { showLoader, hideLoader } = useLoader();

  const periodLimit = new CoreStaker(accountData).lockupPeriodLimit();

  const [period, setPeriod] = useState<string>(
    String(accountData.global_period)
  );

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
    return (
      amount !== "" &&
      (isNaN(Number(amount)) ||
        Number(amount) <= 0 ||
        Number(amount) >
          microalgosToAlgos(
            new CoreAccount(accountInfo).availableBalance() - 2e6
          ))
    );
  }, [amount]);

  const errorMessage = useMemo(() => {
    if (error) {
      if (isNaN(Number(amount))) {
        return "Please enter a valid number";
      } else if (Number(amount) <= 0) {
        return "Please enter a positive number";
      } else if (
        Number(amount) >
        microalgosToAlgos(new CoreAccount(accountInfo).availableBalance() - 2e6)
      ) {
        return "Insufficient balance";
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
                    {/* add text input for stake amount */}
                    <FormControl fullWidth variant="outlined">
                      <FormLabel className="classic-label">Amount</FormLabel>
                      <Input
                        error={
                          amount !== "" &&
                          (isNaN(Number(amount)) ||
                            Number(amount) <= 0 ||
                            Number(amount) >
                              microalgosToAlgos(
                                new CoreAccount(
                                  accountInfo
                                ).availableBalance() - 2e6
                              ))
                        }
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

                      <Box
                        mt={1}
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        {activeAccount ? (
                          <Typography variant="caption">
                            <NumericFormat
                              value={Math.max(
                                0,
                                microalgosToAlgos(
                                  new CoreAccount(
                                    accountInfo
                                  ).availableBalance() - 2e6
                                )
                              )}
                              suffix=" VOI available"
                              displayType={"text"}
                              thousandSeparator={true}
                            ></NumericFormat>
                          </Typography>
                        ) : null}
                        <Button
                          size="small"
                          variant="text"
                          color="primary"
                          onClick={() => {
                            setAmount(
                              Math.max(
                                0,
                                microalgosToAlgos(
                                  new CoreAccount(
                                    accountInfo
                                  ).availableBalance() - 2e6
                                )
                              ).toString()
                            );
                          }}
                        >
                          Max
                        </Button>
                      </Box>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
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
                              selected={i === Number(period)}
                              hover={true}
                              onClick={() => setPeriod(i.toString())}
                            >
                              <TableCell>
                                {humanizeDuration(
                                  (i + 1) *
                                    Number(accountData?.global_lockup_delay) *
                                    Number(accountData?.global_period_seconds) *
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
                                {!error && Number(amount) > 0
                                  ? formatNumber(
                                      ((amt, r) => amt + r * amt)(
                                        Number(amount),
                                        rate(i + 1)
                                      )
                                    )
                                  : "-"}
                              </TableCell>
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

export default Lockup;
