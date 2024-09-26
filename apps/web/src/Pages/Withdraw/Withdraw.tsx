import React from "react";
import "./Withdraw.scss";
import { ReactElement, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState, useAppDispatch } from "../../Redux/store";
import { useWallet } from "@txnlab/use-wallet-react";
import { LoadingTile, useLoader, useSnackbar } from "@repo/ui";
import { AccountData, CoreStaker } from "@repo/voix";
import { Button, FormControl, FormLabel, Grid } from "@mui/material";
import { loadAccountData } from "../../Redux/staking/userReducer";
import voiStakingUtils from "../../utils/voiStakingUtils";
import { waitForConfirmation } from "@algorandfoundation/algokit-utils";
import { ShadedInput } from "@repo/theme";
import TransactionDetails from "../../Components/TransactionDetails/TransactionDetails";
import { microalgosToAlgos } from "algosdk";
import { CoreAccount, NodeClient } from "@repo/algocore";
import { NumericFormat } from "react-number-format";
import { AlgoAmount } from "@algorandfoundation/algokit-utils/types/amount";
import { isNumber } from "@repo/utils";

function Withdraw(): ReactElement {
  const { transactionSigner, activeAccount } = useWallet();

  const { showException, showSnack } = useSnackbar();
  const { showLoader, hideLoader } = useLoader();

  const { loading } = useSelector((state: RootState) => state.node);

  const { account, staking, contract } = useSelector(
    (state: RootState) => state.user
  );

  const dispatch = useAppDispatch();

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

      await waitForConfirmation(
        transaction.txID(),
        20,
        voiStakingUtils.network.getAlgodClient()
      );

      setTxnId(transaction.txID());
      setTxnMsg("You have withdrawn successfully.");
      dispatch(loadAccountData(activeAccount.address));
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

  return (
    <div className="withdraw-wrapper">
      <div className="withdraw-container">
        <div className="withdraw-header">
          <div className="px-2 sm:px-0">Withdraw</div>
        </div>
        <div className="withdraw-body px-2 sm:px-0">
          {isDataLoading && <LoadingTile></LoadingTile>}
          {!isDataLoading && !accountData && (
            <div className="info-msg">
              No contract details found for your account.
            </div>
          )}

          {!isDataLoading &&
            activeAccount &&
            accountData &&
            stakingAccount &&
            contractState && (
              <div>
                <div className="props">
                  <div className="prop">
                    <div className="key">Staking account</div>
                    <div className="value">
                      {new CoreStaker(accountData).stakingAddress()}
                    </div>
                  </div>
                  <div className="prop">
                    <div className="key">Available balance</div>
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
                </div>
                <div className="withdraw-widget">
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={12} md={4} lg={3} xl={3}>
                      <FormControl fullWidth variant="outlined">
                        <FormLabel className="classic-label flex ">
                          <div>Amount</div>
                          <div>
                            <Button
                              disabled={minBalance < 0}
                              size={"small"}
                              variant={"outlined"}
                              onClick={() => {
                                setAmount(
                                  AlgoAmount.MicroAlgos(
                                    new CoreAccount(
                                      stakingAccount
                                    ).availableBalance() - minBalance
                                  ).algos.toString()
                                );
                              }}
                            >
                              MAX
                            </Button>
                          </div>
                        </FormLabel>
                        <ShadedInput
                          value={amount}
                          onChange={(ev) => {
                            setAmount(ev.target.value);
                          }}
                          fullWidth
                          endAdornment={<div>VOI</div>}
                        />
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={12} md={12} lg={12} xl={12}></Grid>
                    <Grid item xs={12} sm={12} md={4} lg={3} xl={3}>
                      <Button
                        variant={"contained"}
                        color={"primary"}
                        fullWidth
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
    </div>
  );
}

export default Withdraw;
