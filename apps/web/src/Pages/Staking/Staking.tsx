import "./Staking.scss";
import React, { ReactElement, useState } from "react";
import { useWallet } from "@txnlab/use-wallet-react";
import { LoadingTile } from "@repo/ui";
import { useSelector } from "react-redux";
import { RootState, useAppDispatch } from "../../Redux/store";
import Table from "./Table/Table";

import Lockup from "./Lockup/Lockup";
import {
  loadAccountData,
  loadAvailableBalance,
} from "../../Redux/staking/userReducer";
import moment from "moment";
import { Button, Stack, Typography } from "@mui/material";
import BlinkingText from "../../Components/BlinkingText/BlinkingText";

function Staking(): ReactElement {
  const { loading } = useSelector((state: RootState) => state.node);
  const { activeAccount } = useWallet();

  const { account, staking, contract } = useSelector(
    (state: RootState) => state.user
  );

  const { availableContracts } = account;

  const funder = "FYWCMNT4URFQ4VTQ746KBJDMD53VELRRLBJXRKONC6BFF5XIOYLLQPQILU";
  const step_funder =
    "FYWCMNT4URFQ4VTQ746KBJDMD53VELRRLBJXRKONC6BFF5XIOYLLQPQILU";
  const step_parent_id = 295512;

  const filteredContracts = availableContracts.filter(
    (contract) =>
      contract.global_funder === funder &&
      contract.global_parent_id === step_parent_id &&
      contract.global_owner === activeAccount?.address
  );

  const dispatch = useAppDispatch();

  const accountData = account.data;

  const isDataLoading = loading || account.loading || staking.loading;

  const [isLockupModalVisible, setLockupModalVisibility] =
    useState<boolean>(false);

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

  const startTime = new Date("2024-09-20T00:00:00Z"); // UTC+0 start time (week 4)

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
          <div style={{ marginLeft: "10px" }}>Staking</div>
          {activeAccount && (
            <Lockup
              show={isLockupModalVisible}
              address={activeAccount.address}
              onClose={() => {
                setLockupModalVisibility(false);
              }}
              onSuccess={async () => {
                setLockupModalVisibility(false);
                dispatch(loadAccountData(activeAccount.address));
                dispatch(loadAvailableBalance(activeAccount.address));
              }}
              rate={computeRate(weeksPassed + 1)}
            ></Lockup>
          )}
          <Stack
            direction="row"
            spacing={2}
            sx={{ alignItems: "center", marginRight: "10px" }}
          >
            {!isLockupModalVisible ? <BlinkingText text="Start here" /> : null}
            <Button
              variant="outlined"
              onClick={() => {
                setLockupModalVisibility(true);
              }}
            >
              Stake
            </Button>
          </Stack>
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
              No staking contract found for your account. Learn more about Voi
              staking contracts and the staking program: <br />
              <br />
              <ul>
                <li>
                  <a
                    target="_blank"
                    href="https://medium.com/@voifoundation/understanding-voi-staking-contracts-delegation-and-other-key-features-e6b117bad0ac"
                  >
                    Understanding Voi Staking
                  </a>
                </li>
              </ul>
              <br />
              <Typography variant="h6">Steps</Typography>
              <ol>
                <li>
                  1. Click on the "Stake" button to begin to enter stake amount
                  and lockup duration
                </li>
                <li>2. Confirm the stake amount and lockup duration</li>
                <li>3. Sign transaction</li>
              </ol>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export default Staking;
