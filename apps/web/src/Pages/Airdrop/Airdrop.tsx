import React from "react";
import "./Airdrop.scss";
import { ReactElement, useEffect, useState } from "react";
import { useWallet } from "@txnlab/use-wallet-react";
import { LoadingTile } from "@repo/ui";
import {
  AccountData,
  AIRDROP_CTC_INFO,
  AIRDROP_FUNDER,
  CoreStaker,
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
import { Box, Button, Grid, Tab, Tabs } from "@mui/material";
import { microalgosToAlgos } from "algosdk";
import { NumericFormat } from "react-number-format";
import Table from "./Table/Table";
import axios from "axios";

import Lockup from "./Lockup/Lockup";
import {
  initAccountData,
  loadAccountData,
} from "../../Redux/staking/userReducer";
import { Contract } from "ulujs/types/arc200";
import ContractPicker from "../../Components/pickers/ContractPicker/ContractPicker";

import { LinearProgress, Typography } from "@mui/material";
import moment from "moment";

interface CountdownTimerProps {
  deadlineTimestamp: number; // Timestamp in milliseconds
}
export const calculatePercentIncrease = (start: number, end: number) => {
  return ((end - start) / start) * 100;
};

const CountdownTimer: React.FC<CountdownTimerProps> = ({
  deadlineTimestamp,
}) => {
  const calculateTimeLeft = () => {
    const now = moment();
    const deadline = moment(deadlineTimestamp);
    const difference = deadline.diff(now);

    if (difference <= 0) {
      return { hours: 0, minutes: 0, seconds: 0 }; // Timer reaches zero
    }

    const duration = moment.duration(difference);
    return {
      hours: Math.floor(duration.asHours()), // Convert to total hours
      minutes: duration.minutes(),
      seconds: duration.seconds(),
    };
  };

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000); // Update every second

    return () => clearInterval(intervalId); // Cleanup on unmount
  }, [deadlineTimestamp]);

  return (
    <Box>
      {timeLeft.hours === 0 &&
      timeLeft.minutes === 0 &&
      timeLeft.seconds === 0 ? (
        <Typography variant="body2" color="error">
          Time's up!
        </Typography>
      ) : (
        <Typography variant="body2">
          {timeLeft.hours}h {timeLeft.minutes}m {timeLeft.seconds}s left
        </Typography>
      )}
    </Box>
  );
};

interface DeadlineProgressProps {
  deadlineTimestamp: number; // Timestamp in milliseconds
}

const DeadlineProgress: React.FC<DeadlineProgressProps> = ({
  deadlineTimestamp,
}) => {
  const [progress, setProgress] = useState<number>(0);
  const currentTime = Date.now();
  const totalDuration = deadlineTimestamp - currentTime;

  useEffect(() => {
    const updateProgress = () => {
      const currentTime = Date.now();
      const elapsedTime = currentTime - (currentTime - totalDuration);
      const percentage = Math.min((elapsedTime / totalDuration) * 100, 100);
      setProgress(percentage);
    };

    const interval = setInterval(updateProgress, 1000); // Update progress every second
    return () => clearInterval(interval); // Cleanup interval on component unmount
  }, [totalDuration]);

  // Convert timestamp to a readable string using moment
  const deadlineMoment = moment(deadlineTimestamp);
  const currentMoment = moment();
  const timeLeftFormatted = deadlineMoment.from(currentMoment); // e.g., "in 5 days", "in 3 hours", or "a few seconds ago"
  const timeLeft = deadlineTimestamp - currentTime;

  return (
    <Box>
      <Typography variant="body2" color="textSecondary">
        {timeLeft > 0 ? `Config ends ${timeLeftFormatted}` : "Deadline Passed"}
        {/*<CountdownTimer deadlineTimestamp={deadlineTimestamp} />*/}
      </Typography>
      <LinearProgress variant="determinate" value={progress} />
    </Box>
  );
};

function Airdrop(): ReactElement {
  const readOnly = true;

  const { loading } = useSelector((state: RootState) => state.node);
  const { activeAccount } = useWallet();

  const { account } = useSelector((state: RootState) => state.user);
  const { availableContracts } = account;

  const dispatch = useAppDispatch();

  // MAINNET
  const parent_id = AIRDROP_CTC_INFO;
  const funder = AIRDROP_FUNDER;

  const [airdropContracts, setAirdropContracts] = useState<AccountData[]>([]);
  const [airdrop2Contracts, setAirdrop2Contracts] = useState<AccountData[]>([]);

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
  }, [availableContracts]);

  const accountData = account.data;

  const isDataLoading = loading || account.loading;

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

  const [tabIndex, setTabIndex] = useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabIndex(newValue);
  };

  const step_rate = (period: number) => {
    switch (period) {
      case 1:
        return 10;
      case 2:
        return 12;
      case 3:
        return 15;
      case 4:
        return 18;
      case 5:
        return 20;
      default:
        return 0;
    }
  };

  function a11yProps(index: number) {
    return {
      id: `simple-tab-${index}`,
      "aria-controls": `simple-tabpanel-${index}`,
    };
  }

  const deadline = "2024-09-25T00:00:00Z"; // Example deadline

  return (
    <div className="overview-wrapper">
      <div className="overview-container">
        <div
          className="overview-header"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-start",
          }}
        >
          <div className="px-2 sm:px-0">Lockup Config</div>
        </div>
        <div className="overview-body px-2 sm:px-0">
          {!isDataLoading &&
          accountData &&
          airdropContracts.length + airdrop2Contracts.length > 0 ? (
            <div>
              {!isDataLoading && accountData && airdropContracts.length > 0 ? (
                <Box
                  sx={{
                    background: "space",
                    padding: "20px",
                    borderRadius: "20px",
                    marginTop: "20px",
                    boxShadow: "0 0 20px rgba(0, 0, 0, 0.1)",
                  }}
                >
                  <div
                    className="overview-subheader"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "flex-start",
                    }}
                  >
                    <div>Phase I</div>
                  </div>
                  <DeadlineProgress
                    deadlineTimestamp={
                      airdropContracts[0].global_deadline * 1000
                    }
                  />
                  <Table
                    contracts={airdropContracts}
                    funder={funder}
                    parent_id={parent_id}
                    rate={step_rate}
                    readOnly={readOnly}
                  ></Table>
                </Box>
              ) : null}
              {!isDataLoading && accountData && airdrop2Contracts.length > 0 ? (
                <Box
                  sx={{
                    background: "space",
                    padding: "20px",
                    borderRadius: "20px",
                    marginTop: "20px",
                    boxShadow: "0 0 20px rgba(0, 0, 0, 0.1)",
                  }}
                >
                  <div
                    className="overview-subheader"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "flex-start",
                    }}
                  >
                    <div>Phase II</div>
                  </div>
                  <DeadlineProgress
                    deadlineTimestamp={
                      airdrop2Contracts[0].global_deadline * 1000
                    }
                  />

                  <Table
                    contracts={airdrop2Contracts.map((contract) => ({
                      ...contract,
                      global_initial: (estimatedReward * 1e6).toString(),
                    }))} // Set the initial amount to the estimated reward
                    funder={funder}
                    parent_id={parent_id}
                    rate={step_rate}
                    readOnly={readOnly}
                  ></Table>
                </Box>
              ) : null}
            </div>
          ) : (
            <Box sx={{ mt: 5 }}>
              <div className="info-msg">
                No contracts found for your account.
              </div>
            </Box>
          )}
        </div>
      </div>
    </div>
  );
}

export default Airdrop;
