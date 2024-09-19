import "./Overview.scss";
import { ReactElement, useEffect, useState } from "react";
import { useWallet } from "@txnlab/use-wallet-react";
import { LoadingTile } from "@repo/ui";
import { CoreStaker } from "@repo/voix";
import { useSelector } from "react-redux";
import { RootState, useAppDispatch } from "../../Redux/store";
import {
  BlockClient,
  BlockPackExplorer,
  CoreAccount,
  CoreNode,
  NodeClient,
} from "@repo/algocore";
import voiStakingUtils from "../../utils/voiStakingUtils";
import { AccountResult } from "@algorandfoundation/algokit-utils/types/indexer";
import { Button, Grid } from "@mui/material";
import { microalgosToAlgos } from "algosdk";
import { NumericFormat } from "react-number-format";
import JsonViewer from "../../Components/JsonViewer/JsonViewer";
import Lockup from "./Lockup/Lockup";
import { loadAccountData } from "../../Redux/staking/userReducer";
import ContractPicker from "../../Components/pickers/ContractPicker/ContractPicker";

function Overview(): ReactElement {
  const { loading } = useSelector((state: RootState) => state.node);
  const { activeAccount } = useWallet();

  const { account, staking, contract } = useSelector(
    (state: RootState) => state.user
  );

  const dispatch = useAppDispatch();

  const accountData = account.data;
  const stakingAccount = staking.account;
  const contractState = contract.state;

  const [isMetadataVisible, setMetadataVisibility] = useState<boolean>(false);

  const isDataLoading = loading || account.loading || staking.loading;

  const { genesis, health, versionsCheck, status, ready } = useSelector(
    (state: RootState) => state.node
  );
  const coreNodeInstance = new CoreNode(
    status,
    versionsCheck,
    genesis,
    health,
    ready
  );

  const [isLockupModalVisible, setLockupModalVisibility] =
    useState<boolean>(false);

  const [expiresIn, setExpiresIn] = useState<string>("--");

  async function loadExpiresIn(account: AccountResult) {
    try {
      const status = await new NodeClient(voiStakingUtils.network).status();
      const currentRound = status["last-round"];
      const blockTimeMs = await new BlockClient(
        voiStakingUtils.network
      ).getAverageBlockTimeInMS();
      const expiresIn = new CoreAccount(account).partKeyExpiresIn(
        currentRound,
        blockTimeMs
      );
      setExpiresIn(expiresIn);
    } catch (e) {
      /* empty */
    }
  }

  useEffect(() => {
    if (staking.account) {
      if (new CoreAccount(staking.account).isOnline()) {
        loadExpiresIn(staking.account);
      }
    }
  }, [staking]);

  const [minBalance, setMinBalance] = useState<number>(-1);
  useEffect(() => {
    if (!activeAccount || !contractState || !accountData) return;
    const algod = new NodeClient(voiStakingUtils.network);
    new CoreStaker(accountData)
      .getMinBalance(algod.algod, contractState)
      .then(setMinBalance);
  }, [activeAccount, accountData, contractState]);

  return (
    <div className="overview-wrapper">
      <div className="overview-container">
        <div className="overview-header">
          <div>Overview</div>
          <div>
            {accountData && (
              <div>
                <Button
                  variant={"contained"}
                  color={"primary"}
                  size={"small"}
                  onClick={() => {
                    setMetadataVisibility(true);
                  }}
                >
                  Metadata
                </Button>
                <JsonViewer
                  show={isMetadataVisible}
                  onClose={() => {
                    setMetadataVisibility(false);
                  }}
                  json={accountData}
                  title="Metadata"
                ></JsonViewer>
              </div>
            )}
          </div>
        </div>
        <div className="overview-body">
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
                    <div className="key">Your Account</div>
                    <div
                      className="val hover hover-underline underline"
                      onClick={() => {
                        new BlockPackExplorer(coreNodeInstance).openAddress(
                          activeAccount.address
                        );
                      }}
                    >
                      {activeAccount.address}
                    </div>
                  </div>
                  <div className="prop">
                    <div className="key">Staking Account</div>
                    <div
                      className="val hover hover-underline underline"
                      onClick={() => {
                        new BlockPackExplorer(coreNodeInstance).openAddress(
                          new CoreStaker(accountData).stakingAddress()
                        );
                      }}
                    >
                      {new CoreStaker(accountData).stakingAddress()}
                    </div>
                  </div>
                  <div className="prop">
                    <div className="key">Delegated to</div>
                    <div
                      className="val hover hover-underline underline"
                      onClick={() => {
                        const addr = new CoreStaker(
                          accountData
                        ).delegateAddress(contractState);
                        if (addr) {
                          new BlockPackExplorer(coreNodeInstance).openAddress(
                            addr
                          );
                        }
                      }}
                    >
                      {new CoreStaker(accountData).isDelegated(contractState)
                        ? new CoreStaker(accountData).delegateAddress(
                            contractState
                          )
                        : "--None--"}
                    </div>
                  </div>
                  <div className="prop">
                    <div className="key">Staking Contract</div>
                    <div
                      className="val hover hover-underline underline"
                      onClick={() => {
                        new BlockPackExplorer(coreNodeInstance).openApplication(
                          new CoreStaker(accountData).contractId()
                        );
                      }}
                    >
                      {new CoreStaker(accountData).contractId()}
                    </div>
                  </div>

                  <div className="prop">
                    <div className="key">Deployer</div>
                    <div
                      className="val hover hover-underline underline"
                      onClick={() => {
                        new BlockPackExplorer(coreNodeInstance).openApplication(
                          new CoreStaker(accountData).deployer()
                        );
                      }}
                    >
                      {new CoreStaker(accountData).deployer()}
                    </div>
                  </div>

                  <div className="prop">
                    <div className="key">Messenger</div>
                    <div
                      className="val hover hover-underline underline"
                      onClick={() => {
                        new BlockPackExplorer(coreNodeInstance).openApplication(
                          new CoreStaker(accountData).messenger()
                        );
                      }}
                    >
                      {new CoreStaker(accountData).messenger()}
                    </div>
                  </div>
                </div>

                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6} md={4} lg={3} xl={3}>
                    <div className="tile">
                      <div className="title">Balance</div>
                      <div className="content">
                        <NumericFormat
                          value={microalgosToAlgos(
                            new CoreAccount(stakingAccount).balance()
                          )}
                          suffix=" Voi"
                          displayType={"text"}
                          thousandSeparator={true}
                        ></NumericFormat>
                      </div>
                    </div>
                  </Grid>
                  <Grid item xs={12} sm={6} md={4} lg={3} xl={3}>
                    <div className="tile">
                      <div className="title">Available balance</div>
                      <div className="content">
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
                          suffix=" Voi"
                          displayType={"text"}
                          thousandSeparator={true}
                        ></NumericFormat>
                      </div>
                    </div>
                  </Grid>
                  <Grid item xs={12} sm={6} md={4} lg={3} xl={3}>
                    <div className="tile">
                      <div className="title">Status</div>
                      <div className="content">
                        {new CoreAccount(stakingAccount).isOnline()
                          ? "Online"
                          : "Offline"}
                      </div>
                    </div>
                  </Grid>
                  <Grid item xs={12} sm={6} md={4} lg={3} xl={3}>
                    <div className="tile">
                      <div className="title">Key expires</div>
                      <div className="content">{expiresIn}</div>
                    </div>
                  </Grid>
                </Grid>

                <div className="lockup-details">
                  <div className="lockup-details-header">Lockup details</div>
                  <div className="lockup-details-body">
                    {contract.loading && <LoadingTile></LoadingTile>}

                    {!contract.loading && contract.state && (
                      <div>
                        {new CoreStaker(accountData).hasLocked(
                          contract.state
                        ) ? (
                          <div>
                            <div className="info-msg">
                              You have opted for lockup.
                            </div>
                            <div className="lockup-deadline">
                              <div>
                                <span className="key">
                                  Your lockup duration : &nbsp;
                                </span>
                                <span className="value">
                                  {new CoreStaker(
                                    accountData
                                  ).getLockupDuration()}
                                </span>
                              </div>
                            </div>
                            <div className="lockup-actions">
                              <Button
                                variant={"outlined"}
                                color={"primary"}
                                onClick={() => {
                                  setLockupModalVisibility(true);
                                }}
                              >
                                Update Lockup
                              </Button>
                              <Lockup
                                show={isLockupModalVisible}
                                accountData={accountData}
                                address={activeAccount.address}
                                onClose={() => {
                                  setLockupModalVisibility(false);
                                }}
                                onSuccess={() => {
                                  dispatch(
                                    loadAccountData(activeAccount.address)
                                  );
                                  setLockupModalVisibility(false);
                                }}
                              ></Lockup>
                            </div>
                          </div>
                        ) : (
                          <div>
                            {new CoreStaker(
                              accountData
                            ).hasLockupDeadlineCompleted() ? (
                              <div>
                                <div className="info-msg">
                                  Lockup deadline is completed. you will not be
                                  able to lockup anymore.
                                </div>
                              </div>
                            ) : (
                              <div>
                                <div className="info-msg">
                                  You have not locked your coins yet. You can
                                  opt-in for locking using below button.
                                </div>
                                <div className="lockup-deadline">
                                  <div>
                                    <span className="key">
                                      Deadline duration : &nbsp;
                                    </span>
                                    <span className="value">
                                      {new CoreStaker(
                                        accountData
                                      ).getLockupDeadlineDuration()}
                                    </span>
                                  </div>
                                  <div>
                                    <span className="key">
                                      Deadline date : &nbsp;
                                    </span>
                                    <span className="value">
                                      {new CoreStaker(
                                        accountData
                                      ).lockupDeadlineDate()}
                                    </span>
                                  </div>
                                </div>
                                <div className="lockup-actions">
                                  <Button
                                    variant={"outlined"}
                                    color={"primary"}
                                    onClick={() => {
                                      setLockupModalVisibility(true);
                                    }}
                                  >
                                    Lock
                                  </Button>
                                  <Lockup
                                    show={isLockupModalVisible}
                                    accountData={accountData}
                                    address={activeAccount.address}
                                    onClose={() => {
                                      setLockupModalVisibility(false);
                                    }}
                                    onSuccess={() => {
                                      dispatch(
                                        loadAccountData(activeAccount.address)
                                      );
                                      setLockupModalVisibility(false);
                                    }}
                                  ></Lockup>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
        </div>
      </div>
    </div>
  );
}

export default Overview;
