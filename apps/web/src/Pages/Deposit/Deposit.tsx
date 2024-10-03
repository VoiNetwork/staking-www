import "./Deposit.scss";
import React, { ReactElement, useEffect, useState } from "react";
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
import { AccountResult } from "@algorandfoundation/algokit-utils/types/indexer";

function Deposit(): ReactElement {
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
  }, [activeAccount, stakingAccount]);

  return (
    <div className="deposit-wrapper">
      <div className="deposit-container">
        <div className="deposit-header">
          <div>Deposit</div>
        </div>
        <div className="deposit-body">
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
                    <div className="key">Staking balance</div>
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
                    <div className="key">Wallet balance</div>
                    <div className="value">
                      <NumericFormat
                        value={
                          availableBalance < 0 ? "-" : availableBalance / 1e6
                        }
                        suffix=" VOI"
                        displayType={"text"}
                        thousandSeparator={true}
                      ></NumericFormat>
                    </div>
                  </div>
                </div>
                <div className="deposit-widget">
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={12} md={4} lg={3} xl={3}>
                      <FormControl fullWidth variant="outlined">
                        <FormLabel className="classic-label flex">
                          <div>Amount</div>
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
    </div>
  );
}

export default Deposit;
