import React, { ReactElement, useEffect, useMemo, useState } from "react";
import "./WithdrawAll.scss";
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
  Typography,
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
import algosdk, { algosToMicroalgos, microalgosToAlgos } from "algosdk";
import Withdraw from "../../Withdraw/Withdraw";
import { abi, CONTRACT } from "ulujs";
import { AirdropClient, APP_SPEC } from "@repo/voix/src/clients/AirdropClient";

// TODO export to utils
function zip<T>(...arrays: T[][]): T[][] {
  const maxLength = Math.min(...arrays.map((arr) => arr.length));
  return Array.from({ length: maxLength }, (_, i) =>
    arrays.map((arr) => arr[i])
  );
}

interface LockupProps {
  show: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

function WithdrawAll({ show, onClose }: LockupProps): ReactElement {
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

  const { availableContracts } = account;

  const [acknowledge, setAcknowledge] = useState<boolean>(false);

  useEffect(() => {
    if (
      !activeAccount ||
      !availableContracts ||
      availableContracts.length === 0 ||
      !acknowledge
    )
      return;
    // get withdrawable balance
    const algodClient = voiStakingUtils.network.getAlgodClient();
    const indexerClient = voiStakingUtils.network.getIndexerClient();
    const apps: CoreStaker[] = availableContracts.map((contract) => {
      return new CoreStaker(contract);
    });
    const apids = apps.map((app) => app.contractId());
    (async () => {
      const minbals = await Promise.all(
        apps.map((app: CoreStaker) =>
          app.getMinBalanceByOwner(algodClient, activeAccount.address)
        )
      );
      const bals = [];
      for await (const app of apps) {
        const addr = algosdk.getApplicationAddress(app.contractId());
        const accResult = await algodClient.accountInformation(addr).do();
        const acc = new CoreAccount(accResult as AccountResult);
        const bal = acc.availableBalance();
        bals.push(bal);
      }

      // zip available contracts with min balances
      const zipped = zip(apids, bals, minbals)
        .map(([apid, bal, mb]) => [apid, Math.abs(bal - mb)])
        .filter(([_, mb]) => mb > 0);
      console.log({ zipped });
      const ci = new CONTRACT(
        zipped[0][0],
        algodClient,
        indexerClient,
        abi.custom,
        {
          addr: activeAccount.address,
          sk: new Uint8Array(0),
        }
      );
      console.log(ci);
      const buildN = [];
      for await (const [apid, mb] of zipped) {
        console.log(apid, mb);
        const cia = new CONTRACT(
          apid,
          algodClient,
          indexerClient,
          {
            name: "",
            methods: APP_SPEC.contract.methods,
            events: [],
          },
          {
            addr: activeAccount.address,
            sk: new Uint8Array(0),
          },
          true,
          false,
          true
        );
        const txnO = (await cia.withdraw(mb)).obj;
        buildN.push(txnO);
      }
      console.log({ buildN });
      ci.setExtraTxns(buildN);
      ci.setEnableGroupResourceSharing(true);
      const customR = await ci.custom();
      console.log(customR);
      if (!customR.simulate) {
        showSnack("Withdrawal failed", "error");
      } else {
      }
    })();
  }, [activeAccount, availableContracts, acknowledge]);

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
    const balance =
      new CoreAccount(stakingAccount).availableBalance() - minBalance;
    const adjustedBalance = balance < 0 ? 0 : balance;
    return microalgosToAlgos(adjustedBalance);
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
            {!acknowledge ? <div>Acknowledgement</div> : <div>Withdraw</div>}
            <div>
              <Close onClick={handleClose} className="close-modal" />
            </div>
          </DialogTitle>
          <DialogContent>
            <div className="withdraw-wrapper">
              <div className="withdraw-container">
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
                          The withdrawn amount will reduce the contract
                          account's balance, affecting the chance of proposing
                          blocks. The remaining balance can be staked by keeping
                          the contract online.
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
                                value={
                                  withdrawableBalance >= 0
                                    ? withdrawableBalance
                                    : 0
                                }
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
                              disabled={errorMessage !== ""}
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

export default WithdrawAll;
