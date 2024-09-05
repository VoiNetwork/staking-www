import "./Transfer.scss";
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
import { confirmationProps, ShadedInput } from "@repo/theme";
import TransactionDetails from "../../Components/TransactionDetails/TransactionDetails";
import { isValidAddress, microalgosToAlgos } from "algosdk";
import { CoreAccount, NodeClient } from "@repo/algocore";
import { NumericFormat } from "react-number-format";
import { useConfirm } from "material-ui-confirm";

function Transfer(): ReactElement {
  const confirmation = useConfirm();
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

  const [transferTo, setTransferTo] = useState<string>("");

  const accountData = account.data;
  const stakingAccount = staking.account;
  const contractState = contract.state;

  const isDataLoading =
    loading || account.loading || staking.loading || contract.loading;

  async function transfer(data: AccountData) {
    if (!activeAccount) {
      showSnack("Please connect your wallet", "error");
      return;
    }

    if (!transferTo || !isValidAddress(transferTo)) {
      showSnack("Invalid address", "error");
      return;
    }

    try {
      showLoader("Transferring your staking contract");
      const transaction = await new CoreStaker(data).transfer(
        voiStakingUtils.network.getAlgodClient(),
        transferTo,
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
      setTxnMsg("You have transferred your staking contract successfully.");
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
    <div className="transfer-wrapper">
      <div className="transfer-container">
        <div className="transfer-header">
          <div>Transfer</div>
        </div>
        <div className="transfer-body">
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
                    <div className="key">Staking contract</div>
                    <div className="value">
                      {new CoreStaker(accountData).contractId()}
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
                <div className="transfer-widget">
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={12} md={4} lg={3} xl={3}>
                      <FormControl fullWidth variant="outlined">
                        <FormLabel className="classic-label flex">
                          <div>Transfer to</div>
                        </FormLabel>
                        <ShadedInput
                          value={transferTo}
                          onChange={(ev) => {
                            setTransferTo(ev.target.value);
                          }}
                          multiline={true}
                          rows={4}
                          fullWidth
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
                          if (!activeAccount) {
                            showSnack("Please connect your wallet", "error");
                            return;
                          }

                          if (!transferTo || !isValidAddress(transferTo)) {
                            showSnack("Invalid address", "error");
                            return;
                          }

                          confirmation({
                            ...confirmationProps,
                            description: `You are trying to transfer your staking contract ownership to the address ${transferTo}.`,
                          })
                            .then(async () => {
                              transfer(accountData);
                            })
                            .catch(() => {});
                        }}
                      >
                        Transfer
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

export default Transfer;
