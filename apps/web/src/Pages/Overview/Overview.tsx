import "./Overview.scss";
import React, { ReactElement, useEffect, useMemo, useState } from "react";
import { useWallet } from "@txnlab/use-wallet-react";
import { LoadingTile } from "@repo/ui";
import {
  AccountData,
  AIRDROP_CTC_INFO,
  AIRDROP_FUNDER,
  CoreStaker,
  STAKING_CTC_INFO,
  STAKING_FUNDER,
} from "@repo/voix";
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
  loadContractState,
} from "../../Redux/staking/userReducer";
import ContractPicker from "../../Components/pickers/ContractPicker/ContractPicker";
import humanizeDuration from "humanize-duration";
import { InfoTooltip } from "../../Components/InfoToolTip/InfoToolTip";
import { Copy } from "lucide-react";
import CopyText from "@/Components/Copy";
import Register from "./Register/Register";
import axios from "axios";
import moment from "moment";
import { useParams } from "react-router-dom";
import WithdrawAll from "./WithdrawAll/WithdrawAll";


function Overview(): ReactElement {
  const params = useParams<{ contractId: string }>();

  const { loading } = useSelector((state: RootState) => state.node);
  const { activeAccount } = useWallet();

  const { account, staking, contract } = useSelector(
    (state: RootState) => state.user
  );

  const { availableContracts } = account;

  const airdrop_funder = AIRDROP_FUNDER;
  const airdrop_parent_id = AIRDROP_CTC_INFO;

  const staking_funder = STAKING_FUNDER;
  const staking_parent_id = STAKING_CTC_INFO;

  const [airdropContracts, setAirdropContracts] = useState<AccountData[]>([]);
  const [airdrop2Contracts, setAirdrop2Contracts] = useState<AccountData[]>([]);
  const [stakingContracts, setStakingContracts] = useState<AccountData[]>([]);
  const [otherContracts, setOtherContracts] = useState<AccountData[]>([]);

  useEffect(() => {
    if (!availableContracts) return;
    setAirdropContracts(
      availableContracts.filter(
        (contract) =>
          contract.global_funder === airdrop_funder &&
          contract.global_parent_id === airdrop_parent_id &&
          contract.global_initial !== "0"
      )
    );
    setAirdrop2Contracts(
      availableContracts.filter(
        (contract) =>
          contract.global_funder === airdrop_funder &&
          contract.global_parent_id === airdrop_parent_id &&
          contract.global_initial === "0"
      )
    );
    setStakingContracts(
      availableContracts.filter(
        (contract) =>
          contract.global_funder === staking_funder &&
          contract.global_parent_id === staking_parent_id
      )
    );
    setOtherContracts(
      availableContracts.filter(
        (contract) =>
          (contract.global_funder !== airdrop_funder ||
            contract.global_parent_id !== airdrop_parent_id) &&
          (contract.global_funder !== staking_funder ||
            contract.global_parent_id !== staking_parent_id)
      )
    );
  }, [availableContracts]);

  const [estimatedReward, setEstimatedReward] = useState<number>(0);
  useEffect(() => {
    if (!activeAccount) return;
    axios
      .get(`https://voirewards.com/api/phase2?wallet=${activeAccount.address}`)
      .then((res) => {
        setEstimatedReward(res.data?.estimatedReward || 0);
      })
      .catch((err) => {
        console.log(err);
      });
  }, [activeAccount]);

  function getWeeksFromTime(
    startTime: Date,
    currentUnixTime = moment().unix()
  ): number {
    const startUnixTime = moment(startTime).unix(); // Start time in Unix timestamp

    const secondsPerWeek = 60 * 60 * 24 * 7;

    const timeDifference = currentUnixTime - startUnixTime;
    const weeksPassed = Math.floor(timeDifference / secondsPerWeek);

    return weeksPassed;
  }

  const startTime = new Date("2024-09-30T00:00:00Z"); // start of week 1

  const weeksPassed = getWeeksFromTime(startTime);

  function computeLockupMultiplier(B2: number, R1: number) {
    if (B2 <= 12) {
      return 0.45 * Math.pow(B2 / R1, 2);
    } else {
      return Math.pow(B2 / R1, 2);
    }
  }

  function computeTimingMultiplier(week: number) {
    switch (week) {
      case 1:
        return 1;
      case 2:
        return 0.8;
      case 3:
        return 0.6;
      case 4:
        return 0.4;
      default:
        return 0;
    }
  }

  const period_limit = 5;

  const computeRate = (week: number) => (period: number) => {
    const lockupMultiplier = computeLockupMultiplier(period, period_limit);
    const timingMultiplier = computeTimingMultiplier(week);
    return lockupMultiplier * timingMultiplier;
  };

  const [airdropEstimatedReward, setAirdropEstimatedReward] =
    useState<number>(0);
  useEffect(() => {
    const calculateCompoundInterest = (
      principal: number,
      rate: number,
      time: number,
      compoundingsPerYear: number
    ) => {
      const r = rate / 100; // Convert percentage to decimal
      return (
        principal *
        Math.pow(1 + r / compoundingsPerYear, compoundingsPerYear * time)
      );
    };
    const rate = (period: number) => {
      const rates: { [key: number]: number } = {
        1: 10,
        2: 12,
        3: 15,
        4: 18,
        5: 20,
      };
      return rates[period] || 0;
    };
    let estimate = 0;
    if (airdrop2Contracts.length > 0) {
      const { global_period } = airdrop2Contracts[0];
      estimate +=
        calculateCompoundInterest(
          estimatedReward,
          rate(global_period),
          global_period,
          1
        ) * 1e6;
    }
    if (airdropContracts.length > 0) {
      const airdropTotal = airdropContracts.reduce((acc, contract) => {
        const { global_period, global_initial } = contract;
        return (
          acc +
          calculateCompoundInterest(
            Number(global_initial),
            rate(global_period),
            global_period,
            1
          )
        );
      }, 0);
      estimate += airdropTotal;
    }
    setAirdropEstimatedReward(Math.round(estimate));
  }, [estimatedReward, airdropContracts, airdrop2Contracts]);

  const [stakedTotal, setStakedTotal] = useState<number>(0);
  useEffect(() => {
    setStakedTotal(
      availableContracts.reduce((acc, contract) => {
        return acc + Number(contract.global_total);
      }, 0)
    );
  }, [availableContracts]);

  const [nextExpire, setNextExpire] = useState<string>("--");
  useEffect(() => {
    if (!availableContracts) return;
    new NodeClient(voiStakingUtils.network)
      .status()
      .then((status) => {
        const currentRound = status["last-round"];
        new BlockClient(voiStakingUtils.network)
          .getAverageBlockTimeInMS()
          .then((blockTimeMs) => {
            const nextExpire = availableContracts
              .filter(
                (el) => !!el.part_vote_lst && el.part_vote_lst > currentRound
              )
              .reduce((acc, contract) => {
                return Math.min(
                  acc,
                  contract.part_vote_lst || Number.MAX_SAFE_INTEGER
                );
              }, Number.MAX_SAFE_INTEGER);
            if (nextExpire === Number.MAX_SAFE_INTEGER) return;
            const diff = nextExpire - currentRound;
            const diffMs = diff * blockTimeMs;
            const nextExpireDuration = humanizeDuration(diffMs, {
              largest: 2,
              round: true,
            });
            setNextExpire(nextExpireDuration);
          })
          .catch((error) => {
            console.error("Error fetching average block time:", error);
            // Optionally, set a default value or state to inform the user
          });
      })
      .catch((error) => {
        console.error("Error fetching node status:", error);
        // Optionally, set a default value or state to inform the user
      });
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

  const [isWithdrawAllModalVisible, setWithdrawAllModalVisibility] =
    useState<boolean>(false);

  const [isRegisterVisible, setRegisterVisibility] = useState<boolean>(false);
  const [txnId, setTxnId] = useState<string>("");
  const [txnMsg, setTxnMsg] = useState<string>("");

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

  useEffect(() => {
    if (!accountData) return;
    setTab(accountData.contractId);
  }, [accountData]);

  const [minBalance, setMinBalance] = useState<number>(-1);
  useEffect(() => {
    if (!activeAccount || !contractState || !accountData) return;
    const algod = new NodeClient(voiStakingUtils.network);
    new CoreStaker(accountData)
      .getMinBalance(algod.algod, contractState)
      .then(setMinBalance);
  }, [activeAccount, accountData, contractState]);

  const withdrawableBalance = useMemo(() => {
    if (minBalance < 0 || !stakingAccount) return -1;
    const balance =
      new CoreAccount(stakingAccount).availableBalance() - minBalance;
    const adjustedBalance = balance < 0 ? 0 : balance;
    return microalgosToAlgos(adjustedBalance);
  }, [minBalance, stakingAccount]);

  const [tab, setTab] = useState(accountData?.contractId || 0);

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
          <div className="px-2 sm:px-0">Overview</div>
        </div>
        <div className="overview-body px-2 sm:px-0">
          <Grid container spacing={2} className="overview-tiles">
            <Grid item xs={12} sm={6} md={4} lg={4} xl={3}>
              <div className="tile">
                <div className="title">
                  <div className="label">Count</div>
                  <InfoTooltip
                    title={
                      <div>
                        <Typography variant="h6">Counts</Typography>
                        <Typography variant="body2">
                          Number of contracts available for your account.
                        </Typography>
                      </div>
                    }
                  />
                </div>
                <div className="content">
                  <NumericFormat
                    value={availableContracts.length}
                    suffix=""
                    displayType={"text"}
                    thousandSeparator={true}
                  ></NumericFormat>
                </div>
              </div>
            </Grid>
            <Grid item xs={12} sm={6} md={4} lg={4} xl={3}>
              <div className="tile">
                <div className="title">
                  <div className="label">Airdrop Estimate</div>
                  <InfoTooltip
                    title={
                      <div>
                        <Typography variant="h6">Airdrop Estimate</Typography>
                        <Typography variant="body2">
                          Estimated reward for the airdrop program.
                        </Typography>
                      </div>
                    }
                  />
                </div>
                <div className="content">
                  <NumericFormat
                    value={
                      airdropEstimatedReward > 0
                        ? microalgosToAlgos(airdropEstimatedReward)
                        : 0
                    }
                    suffix=" Voi"
                    displayType={"text"}
                    thousandSeparator={true}
                    decimalScale={0}
                  ></NumericFormat>
                </div>
              </div>
            </Grid>
            <Grid item xs={12} sm={6} md={4} lg={4} xl={3}>
              <div className="tile">
                <div className="title">
                  <div className="label">Stake Total</div>
                  <InfoTooltip
                    title={
                      <div>
                        <Typography variant="h6">Stake Total</Typography>
                        <Typography variant="body2">
                          Amount of Voi staked in staking program. This does not
                          include the amount after funding and airdrop
                          contracts.
                        </Typography>
                      </div>
                    }
                  />
                </div>
                <div className="content">
                  <NumericFormat
                    value={microalgosToAlgos(stakedTotal)}
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
                  <div className="label">Next expire</div>
                  <InfoTooltip
                    title={
                      <div>
                        <Typography variant="h6">Next expire</Typography>
                        <Typography variant="body2">
                          Time left for next participation key to expire.
                        </Typography>
                      </div>
                    }
                  />
                </div>
                <div className="content">{nextExpire}</div>
              </div>
            </Grid>
          </Grid>
        </div>
        <div
          className="overview-header"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-start",
            marginTop: "20px",
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
                  value={contract.contractId}
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
                  value={contract.contractId}
                  className="tab"
                  key={contract.contractId}
                  label="Phase II"
                  {...a11yProps(index)}
                  style={{ minHeight: "unset", padding: "6px 16px" }}
                  onClick={() => {
                    dispatch(initAccountData(contract));
                  }}
                />
              );
            })}
            {stakingContracts.map((contract, index) => {
              return (
                <Tab
                  value={contract.contractId}
                  className="tab"
                  key={contract.contractId}
                  label={`Staking ${index + 1}`}
                  {...a11yProps(index)}
                  style={{ minHeight: "unset", padding: "6px 16px" }}
                  onClick={() => {
                    dispatch(initAccountData(contract));
                  }}
                />
              );
            })}
            {otherContracts.map((contract, index) => {
              return (
                <Tab
                  value={contract.contractId}
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
                  <div style={{}} className="py-2 sm:py-0 ">
                    Contract Details
                  </div>
                  <ButtonGroup variant="outlined">
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
                    <Button
                      className="button"
                      onClick={() => {
                        setWithdrawAllModalVisibility(true);
                      }}
                    >
                      Withdraw All
                    </Button>
                    <Button
                      className="button"
                      onClick={() => {
                        setRegisterVisibility(true);
                      }}
                    >
                      Earn Block Rewards
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
                <WithdrawAll
                  show={isWithdrawAllModalVisible}
                  onClose={() =>
                    handleModalClose(setWithdrawAllModalVisibility)
                  }
                  onSuccess={() =>
                    handleModalClose(setWithdrawAllModalVisibility)
                  }
                ></WithdrawAll>
                {activeAccount ? (
                  <Register
                    show={isRegisterVisible}
                    onClose={() => {
                      setRegisterVisibility(false);
                    }}
                    //accountData={accountData}
                    address={activeAccount.address}
                    onSuccess={(txnId: string) => {
                      setTxnId(txnId);
                      setTxnMsg("You have registered successfully.");
                      setRegisterVisibility(false);
                      dispatch(loadAccountData(activeAccount.address));
                    }}
                    accountData={accountData}
                  ></Register>
                ) : null}

                <Grid container spacing={2} className="overview-tiles">
                  <Grid item xs={12} sm={6} md={4} lg={4} xl={3}>
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
                            withdrawableBalance > 0 ? withdrawableBalance : 0
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
                <div className="props">
                  <div className="prop">
                    <div className="key">
                      Owner Account <CopyText text={activeAccount?.address!} />
                    </div>
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
                    <div className="key">
                      Contract Account{" "}
                      <CopyText
                        text={new CoreStaker(accountData).stakingAddress()}
                      />
                    </div>
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
                    <div className="key">
                      Contract Id{" "}
                      <CopyText
                        text={new CoreStaker(accountData).contractId() ?? ""}
                      />
                    </div>
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
                      <div className="key">
                        Delegated to{" "}
                        {new CoreStaker(accountData).delegateAddress(
                          contractState
                        ) && (
                          <CopyText
                            text={new CoreStaker(accountData).delegateAddress(
                              contractState
                            )}
                          />
                        )}
                      </div>
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
