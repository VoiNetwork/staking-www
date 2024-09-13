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
} from "@mui/material";
import ContractPicker from "../ContractPicker/ContractPicker";
import { useSelector } from "react-redux";
import { RootState, useAppDispatch } from "../../Redux/store";
import moment from "moment";
import humanizeDuration from "humanize-duration";
import Lockup from "../../Pages/Airdrop/Lockup/Lockup";
import { useWallet } from "@txnlab/use-wallet-react";
import {
  initAccountData,
  loadAccountData,
} from "../../Redux/staking/userReducer";

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

const HorizontalStepper: React.FC = () => {
  const { account, staking, contract } = useSelector(
    (state: RootState) => state.user
  );

  const { availableContracts, data: accountData } = account;

  console.log({ accountData });

  const funder = "BNERIHFXRPMF5RI4UQHMB6CFZ4RVXIBOJUNYEUXKDUSETECXDNGWLW5EOY";

  const filteredContracts = availableContracts.filter(
    (contract) => contract.global_funder === funder
  );

  console.log({ filteredContracts });

  const dispatch = useAppDispatch();

  const rate = (period: number) => {
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

  const Step1Select = () => {
    const { activeAccount } = useWallet();
    return (
      <Stack gap={5} sx={{ minHeight: 300 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Deadline</TableCell>
              <TableCell>Amount</TableCell>
              <TableCell>Lockup</TableCell>
              <TableCell>Vesting</TableCell>
              <TableCell>Stakeable Balance</TableCell>
              <TableCell>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredContracts.map((contract) => (
              <TableRow key={contract.contractId}>
                <TableCell>
                  <UnixToDateTime
                    timestamp={Number(contract.global_deadline)}
                  />
                </TableCell>
                <TableCell>
                  {formatNumber(Number(contract.global_initial) / 1e6)} VOI
                </TableCell>
                <TableCell>
                  {contract.global_period === 0
                    ? "-"
                    : humanizeDuration(
                        Number(contract.global_period) *
                          Number(contract.global_lockup_delay) *
                          Number(contract.global_period_seconds) *
                          1000,
                        { units: ["y"], round: true }
                      )}
                </TableCell>
                <TableCell>
                  {humanizeDuration(
                    Number(contract.global_distribution_count) *
                      Number(contract.global_distribution_seconds) *
                      1000,
                    { units: ["y"], round: true }
                  )}
                </TableCell>

                <TableCell>
                  <CompoundInterest
                    principal={Number(contract.global_initial) / 1e6}
                    time={contract.global_period}
                    rate={rate(contract.global_period)}
                    compoundingsPerYear={1}
                  />
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
                      <Button
                        variant={"outlined"}
                        color={"primary"}
                        onClick={() => {
                          setLockupModalVisibility(true);
                        }}
                      >
                        Update Lockup
                      </Button>
                    )}
                    {accountData && activeAccount ? (
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
                      ></Lockup>
                    ) : null}
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

export default HorizontalStepper;
