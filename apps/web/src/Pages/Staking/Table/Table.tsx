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
import { NavLink } from "react-router-dom";

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

interface CompoundInterestProps {
  principal: number;
  rate: number;
  time: number;
  compoundingsPerYear: number;
}
const CompoundInterest: React.FC<CompoundInterestProps> = (
  props: CompoundInterestProps
) => {
  const r = props.rate / 100; // Convert percentage to decimal
  const A =
    props.principal *
    Math.pow(
      1 + r / props.compoundingsPerYear,
      props.compoundingsPerYear * props.time
    );

  return <div>{formatNumber(A)} VOI</div>;
};

interface LockupProps {
  funder: string;
  parent_id: number;
  rate: (period: number) => number;
}
const StakingTable: React.FC<LockupProps> = ({ funder, parent_id, rate }) => {
  const { account, staking, contract } = useSelector(
    (state: RootState) => state.user
  );

  const { availableContracts, data: accountData } = account;

  console.log({ accountData });

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
              <TableCell>Amount</TableCell>
              <TableCell>Lockup</TableCell>
              <TableCell>Vesting</TableCell>
              <TableCell>Total</TableCell>
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
                    ? formatNumber(
                        ((amt, r) => amt + r * amt)(
                          Number(contract.global_initial) / 1e6,
                          rate(contract.global_period + 1)
                        )
                      )
                    : "-"}
                </TableCell>
                <TableCell>
                  <div className="lockup-actions">
                    {accountData?.contractId !== contract.contractId ? (
                      <Button
                        onClick={(ev) => {
                          ev.stopPropagation();
                          ev.preventDefault();
                          dispatch(initAccountData(contract));
                        }}
                      >
                        Select
                      </Button>
                    ) : (
                      <NavLink to="/overview">
                        <Button variant="outlined">Go to dashbaord</Button>
                      </NavLink>
                    )}
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
