import React, { useState } from "react";
import {
  Button,
  Typography,
  Stack,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Box,
} from "@mui/material";
import { useSelector } from "react-redux";
import { RootState, useAppDispatch } from "../../../Redux/store";
import humanizeDuration from "humanize-duration";
import { initAccountData } from "../../../Redux/staking/userReducer";
import { useNavigate } from "react-router-dom";
import { InfoTooltip } from "../../../Components/InfoToolTip/InfoToolTip";
import { NumericFormat } from "react-number-format";

const formatNumber = (number: number): string => {
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    compactDisplay: "short",
    maximumFractionDigits: 1,
  }).format(number);
};

interface StakingTableProps {
  funder: string;
  parent_id: number;
  rate: (week: number) => (period: number) => number;
  start: number;
}
const StakingTable: React.FC<StakingTableProps> = ({
  funder,
  parent_id,
  rate,
  start,
}) => {
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
                  Week
                  <InfoTooltip
                    title={
                      <div>
                        <Typography variant="h6">Week</Typography>
                        <Typography variant="body2">
                          Week of stake according to Voi staking program.
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
            {filteredContracts.map((contract) => {
              const week =
                Math.floor((contract.global_deadline - start) / 604800) + 1;
              const stakeableBalance = ((amt, r) => amt + r * amt)(
                Number(contract.global_initial) / 1e6,
                rate(week)(contract.global_period + 1)
              );
              return (
                <TableRow key={contract.contractId}>
                  <TableCell>
                    {formatNumber(Number(contract.global_initial) / 1e6)} VOI
                  </TableCell>
                  <TableCell>Week {week}</TableCell>
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
                    {Number(contract.global_initial) > 0 ? (
                      <NumericFormat
                        value={stakeableBalance}
                        suffix=" Voi"
                        displayType={"text"}
                        thousandSeparator={true}
                        decimalScale={6}
                      ></NumericFormat>
                    ) : (
                      "-"
                    )}
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
              );
            })}
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
