import "./Stake.scss";
import { ReactElement, useState } from "react";
import { useSelector } from "react-redux";
import { RootState, useAppDispatch } from "../../Redux/store";
import { useWallet } from "@txnlab/use-wallet-react";
import { LoadingTile, useLoader, useSnackbar } from "@repo/ui";
import { AccountData, CoreStaker } from "@repo/voix";
import { Button } from "@mui/material";
import Register from "./Register/Register";
import { loadAccountData } from "../../Redux/staking/userReducer";
import voiStakingUtils from "../../utils/voiStakingUtils";
import { waitForConfirmation } from "@algorandfoundation/algokit-utils";
import { useConfirm } from "material-ui-confirm";
import { confirmationProps } from "@repo/theme";
import TransactionDetails from "../../Components/TransactionDetails/TransactionDetails";

function Stake(): ReactElement {
  const { transactionSigner, activeAccount } = useWallet();

  const { showException, showSnack } = useSnackbar();
  const { showLoader, hideLoader } = useLoader();

  const confirmation = useConfirm();

  const { loading } = useSelector((state: RootState) => state.node);

  const { account, staking, contract } = useSelector(
    (state: RootState) => state.user,
  );

  const dispatch = useAppDispatch();
  
  const [isRegisterVisible, setRegisterVisibility] = useState<boolean>(false);

  const [txnId, setTxnId] = useState<string>("");
  const [txnMsg, setTxnMsg] = useState<string>("");

  const accountData = account.data;
  const stakingAccount = staking.account;
  const contractState = contract.state;

  const isDataLoading =
    loading || account.loading || staking.loading || contract.loading;

  async function deRegister(data: AccountData) {
    if (!activeAccount) {
      showSnack("Please connect your wallet", "error");
      return;
    }

    try {
      showLoader("DeRegistering your participation key");
      const txnId = await new CoreStaker(data).stake(
        voiStakingUtils.network.getAlgodClient(),
        {
          selK: new Uint8Array(32),
          spKey: new Uint8Array(64),
          voteK: new Uint8Array(32),
          voteKd: 0,
          voteFst: 0,
          voteLst: 0,
        },
        {
          addr: activeAccount.address,
          signer: transactionSigner,
        },
      );
      await waitForConfirmation(
        txnId,
        20,
        voiStakingUtils.network.getAlgodClient(),
      );

      setTxnId(txnId);
      setTxnMsg("You have deregistered successfully.");
      dispatch(loadAccountData(activeAccount.address));
    } catch (e) {
      showException(e);
    } finally {
      hideLoader();
    }
  }

  return (
    <div className="stake-wrapper">
      <div className="stake-container">
        <div className="stake-header">
          <div>Stake</div>
        </div>
        <div className="stake-body">
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
                {new CoreStaker(accountData).hasStaked(stakingAccount) && (
                  <div>
                    <div className="props">
                      <div className="prop">
                        <div className="key">Selection key</div>
                        <div className="value">{accountData.part_sel_k}</div>
                      </div>
                      <div className="prop">
                        <div className="key">State proof key</div>
                        <div className="value">{accountData.part_sp_key}</div>
                      </div>
                      <div className="prop">
                        <div className="key">Vote key</div>
                        <div className="value">{accountData.part_vote_k}</div>
                      </div>
                      <div className="prop">
                        <div className="key">Vote key dilution</div>
                        <div className="value">{accountData.part_vote_kd}</div>
                      </div>
                      <div className="prop">
                        <div className="key">Vote first</div>
                        <div className="value">{accountData.part_vote_fst}</div>
                      </div>
                      <div className="prop">
                        <div className="key">Vote last</div>
                        <div className="value">{accountData.part_vote_lst}</div>
                      </div>
                    </div>
                    <div>
                      <Button
                        variant={"outlined"}
                        color={"primary"}
                        size={"small"}
                        onClick={() => {
                          confirmation({
                            ...confirmationProps,
                            description: `You are trying to deregister your participation key`,
                          })
                            .then(async () => {
                              deRegister(accountData);
                            })
                            .catch(() => {});
                        }}
                      >
                        DeRegister
                      </Button>
                    </div>
                  </div>
                )}
                {!new CoreStaker(accountData).hasStaked(stakingAccount) && (
                  <div>
                    <div className="info-msg">
                      You need to register your participation key.
                    </div>
                    <div className="user-actions">
                      <Button
                        variant={"outlined"}
                        color={"primary"}
                        size={"small"}
                        onClick={() => {
                          setRegisterVisibility(true);
                        }}
                      >
                        Register
                      </Button>
                      <Register
                        show={isRegisterVisible}
                        onClose={() => {
                          setRegisterVisibility(false);
                        }}
                        accountData={accountData}
                        address={activeAccount.address}
                        onSuccess={(txnId: string) => {
                          setTxnId(txnId);
                          setTxnMsg("You have registered successfully.");
                          setRegisterVisibility(false);
                          dispatch(loadAccountData(activeAccount.address));
                        }}
                      ></Register>
                    </div>
                  </div>
                )}
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

export default Stake;
