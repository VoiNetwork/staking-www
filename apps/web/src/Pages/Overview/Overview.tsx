import "./Overview.scss";
import { ReactElement, useEffect, useState } from "react";
import { useWallet } from "@txnlab/use-wallet-react";
import { LoadingTile, useSnackbar } from "@repo/ui";
import {
  ContractDetails,
  CoreStaker,
  StakingClient,
  StakingContractState,
} from "@repo/voix";
import { useSelector } from "react-redux";
import { RootState } from "../../Redux/store";
import {
  AccountClient,
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

function Overview(): ReactElement {
  const { loading } = useSelector((state: RootState) => state.node);

  const { activeAccount } = useWallet();

  const { showException } = useSnackbar();

  const [loadingContract, setLoadingContract] = useState<boolean>(false);
  const [contractDetails, setContractDetails] =
    useState<ContractDetails | null>(null);

  const [loadingStakingAccount, setLoadingStakingAccount] =
    useState<boolean>(false);
  const [stakingAccount, setStakingAccount] = useState<AccountResult | null>(
    null,
  );

  const [loadingStakingState, setLoadingStakingState] =
    useState<boolean>(false);
  const [stakingState, setStakingState] = useState<StakingContractState | null>(
    null,
  );

  const [isMetadataVisible, setMetadataVisibility] = useState<boolean>(false);

  const isDataLoading = loading || loadingContract || loadingStakingAccount;

  const { genesis, health, versionsCheck, status, ready } = useSelector(
    (state: RootState) => state.node,
  );
  const coreNodeInstance = new CoreNode(
    status,
    versionsCheck,
    genesis,
    health,
    ready,
  );

  const [isLockupModalVisible, setLockupModalVisibility] =
    useState<boolean>(false);

  async function loadStakingAccount(address: string): Promise<void> {
    try {
      setLoadingStakingAccount(true);
      const account = await new AccountClient(voiStakingUtils.network).get(
        address,
      );
      setStakingAccount(account);
    } catch (e) {
      showException(e);
    } finally {
      setLoadingStakingAccount(false);
    }
  }

  async function loadContractDetails(address: string): Promise<void> {
    try {
      setLoadingContract(true);
      const contractDetails = await new StakingClient().getContractDetails(
        address,
      );
      setContractDetails(contractDetails);
    } catch (e) {
      showException(e);
    } finally {
      setLoadingContract(false);
    }
  }

  const [expiresIn, setExpiresIn] = useState<string>("--");

  async function loadExpiresIn(account: AccountResult) {
    try {
      const status = await new NodeClient(voiStakingUtils.network).status();
      const currentRound = status["last-round"];
      const blockTimeMs = await new BlockClient(
        voiStakingUtils.network,
      ).getAverageBlockTimeInMS();
      const expiresIn = new CoreAccount(account).partKeyExpiresIn(
        currentRound,
        blockTimeMs,
      );
      setExpiresIn(expiresIn);
    } catch (e) {
      /* empty */
    }
  }

  async function loadLockupDetails(contractDetails: ContractDetails) {
    try {
      setLoadingStakingState(true);
      const state = await new CoreStaker(contractDetails).getStakingState(
        voiStakingUtils.network.getAlgodClient(),
      );
      setStakingState(state);
    } catch (e) {
      /* empty */
    } finally {
      setLoadingStakingState(false);
    }
  }

  useEffect(() => {
    if (activeAccount?.address) {
      loadContractDetails(activeAccount.address);
    }
  }, [activeAccount]);

  useEffect(() => {
    if (contractDetails) {
      loadStakingAccount(contractDetails.contractAddress);
      loadLockupDetails(contractDetails);
    }
  }, [contractDetails]);

  useEffect(() => {
    if (stakingAccount) {
      if (new CoreAccount(stakingAccount).isOnline()) {
        loadExpiresIn(stakingAccount);
      }
    }
  }, [stakingAccount]);

  return (
    <div className="overview-wrapper">
      <div className="overview-container">
        <div className="overview-header">
          <div>Staking Overview</div>
          <div>
            {contractDetails && (
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
                  json={contractDetails}
                  title="Metadata"
                  fileName={"metadata"}
                ></JsonViewer>
              </div>
            )}
          </div>
        </div>
        <div className="overview-body">
          {isDataLoading && <LoadingTile></LoadingTile>}
          {!isDataLoading && !contractDetails && (
            <div>No contract details found for your account.</div>
          )}
          {!isDataLoading &&
            activeAccount &&
            contractDetails &&
            stakingAccount && (
              <div>
                <div className="props">
                  <div className="prop">
                    <div className="key">Your Account</div>
                    <div
                      className="val hover hover-underline underline"
                      onClick={() => {
                        new BlockPackExplorer(coreNodeInstance).openAddress(
                          activeAccount.address,
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
                          new CoreStaker(contractDetails).stakingAddress(),
                        );
                      }}
                    >
                      {new CoreStaker(contractDetails).stakingAddress()}
                    </div>
                  </div>
                  <div className="prop">
                    <div className="key">Staking Contract</div>
                    <div
                      className="val hover hover-underline underline"
                      onClick={() => {
                        new BlockPackExplorer(coreNodeInstance).openApplication(
                          new CoreStaker(contractDetails).contractId(),
                        );
                      }}
                    >
                      {new CoreStaker(contractDetails).contractId()}
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
                            new CoreAccount(stakingAccount).balance(),
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
                          value={microalgosToAlgos(
                            new CoreAccount(stakingAccount).availableBalance(),
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
                    {loadingStakingState && <LoadingTile></LoadingTile>}
                    {!loadingStakingState && stakingState && (
                      <div>
                        {new CoreStaker(contractDetails).hasLocked(
                          stakingState,
                        ) ? (
                          <div>
                            <div className="info-msg">
                              You have locked your coins for{" "}
                              {new CoreStaker(contractDetails).getLockingPeriod(
                                stakingState,
                              )}{" "}
                              months
                            </div>
                          </div>
                        ) : (
                          <div>
                            <div className="info-msg">
                              You have not locked your coins yet. You can opt-in
                              for locking using below button.
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
                                contractDetails={contractDetails}
                                address={activeAccount.address}
                                onClose={() => {
                                  setLockupModalVisibility(false);
                                }}
                                onSuccess={() => {
                                  loadContractDetails(activeAccount.address);
                                  setLockupModalVisibility(false);
                                }}
                              ></Lockup>
                            </div>
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
