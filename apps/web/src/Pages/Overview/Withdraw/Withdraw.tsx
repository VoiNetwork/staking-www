import React, { ReactElement, useEffect, useMemo, useState } from "react";
import "./Withdraw.scss";
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
  Skeleton,
} from "@mui/material";
import { Close, Label } from "@mui/icons-material";
import { ModalGrowTransition, ShadedInput } from "@repo/theme";
import { AccountData, CoreStaker, StakingContractState } from "@repo/voix";
import voiStakingUtils from "../../../utils/voiStakingUtils";
import { waitForConfirmation } from "@algorandfoundation/algokit-utils";
import { useWallet } from "@txnlab/use-wallet-react";
import { useLoader, useSnackbar } from "@repo/ui";
import { useSelector } from "react-redux";
import { RootState, useAppDispatch } from "../../../Redux/store";
import { isNumber } from "@repo/utils";
import { AlgoAmount } from "@algorandfoundation/algokit-utils/types/amount";
import { loadAccountData } from "../../../Redux/staking/userReducer";
import { CoreAccount, NodeClient } from "@repo/algocore";
import { AccountResult } from "@algorandfoundation/algokit-utils/types/indexer";
import TransactionDetails from "../../../Components/TransactionDetails/TransactionDetails";
import { NumericFormat } from "react-number-format";
import { algosToMicroalgos, microalgosToAlgos } from "algosdk";
import Withdraw from "../../Withdraw/Withdraw";

interface LockupProps {
  show: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

function Lockup({ show, onClose }: LockupProps): ReactElement {
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

  async function withdraw(data: AccountData) {
    if (!activeAccount) {
      showSnack("Please connect your wallet", "error");
      return;
    }

    if (!amount || !isNumber(amount)) {
      showSnack("Invalid amount", "error");
      return;
    }

    try {
      showLoader("Withdrawal in progress");
      const transaction = await new CoreStaker(data).withdraw(
        voiStakingUtils.network.getAlgodClient(),
        AlgoAmount.Algos(Number(amount)).microAlgos,
        {
          addr: activeAccount.address,
          signer: transactionSigner,
        }
      );
      const txnId = transaction.txID();
      await waitForConfirmation(
        txnId,
        20,
        voiStakingUtils.network.getAlgodClient()
      );

      setTxnId(txnId);
      setTxnMsg("You have withdrawn successfully.");
      resetState();
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
      .then(setMinBalance)
      .catch((error) => {
        showException(error);
      });
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
      });
  }, [activeAccount]);

  const withdrawableBalance = useMemo(() => {
    if (minBalance < 0 || !stakingAccount) return -1;
    return microalgosToAlgos(
      ((v) => (v < 0 ? 0 : v))(
        new CoreAccount(stakingAccount).availableBalance() - minBalance
      )
    );
  }, [minBalance, stakingAccount]);

  const errorMessage = (() => {
    if (amount === "") {
      return "";
    }
    if (availableBalance - 5000 <= 0) {
      return "Insufficient balance";
    }
    if (!isNumber(amount)) {
      return "Invalid amount";
    }
    if (Number(amount) <= 0) {
      return "Amount should be greater than 0";
    }
    if (withdrawableBalance < 0) {
      return "Withdrawable balance not available";
    }
    if (withdrawableBalance < Number(amount)) {
      return "Insufficient withdrawable balance";
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
            <div>Withdraw</div>
            <div>
              <Close onClick={handleClose} className="close-modal" />
            </div>
          </DialogTitle>
          <DialogContent>
            <div className="withdraw-wrapper">
              <div className="withdraw-container">
                {!isDataLoading &&
                  activeAccount &&
                  accountData &&
                  stakingAccount &&
                  contractState && (
                    <div className="withdraw-body">
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
                          <div className="key">Withdrawable Balance</div>
                          <div className="value">
                            {withdrawableBalance < 0 ? (
                              "-"
                            ) : (
                              <NumericFormat
                                value={withdrawableBalance}
                                suffix=" VOI"
                                displayType={"text"}
                                thousandSeparator={true}
                              ></NumericFormat>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="withdraw-widget">
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
                                  disabled={availableBalance - 5000 <= 0}
                                  variant="outlined"
                                  onClick={() => {
                                    if (withdrawableBalance > 0) {
                                      setAmount(withdrawableBalance.toString());
                                    } else {
                                      showSnack(
                                        "Withdrawable balance not available",
                                        "error"
                                      );
                                    }
                                  }}
                                >
                                  Max
                                </Button>
                              </FormLabel>
                              <ShadedInput
                                disabled={availableBalance - 5000 <= 0}
                                placeholder={
                                  availableBalance - 5000 <= 0
                                    ? "Insufficient balance"
                                    : "Enter amount"
                                }
                                value={amount}
                                onChange={(ev) => {
                                  if (availableBalance - 5000 <= 0) return;
                                  setAmount(ev.target.value);
                                }}
                                fullWidth
                                endAdornment={<div>VOI</div>}
                              />
                              {errorMessage ? (
                                <label
                                  style={{
                                    color: "red",
                                    fontSize: "12px",
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
                                      !isNumber(amount)
                                        ? "-"
                                        : microalgosToAlgos(
                                            new CoreAccount(
                                              stakingAccount
                                            ).availableBalance() - minBalance
                                          ) - Number(amount)
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
                                      availableBalance < 5000 ||
                                      !isNumber(amount)
                                        ? "-"
                                        : microalgosToAlgos(
                                            availableBalance - 5000
                                          ) + Number(amount)
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
                                (isNumber(amount) && Number(amount) <= 0) ||
                                availableBalance - 5000 <= 0 ||
                                (availableBalance < 5000
                                  ? -1
                                  : microalgosToAlgos(availableBalance - 5000) -
                                    Number(amount)) <= 0 ||
                                !isNumber(amount)
                              }
                              fullWidth
                              variant={"contained"}
                              color={"primary"}
                              size={"large"}
                              onClick={() => {
                                withdraw(accountData);
                              }}
                            >
                              Withdraw
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
