import React, { useState } from "react";
import {
  Stepper,
  Step,
  StepLabel,
  Button,
  Typography,
  Stack,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Tab,
  Box,
} from "@mui/material";
import ContractPicker from "../../../Components/pickers/ContractPicker/ContractPicker";
import { useSelector } from "react-redux";
import { RootState, useAppDispatch } from "../../../Redux/store";
import moment from "moment";
import humanizeDuration from "humanize-duration";
import Lockup from "../Lockup/Lockup";
import { useWallet } from "@txnlab/use-wallet-react";
import {
  initAccountData,
  loadAccountData,
} from "../../../Redux/staking/userReducer";
import { NavLink, useNavigate } from "react-router-dom";
import { InfoTooltip } from "../../../Components/InfoToolTip/InfoToolTip";

const formatNumber = (number: number): string => {
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    compactDisplay: "short",
    maximumFractionDigits: 1,
  }).format(number);
};

const UnixToDateTime: React.FC<{ timestamp: number }> = ({ timestamp }) => {
  const dateTimeString = moment.unix(timestamp).format("YYYY-MM-DD HH:mm:ss");
  const now = moment().unix();
  const deadlineDuration = humanizeDuration((timestamp - now) * 1000, {
    largest: 2,
    round: false,
  });
  return (
    <div>
      <p>{dateTimeString}</p>
      <p>{deadlineDuration}</p>
    </div>
  );
};

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

interface LockupProps {
  funder: string;
  parent_id: number;
  rate: (period: number) => number;
}
const StakingTable: React.FC<LockupProps> = ({ funder, parent_id, rate }) => {
  const navigate = useNavigate();
  const { account, staking, contract } = useSelector(
    (state: RootState) => state.user
  );

  const { availableContracts, data: accountData } = account;

  const filteredContracts = availableContracts.filter(
    (contract) =>
      contract.global_funder === funder &&
      contract.global_parent_id === parent_id
  );

  console.log({ filteredContracts });

  const dispatch = useAppDispatch();

  const Step1Select = () => {
    const { activeAccount } = useWallet();
    return (
      <Stack gap={5} sx={{ minHeight: 300 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  Amount
                  <InfoTooltip
                    title={
                      <div>
                        <Typography variant="h6">Amount</Typography>
                        <Typography variant="body2">
                          The minimum amount of VOI tokens that will be locked
                          up after funding that does not include lockup bonus
                          tokens.
                        </Typography>
                      </div>
                    }
                  />
                </Box>
              </TableCell>
              <TableCell>
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  Lockup
                  <InfoTooltip
                    title={
                      <div>
                        <Typography variant="h6">Lockup</Typography>
                        <Typography variant="body2">
                          The duration of the lockup period. The lockup period
                          is the time during which the locked up tokens cannot
                          be withdrawn.
                        </Typography>
                      </div>
                    }
                  />
                </Box>
              </TableCell>
              <TableCell>
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  Vesting
                  <InfoTooltip
                    title={
                      <div>
                        <Typography variant="h6">Vesting</Typography>
                        <Typography variant="body2">
                          The duration of the lockup period. The lockup period
                          is the time during which the locked up tokens cannot
                          be withdrawn.
                        </Typography>
                      </div>
                    }
                  />
                </Box>
              </TableCell>
              <TableCell>
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  Stakeable Balance
                  <InfoTooltip
                    title={
                      <div>
                        <Typography variant="h6">Stakeable Balance</Typography>
                        <Typography variant="body2">
                          The stakeable balance is the amount of tokens that can
                          be staked to earn rewards depending on the lockup
                          period. It is calculated based on the lockup period
                          and airdrop amount.
                        </Typography>
                      </div>
                    }
                  />
                </Box>
              </TableCell>
              <TableCell>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredContracts.map((contract) => (
              <TableRow key={contract.contractId}>
                <TableCell>
                  {formatNumber(Number(contract.global_initial) / 1e6)} VOI
                </TableCell>
                <TableCell>
                  {humanizeDuration(
                    (Number(contract.global_period) *
                      Number(contract.global_lockup_delay) +
                      Number(contract.global_vesting_delay)) *
                      Number(contract.global_period_seconds) *
                      1000,
                    { units: ["mo"], round: true }
                  )}
                </TableCell>
                <TableCell>
                  {humanizeDuration(
                    Number(contract.global_distribution_count) *
                      Number(contract.global_distribution_seconds) *
                      1000,
                    { units: ["mo"], round: true }
                  )}
                </TableCell>
                <TableCell>
                  {Number(contract.global_initial) > 0
                    ? `${formatNumber(
                        ((amt, r) => amt + r * amt)(
                          Number(contract.global_initial) / 1e6,
                          rate(contract.global_period + 1)
                        )
                      )} VOI`
                    : "-"}
                </TableCell>
                <TableCell>
                  <div className="lockup-actions">
                    <Button
                      variant="outlined"
                      onClick={(ev) => {
                        ev.stopPropagation();
                        ev.preventDefault();
                        dispatch(initAccountData(contract));
                        navigate("/overview");
                      }}
                    >
                      View
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Stack>
    );
  };

  const [isLockupModalVisible, setLockupModalVisibility] =
    useState<boolean>(false);

  return (
    <Stack gap={5}>
      <Step1Select />
    </Stack>
  );
};

export default StakingTable;
