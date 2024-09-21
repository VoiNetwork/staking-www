import "./Airdrop.scss";
import { ReactElement, useEffect, useState } from "react";
import { useWallet } from "@txnlab/use-wallet-react";
import { AccountData } from "@repo/voix";
import { useSelector } from "react-redux";
import { RootState, useAppDispatch } from "../../Redux/store";
import { Box } from "@mui/material";
import Table from "./Table/Table";
import axios from "axios";

import { LinearProgress, Typography } from "@mui/material";
import moment from "moment";

export const calculatePercentIncrease = (start: number, end: number) => {
  return ((end - start) / start) * 100;
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
      </Typography>
      <LinearProgress variant="determinate" value={progress} />
    </Box>
  );
};

function Airdrop(): ReactElement {
  const { loading } = useSelector((state: RootState) => state.node);
  const { activeAccount } = useWallet();

  const { account } = useSelector((state: RootState) => state.user);
  const { availableContracts } = account;

  // MAINNET
  const funder = "62TIVJSZOS4DRSSYYDDZELQAGFYQC5JWKCHRBPPYKTZN2OOOXTGLB5ZJ4E";
  const parent_id = 5211;

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
          <div>Lockup Config</div>
        </div>
        <div className="overview-body">
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
