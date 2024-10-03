import React, { ReactElement, useEffect, useState } from "react";
import "./Deposit.scss";
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
  Typography,
} from "@mui/material";
import { Close } from "@mui/icons-material";
import { ModalGrowTransition, ShadedInput } from "@repo/theme";
import { AccountData, CoreStaker } from "@repo/voix";
import voiStakingUtils from "../../../utils/voiStakingUtils";
import { waitForConfirmation } from "@algorandfoundation/algokit-utils";
import { useWallet } from "@txnlab/use-wallet-react";
import { useLoader, useSnackbar } from "@repo/ui";
import { useSelector } from "react-redux";
import { RootState } from "../../../Redux/store";
import { isNumber } from "@repo/utils";
import { AlgoAmount } from "@algorandfoundation/algokit-utils/types/amount";
import { CoreAccount, NodeClient } from "@repo/algocore";
import { AccountResult } from "@algorandfoundation/algokit-utils/types/indexer";
import TransactionDetails from "../../../Components/TransactionDetails/TransactionDetails";
import { NumericFormat } from "react-number-format";
import { algosToMicroalgos, microalgosToAlgos } from "algosdk";

interface LockupProps {
  show: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

function Lockup({ show, onClose, onSuccess }: LockupProps): ReactElement {
  function handleClose() {
    onClose();
    resetState();
  }

  function resetState() {
    setAmount("");
    setTxnId("");
    setTxnMsg("");
    setAvailableBalance(-1);
    setMinBalance(-1);
  }

  const [acknowledge, setAcknowledge] = useState<boolean>(false);

  const { transactionSigner, activeAccount } = useWallet();

  const { showException, showSnack } = useSnackbar();
  const { showLoader, hideLoader } = useLoader();

  const { loading } = useSelector((state: RootState) => state.node);

  const { account, staking, contract } = useSelector(
    (state: RootState) => state.user
  );

  const [txnId, setTxnId] = useState<string>("");
  const [txnMsg, setTxnMsg] = useState<string>("");

  const [amount, setAmount] = useState<string>("");

  const accountData = account.data;
  const stakingAccount = staking.account;
  const contractState = contract.state;

  const isDataLoading =
    loading || account.loading || staking.loading || contract.loading;

  async function deposit(data: AccountData) {
    if (!activeAccount) {
      showSnack("Please connect your wallet", "error");
      return;
    }

    if (!amount || !isNumber(amount)) {
      showSnack("Invalid amount", "error");
      return;
    }

    try {
      showLoader("Deposit in progress");
      const txnId = await new CoreStaker(data).deposit(
        voiStakingUtils.network.getAlgodClient(),
        AlgoAmount.Algos(Number(amount)).microAlgos,
        {
          addr: activeAccount.address,
          signer: transactionSigner,
        }
      );

      await waitForConfirmation(
        txnId,
        20,
        voiStakingUtils.network.getAlgodClient()
      );

      setTxnId(txnId);
      setTxnMsg("You have deposited successfully.");
      resetState();
      onSuccess();
    } catch (e) {
      showException(e);
    } finally {
      hideLoader();
    }
  }

  const [minBalance, setMinBalance] = useState<number>(-1);
  useEffect(() => {
    if (!activeAccount || !contractState || !accountData) return;
    const algod = new NodeClient(voiStakingUtils.network);
    new CoreStaker(accountData)
      .getMinBalance(algod.algod, contractState)
      .then(setMinBalance);
  }, [activeAccount, accountData, contractState]);

  const [availableBalance, setAvailableBalance] = useState<number>(-1);
  useEffect(() => {
    if (!activeAccount) return;
    const algodClient = voiStakingUtils.network.getAlgodClient();
    algodClient
      .accountInformation(activeAccount.address)
      .do()
      .then((account) => {
        setAvailableBalance(
          new CoreAccount(account as AccountResult).availableBalance()
        );
      })
      .catch((error) => {
        showException(error);
      });
  }, [activeAccount, stakingAccount]);

  const errorMessage = (() => {
    if (amount === "") {
      return "";
    }
    if (!isNumber(amount)) {
      return "Invalid amount";
    }
    if (Number(amount) <= 0) {
      return "Amount should be greater than 0";
    }
    if (availableBalance < 1e6) {
      return "Insufficient balance";
    }
    if (availableBalance - 1e6 < algosToMicroalgos(Number(amount))) {
      return "Insufficient balance";
    }
    return "";
  })();

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
            ".MuiPaper-root": {},
          }}
        >
          <DialogTitle>
            {acknowledge ? <div>Deposit</div> : <div>Acknowledgment</div>}
            <div>
              <Close onClick={handleClose} className="close-modal" />
            </div>
          </DialogTitle>
          <DialogContent>
            <div className="deposit-wrapper">
              <div className="deposit-container">
                {!acknowledge && (
                  <div className="acknowledge">
                    <div className="acknowledge-body">
                      <div className="acknowledge-text">
                        <Typography
                          variant={"body2"}
                          sx={{
                            textAlign: "left",
                            fontSize: "0.9rem",
                            background: "gainsboro",
                            maxWidth: 400,
                            padding: "10px",
                            borderRadius: "10px",
                          }}
                        >
                          I acknowledge that the deposit will not impact staking
                          rewards or airdrop amounts. The deposited amount is
                          withdrawable anytime, during or after the staking
                          period, and will be reflected in both the balance and
                          available balance.
                        </Typography>
                      </div>
                      <div className="acknowledge-actions">
                        <Button
                          variant={"contained"}
                          color={"primary"}
                          size={"large"}
                          onClick={() => {
                            setAcknowledge(true);
                          }}
                        >
                          I Understand
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
                {acknowledge &&
                  !isDataLoading &&
                  activeAccount &&
                  accountData &&
                  stakingAccount &&
                  contractState && (
                    <div className="deposit-body">
                      <div className="props">
                        <div className="prop">
                          <div className="key">Total Balance</div>
                          <div className="value">
                            <NumericFormat
                              value={
                                minBalance < 0
                                  ? "-"
                                  : microalgosToAlgos(
                                      new CoreAccount(
                                        stakingAccount
                                      ).availableBalance() - minBalance
                                    )
                              }
                              suffix=" VOI"
                              displayType={"text"}
                              thousandSeparator={true}
                            ></NumericFormat>
                          </div>
                        </div>
                        <div className="prop">
                          <div className="key">Depositable balance</div>
                          <div className="value">
                            <NumericFormat
                              value={
                                Math.max(availableBalance - 1e6, 0) <= 0
                                  ? "-"
                                  : microalgosToAlgos(
                                      Math.max(availableBalance - 1e6, 0)
                                    )
                              }
                              suffix=" VOI"
                              displayType={"text"}
                              thousandSeparator={true}
                            ></NumericFormat>
                          </div>
                        </div>
                      </div>
                      <div className="deposit-widget">
                        <Grid container spacing={0}>
                          <Grid item xs={12}>
                            <FormControl
                              style={{
                                minHeight: 100,
                              }}
                              fullWidth
                              variant="outlined"
                            >
                              <FormLabel className="classic-label flex">
                                <div>Amount</div>
                                <Button
                                  disabled={
                                    Math.max(availableBalance - 1e6, 0) <= 0
                                  }
                                  variant="outlined"
                                  onClick={() => {
                                    setAmount(
                                      microalgosToAlgos(
                                        Math.max(availableBalance - 1e6, 0)
                                      ).toString()
                                    );
                                  }}
                                >
                                  Max
                                </Button>
                              </FormLabel>
                              <ShadedInput
                                disabled={
                                  Math.max(availableBalance - 1e6, 0) <= 0
                                }
                                placeholder={
                                  Math.max(availableBalance - 1e6, 0) <= 0
                                    ? "Insufficient balance"
                                    : "Enter amount"
                                }
                                value={amount}
                                onChange={(ev) => {
                                  if (Math.max(availableBalance - 1e6, 0) <= 0)
                                    return;
                                  setAmount(ev.target.value);
                                }}
                                fullWidth
                                endAdornment={<div>VOI</div>}
                              />
                              {errorMessage ? (
                                <label
                                  style={{
                                    color: errorMessage ? "red" : "inherit",
                                    fontSize: "0.75rem",
                                    textAlign: "left",
                                    marginTop: "5px",
                                  }}
                                  className="error"
                                >
                                  {errorMessage}
                                </label>
                              ) : null}
                            </FormControl>
                          </Grid>
                          <Grid item xs={12}>
                            <div
                              className="props"
                              style={{
                                border: "1px solid #e0e0e0",
                                backgroundColor: "#f9f9f9",
                                borderRadius: 10,
                                padding: 10,
                              }}
                            >
                              <div className="prop">
                                <div className="key">
                                  Final Contract Balance
                                </div>
                                <div className="value">
                                  <NumericFormat
                                    value={
                                      minBalance < 0 || !isNumber(amount)
                                        ? "-"
                                        : microalgosToAlgos(
                                            new CoreAccount(
                                              stakingAccount
                                            ).availableBalance() - minBalance
                                          ) + Number(amount)
                                    }
                                    suffix=" VOI"
                                    displayType={"text"}
                                    thousandSeparator={true}
                                    decimalScale={6}
                                  ></NumericFormat>
                                </div>
                              </div>
                              <div className="prop">
                                <div className="key">Final Account Balance</div>
                                <div className="value">
                                  <NumericFormat
                                    value={
                                      availableBalance < 1e6 ||
                                      !isNumber(amount)
                                        ? "-"
                                        : microalgosToAlgos(
                                            availableBalance - 1e6
                                          ) - Number(amount)
                                    }
                                    suffix=" VOI"
                                    displayType={"text"}
                                    thousandSeparator={true}
                                    decimalScale={6}
                                  ></NumericFormat>
                                </div>
                              </div>
                            </div>
                          </Grid>
                          <Grid item xs={12}>
                            <Button
                              disabled={
                                !isNumber(amount) &&
                                Math.max(availableBalance - 1e6, 0) <= 0
                              }
                              fullWidth
                              variant={"contained"}
                              color={"primary"}
                              size={"large"}
                              onClick={() => {
                                deposit(accountData);
                              }}
                            >
                              Deposit
                            </Button>
                          </Grid>
                        </Grid>
                      </div>
                    </div>
                  )}

                <TransactionDetails
                  id={txnId}
                  show={Boolean(txnId)}
                  onClose={() => {
                    setTxnId("");
                  }}
                  msg={txnMsg}
                ></TransactionDetails>
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
