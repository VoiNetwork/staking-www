import "./Overview.scss";
import React, { ReactElement, useEffect, useState } from "react";
import { useWallet } from "@txnlab/use-wallet-react";
import { LoadingTile } from "@repo/ui";
import { AccountData, CoreStaker } from "@repo/voix";
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
import {
  Box,
  Button,
  ButtonGroup,
  Grid,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";
import { microalgosToAlgos } from "algosdk";
import { NumericFormat } from "react-number-format";
import JsonViewer from "../../Components/JsonViewer/JsonViewer";
import Deposit from "./Deposit/Deposit";
import Withdraw from "./Withdraw/Withdraw";
import {
  initAccountData,
  loadAccountData,
} from "../../Redux/staking/userReducer";
import ContractPicker from "../../Components/pickers/ContractPicker/ContractPicker";
import humanizeDuration from "humanize-duration";
import { InfoTooltip } from "../../Components/InfoToolTip/InfoToolTip";
import { Copy } from "lucide-react";
import CopyText from "@/Components/Copy";

function Overview(): ReactElement {
  const { loading } = useSelector((state: RootState) => state.node);
  const { activeAccount } = useWallet();

  const { account, staking, contract } = useSelector(
    (state: RootState) => state.user
  );

  const { availableContracts } = account;

  const funder = "62TIVJSZOS4DRSSYYDDZELQAGFYQC5JWKCHRBPPYKTZN2OOOXTGLB5ZJ4E";
  const parent_id = 5211;

  const [airdropContracts, setAirdropContracts] = useState<AccountData[]>([]);
  const [airdrop2Contracts, setAirdrop2Contracts] = useState<AccountData[]>([]);
  const [otherContracts, setOtherContracts] = useState<AccountData[]>([]);

  useEffect(() => {
    if (!availableContracts) return;
    setAirdropContracts(
      availableContracts.filter(
        (contract) =>
          contract.global_funder === funder &&
          contract.global_parent_id === parent_id &&
          contract.global_initial !== "0"
      )
    );
    setAirdrop2Contracts(
      availableContracts.filter(
        (contract) =>
          contract.global_funder === funder &&
          contract.global_parent_id === parent_id &&
          contract.global_initial === "0"
      )
    );
    setOtherContracts(
      availableContracts.filter(
        (contract) =>
          contract.global_funder !== funder ||
          contract.global_parent_id !== parent_id
      )
    );
  }, [availableContracts]);

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

  const [isDepositModalVisible, setDepositModalVisibility] =
    useState<boolean>(false);

  const [isWithdrawModalVisible, setWithdrawModalVisibility] =
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

  const [tab, setTab] = useState(0);
  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setTab(newValue);
  };

  function a11yProps(index: number) {
    return {
      id: `simple-tab-${index}`,
      "aria-controls": `simple-tabpanel-${index}`,
    };
  }

  const handleModalClose = (
    setModalVisibility: React.Dispatch<React.SetStateAction<boolean>>
  ) => {
    if (!activeAccount) return;
    setModalVisibility(false);
    dispatch(loadAccountData(activeAccount.address));
  };

  return (
    <div className="overview-wrapper-component">
      <div className="overview-container">
        <div
          className="overview-header"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-start",
          }}
        >
          <div className="px-2 sm:px-0">Contracts</div>
          <Tabs
            sx={{ display: { xs: "none", sm: "flex" } }}
            value={tab}
            onChange={handleChange}
            aria-label="simple tabs example"
            style={{ minHeight: "unset", marginLeft: "20px" }} // Adjust margin if needed
          >
            {airdropContracts.map((contract, index) => {
              return (
                <Tab
                className="tab"
                  key={contract.contractId}
                  label="Phase I"
                  {...a11yProps(index)}
                  style={{ minHeight: "unset", padding: "6px 16px" }}
                  onClick={() => {
                    dispatch(initAccountData(contract));
                  }}
                />
              );
            })}

            {airdrop2Contracts.map((contract, index) => {
              return (
                <Tab
                className="tab"
                  key={contract.contractId}
                  label="Phase II"
                  {...a11yProps(index)}
                  style={{ minHeight: "unset", padding: "6px 16px", }}
                  onClick={() => {
                    dispatch(initAccountData(contract));
                  }}
                />
              );
            })}

            {otherContracts.map((contract, index) => {
              return (
                <Tab
                  key={contract.contractId}
                  label={contract.contractId}
                  {...a11yProps(index)}
                  style={{ minHeight: "unset", padding: "6px 16px" }}
                  onClick={() => {
                    dispatch(initAccountData(contract));
                  }}
                />
              );
            })}
          </Tabs>
          <Box sx={{ display: { xs: "block", sm: "none" } }}>
            <ContractPicker />
          </Box>
        </div>
        <div className="overview-body px-2 sm:px-0">
          {isDataLoading && <LoadingTile></LoadingTile>}
          {!isDataLoading && !accountData && (
            <div className="info-msg">No contracts found for your account.</div>
          )}
          {!isDataLoading &&
            activeAccount &&
            accountData &&
            stakingAccount &&
            contractState && (
              <div>
                <div
                  className="overview-subheader"
                  style={{
                    marginTop: "20px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <div style={{
                  }} className="py-2 sm:py-0 ">Contract Overview</div>
                  <ButtonGroup  variant="outlined">
                    <Button
                    className="button"
                      onClick={() => {
                        setDepositModalVisibility(true);
                      }}
                    >
                      Deposit
                    </Button>
                    <Button
                    className="button"

                      onClick={() => {
                        setWithdrawModalVisibility(true);
                      }}
                    >
                      Withdraw
                    </Button>
                  </ButtonGroup>
                </div>
                <Deposit
                  show={isDepositModalVisible}
                  onClose={() => handleModalClose(setDepositModalVisibility)}
                  onSuccess={() => handleModalClose(setDepositModalVisibility)}
                ></Deposit>
                <Withdraw
                  show={isWithdrawModalVisible}
                  onClose={() => handleModalClose(setWithdrawModalVisibility)}
                  onSuccess={() => handleModalClose(setWithdrawModalVisibility)}
                ></Withdraw>

                <Grid container spacing={2} className="overview-tiles">
                  <Grid item xs={12} ></Grid>
                  
                  <Grid item  xs={12} sm={6} md={4} lg={4} xl={3}>
                    <div className="tile">
                      <div className="title">
                        <div className="label">Balance</div>
                        <InfoTooltip
                          title={
                            <div>
                              <Typography variant="h6">Balance</Typography>
                              <Typography variant="body2">
                                Amount of Voi held by the staking contract. This
                                does not include the amount before funding.
                              </Typography>
                            </div>
                          }
                        />
                      </div>
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
                  <Grid item xs={12} sm={6} md={4} lg={4} xl={3}>
                    <div className="tile">
                      <div className="title">
                        <div className="label">Available balance</div>
                        <InfoTooltip
                          title={
                            <div>
                              <Typography variant="h6">
                                Available balance
                              </Typography>
                              <Typography variant="body2">
                                Amount of Voi that can be withdrawn from the
                                staking contract that does not include amount
                                before funding.
                              </Typography>
                            </div>
                          }
                        />
                      </div>
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
                  <Grid item xs={12} sm={6} md={4} lg={4} xl={3}>
                    <div className="tile">
                      <div className="title">
                        <div className="label">Status</div>
                        <InfoTooltip
                          title={
                            <div>
                              <Typography variant="h6">State</Typography>
                              <Typography variant="body2">
                                Online if the balance of the staking contract is
                                participating in consensus, otherwise offline.
                              </Typography>
                            </div>
                          }
                        />
                      </div>
                      <div className="content">
                        {new CoreAccount(stakingAccount).isOnline()
                          ? "Online"
                          : "Offline"}
                      </div>
                    </div>
                  </Grid>
                  <Grid item xs={12} sm={6} md={4} lg={4} xl={3}>
                    <div className="tile">
                      <div className="title">
                        <div className="label">Key expires</div>
                        <InfoTooltip
                          title={
                            <div>
                              <Typography variant="h6">Key expires</Typography>
                              <Typography variant="body2">
                                Time left for the participation key to expire.
                              </Typography>
                            </div>
                          }
                        />
                      </div>
                      <div className="content">{expiresIn}</div>
                    </div>
                  </Grid>
                  <Grid item xs={12} sm={6} md={4} lg={4} xl={3}>
                    <div className="tile">
                      <div className="title">
                        <div className="label">Lockup</div>
                        <InfoTooltip
                          title={
                            <div>
                              <Typography variant="h6">Lockup</Typography>
                              <Typography variant="body2">
                                Configured lockup duration for the staking
                                contract.
                              </Typography>
                            </div>
                          }
                        />
                      </div>
                      <div className="content">
                        {humanizeDuration(
                          (Number(accountData.global_period) *
                            Number(accountData.global_lockup_delay) +
                            Number(accountData.global_vesting_delay)) *
                            Number(accountData.global_period_seconds) *
                            1000,
                          { units: ["mo"], round: true }
                        )}
                      </div>
                    </div>
                  </Grid>
                  <Grid item xs={12} sm={6} md={4} lg={4} xl={3}>
                    <div className="tile">
                      <div className="title">
                        <div className="label">Vesting</div>
                        <InfoTooltip
                          title={
                            <div>
                              <Typography variant="h6">Vesting</Typography>
                              <Typography variant="body2">
                                Configured vesting duration for the staking
                                contract. This is the time it takes for the
                                entire amount to be released after lockup.
                              </Typography>
                            </div>
                          }
                        />
                      </div>
                      <div className="content">
                        {humanizeDuration(
                          Number(accountData.global_distribution_count) *
                            Number(accountData.global_distribution_seconds) *
                            1000,
                          { units: ["mo"], round: true }
                        )}
                      </div>
                    </div>
                  </Grid>
                </Grid>
                <div
                  className="overview-subheader"
                  style={{
                    marginTop: "20px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <div>Contract Details</div>
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
                <div  className="props">
                  <div className="prop">
                    <div className="key">Your Account <CopyText text={activeAccount?.address!} /></div>
                    <div
                      className="val hover hover-underline underline truncate"
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
                    <div className="key">Staking Account <CopyText text={new CoreStaker(accountData).stakingAddress()} /></div>
                    <div
                      className="val hover hover-underline underline truncate"
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
                    <div className="key">Staking Contract <CopyText text={new CoreStaker(accountData).contractId()??""} /></div>
                    <div
                      className="val hover hover-underline underline truncate"
                      onClick={() => {
                        new BlockPackExplorer(coreNodeInstance).openApplication(
                          new CoreStaker(accountData).contractId()
                        );
                      }}
                    >
                      {new CoreStaker(accountData).contractId()}
                    </div>
                  </div>
                  {new CoreStaker(accountData).isDelegated(contractState) ? (
                    <div className="prop">
                      <div className="key">Delegated to <CopyText text={new CoreStaker(accountData).delegateAddress(
                          contractState
                        )??""} /></div>
                      <div
                        className="val hover hover-underline underline truncate"
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
                        {new CoreStaker(accountData).delegateAddress(
                          contractState
                        )}
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>
            )}
        </div>
      </div>
    </div>
  );
}

export default Overview;
