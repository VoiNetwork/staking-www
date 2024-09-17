import "./Staking.scss";
import { ReactElement, useState } from "react";
import { useWallet } from "@txnlab/use-wallet-react";
import { LoadingTile } from "@repo/ui";
import { useSelector } from "react-redux";
import { RootState, useAppDispatch } from "../../Redux/store";
import Table from "./Table/Table";

import Lockup from "./Lockup/Lockup";
import { loadAccountData } from "../../Redux/staking/userReducer";
import moment from "moment";
import { Button } from "@mui/material";

function Staking(): ReactElement {
  const { loading } = useSelector((state: RootState) => state.node);
  const { activeAccount } = useWallet();

  const { account, staking, contract } = useSelector(
    (state: RootState) => state.user
  );

  const { availableContracts } = account;

  const funder = "BNERIHFXRPMF5RI4UQHMB6CFZ4RVXIBOJUNYEUXKDUSETECXDNGWLW5EOY";

  const filteredContracts = availableContracts.filter(
    (contract) => contract.global_funder === funder
  );

  const dispatch = useAppDispatch();

  const accountData = account.data;

  const isDataLoading = loading || account.loading || staking.loading;

  const [isLockupModalVisible, setLockupModalVisibility] =
    useState<boolean>(false);

  const step_funder =
    "BNERIHFXRPMF5RI4UQHMB6CFZ4RVXIBOJUNYEUXKDUSETECXDNGWLW5EOY";
  const step_parent_id = 87502365;

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

  //const startTime = new Date("2024-08-17T00:00:00Z"); // UTC+0 start time 
  //const startTime = new Date("2024-08-24T00:00:00Z"); // UTC+0 start time (week 4)
  //const startTime = new Date("2024-09-01T00:00:00Z"); // UTC+0 start time (week 3)
  //const startTime = new Date("2024-09-07T00:00:00Z"); // UTC+0 start time (week 2)
  const startTime = new Date("2024-09-14T00:00:00Z"); // UTC+0 start time (week 1)
  const weeksPassed = getWeeksFromTime(startTime);

  console.log({ weeksPassed });

  // utils

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

  const period_limit = 18;

  const computeRate = (week: number) => (period: number) => {
    const lockupMultiplier = computeLockupMultiplier(period, period_limit);
    const timingMultiplier = computeTimingMultiplier(week);
    return lockupMultiplier * timingMultiplier;
  };

  return (
    <div className="overview-wrapper">
      <div className="overview-container">
        <div className="overview-header">
          <div>Staking</div>
          {accountData && activeAccount && (
            <Lockup
              show={isLockupModalVisible}
              accountData={accountData}
              address={activeAccount.address}
              onClose={() => {
                setLockupModalVisibility(false);
              }}
              onSuccess={() => {
                dispatch(loadAccountData(activeAccount.address));
                setLockupModalVisibility(false);
              }}
              rate={computeRate(weeksPassed + 1)}
            ></Lockup>
          )}
          <Button
            variant="outlined"
            onClick={() => {
              setLockupModalVisibility(true);
            }}
          >
            Stake
          </Button>
        </div>
        <div className="overview-body">
          {isDataLoading && <LoadingTile></LoadingTile>}
          {!isDataLoading && accountData && filteredContracts.length > 0 ? (
            <Table
              funder={step_funder}
              parent_id={step_parent_id}
              rate={computeRate(weeksPassed + 1)}
            ></Table>
          ) : null}
          {!isDataLoading && !accountData && filteredContracts.length === 0 ? (
            <div className="info-msg">
              No contract details found for your account.
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export default Staking;
