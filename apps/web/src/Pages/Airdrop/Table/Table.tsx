import React, { useEffect, useState } from "react";
import {
  Button,
  Typography,
  Stack,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Fade,
  Box,
  Grid,
} from "@mui/material";
import { useSelector } from "react-redux";
import { RootState, useAppDispatch } from "../../../Redux/store";
import moment from "moment";
import humanizeDuration from "humanize-duration";
import { useWallet } from "@txnlab/use-wallet-react";
import { Link } from "react-router-dom";
import LockupPicker from "../../../Components/pickers/LockupPicker/LockupPicker";
import { AccountData } from "@repo/voix";
import ArrowRightAltIcon from "@mui/icons-material/ArrowRightAlt";
import Tooltip from "@mui/material/Tooltip";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import Confirmation from "../Confirmation/Confirmation";
import { loadAccountData } from "../../../Redux/staking/userReducer";
import { useDispatch } from "react-redux";

const formatNumber = (number: number): string => {
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    compactDisplay: "short",
    maximumFractionDigits: 1,
  }).format(number);
};

const UnixToDateTime: React.FC<{ timestamp: number; color: "string" }> = ({
  timestamp,
  color = "inherit",
}) => {
  const dateTimeString = moment.unix(timestamp).format("YYYY-MM-DD HH:mm:ss");
  const now = moment().unix();
  const deadlineDuration = humanizeDuration((timestamp - now) * 1000, {
    largest: 2,
    round: false,
  });
  return (
    <div
      style={{
        backgroundColor: "grey",
        padding: "15px",
        borderRadius: "25px",
        boxShadow: "0 0 10px rgba(0, 0, 0, 0.1)",
      }}
    >
      <p style={{ color: "white" }}>{dateTimeString}</p>
      <p style={{ color }}>{deadlineDuration}</p>
    </div>
  );
};

interface InfoTooltipProps {
  title: any;
  placement?: "top" | "bottom" | "left" | "right";
}
export function InfoTooltip(props: InfoTooltipProps) {
  return (
    <Tooltip title={props.title} placement={props.placement || "top"}>
      <InfoOutlinedIcon style={{ fontSize: "16px", cursor: "pointer" }} />
    </Tooltip>
  );
}

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
interface CompoundInterestProps {
  principal: number;
  rate: number;
  time: number;
  compoundingsPerYear: number;
  difference?: boolean;
}
const CompoundInterest: React.FC<CompoundInterestProps> = (
  props: CompoundInterestProps
) => {
  const r = props.rate / 100; // Convert percentage to decimal
  const A = calculateCompoundInterest(
    props.principal,
    props.rate,
    props.time,
    props.compoundingsPerYear
  );
  return (
    <div
      style={{
        fontWeight: 900,
        textShadow: "0 0 black",
      }}
    >
      {props.difference ? formatNumber(A - props.principal) : formatNumber(A)}{" "}
      VOI
    </div>
  );
};

interface LockupProps {
  funder: string;
  parent_id: number;
  rate: (period: number) => number;
  contracts: AccountData[];
}
const AirdropTable: React.FC<LockupProps> = ({
  funder,
  parent_id,
  rate,
  contracts,
}) => {
  const { account } = useSelector((state: RootState) => state.user);

  const oneWeekInSeconds = 6 * 24 * 60 * 60; // 1 week in seconds

  const calculateColor = (secondsRemaining: number) => {
    if (secondsRemaining > oneWeekInSeconds) {
      return "green";
    } else {
      let percentageLeft = secondsRemaining / oneWeekInSeconds;
      let red = Math.floor(255 * (1 - percentageLeft)); // More red as time decreases
      let green = Math.floor(255 * percentageLeft); // Less green as time decreases
      return `rgb(${red}, ${green}, 0)`;
    }
  };

  const [selection, setSelection] = useState<AccountData | null>(null);
  const [showConfirmation, setShowConfirmation] = useState<boolean>(false);

  const Step1Select = () => {
    const { activeAccount } = useWallet();
    const dispatch = useAppDispatch();
    return contracts.length > 0 ? (
      <Stack gap={5} sx={{ mt: 5 }}>
        {/*<Grid spacing={2} container sx={{ alignItems: "center" }}>
          <Grid item xs={12} md={6}>
            <Typography variant="h6">Deadline to configure</Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <UnixToDateTime
              color={calculateColor(
                contracts[0].global_deadline - moment().unix()
              )}
              timestamp={Number(contracts[0].global_deadline)}
            />
          </Grid>
              </Grid>*/}
        {selection &&
        contracts.length > 0 &&
        contracts[0].global_period !== selection.global_period ? (
          <Fade in={true}>
            <Stack
              direction="row"
              sx={{
                justifyContent: "space-between",
                alignItems: "center",
                padding: "10px",
                border: "1px solid #ccc",
                borderRadius: "5px",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                }}
              >
                Lockup update:{" "}
                {humanizeDuration(
                  Number(contracts[0].global_period) *
                    Number(contracts[0].global_lockup_delay) *
                    Number(contracts[0].global_period_seconds) *
                    1000,
                  { units: ["y"], round: true }
                )}
                <ArrowRightAltIcon />
                {humanizeDuration(
                  Number(selection.global_period) *
                    Number(selection.global_lockup_delay) *
                    Number(selection.global_period_seconds) *
                    1000,
                  { units: ["y"], round: true }
                )}
                {((n) => (
                  <div
                    style={{
                      marginLeft: "10px",
                      color: n > 0 ? "green" : "red",
                      fontWeight: 900,
                      textAlign: "right",
                    }}
                  >
                    ({formatNumber(n)} VOI)
                  </div>
                ))(
                  calculateCompoundInterest(
                    Number(selection.global_initial) / 1e6,
                    rate(selection.global_period),
                    selection.global_period,
                    1
                  ) -
                    calculateCompoundInterest(
                      Number(contracts[0].global_initial) / 1e6,
                      rate(contracts[0].global_period),
                      contracts[0].global_period,
                      1
                    )
                )}
              </Box>
              <Box>
                <Button
                  variant="outlined"
                  onClick={(ev) => {
                    ev.stopPropagation();
                    ev.preventDefault();
                    setShowConfirmation(true);
                  }}
                >
                  Configure
                </Button>
                <Confirmation
                  address={activeAccount?.address || ""}
                  accountData={selection}
                  show={showConfirmation}
                  onClose={() => {
                    setShowConfirmation(false);
                  }}
                  onSuccess={() => {
                    setShowConfirmation(false);
                    setSelection(null);
                    dispatch(loadAccountData(activeAccount?.address || ""));
                  }}
                />
              </Box>
            </Stack>
          </Fade>
        ) : null}

        <Table sx={{ display: { xs: "none", sm: "block" } }}>
          <TableHead>
            <TableRow>
              {/*<TableCell>Deadline</TableCell>*/}
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
                          The duration of the vesting period. The vesting period
                          is the time during which the locked up tokens can be
                          withdrawn in equal parts such as monthly.
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
              <TableCell>
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  Lockup Bonus
                  <InfoTooltip
                    title={
                      <div>
                        <Typography variant="h6">Lockup Bonus</Typography>
                        <Typography variant="body2">
                          The bonus based on lockup period. This bonus is
                          calculated based on the lockup period and airdrop
                          amount.
                        </Typography>
                      </div>
                    }
                  />
                </Box>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {contracts.map((contract) => (
              <TableRow key={contract.contractId}>
                <TableCell>
                  {contract.global_initial !== "0" ? (
                    `${formatNumber(Number(contract.global_initial) / 1e6)} VOI`
                  ) : (
                    <Link
                      to={`https://voirewards.com/phase2/${activeAccount?.address || ""}?rewards=1`}
                      target="_blank"
                    >
                      More info
                    </Link>
                  )}
                </TableCell>
                <TableCell>
                  <LockupPicker
                    onSelection={setSelection}
                    contract={selection || contract}
                  />
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
                  {!!selection ? (
                    <CompoundInterest
                      principal={Number(contract.global_initial) / 1e6}
                      time={selection.global_period}
                      rate={rate(selection.global_period)}
                      compoundingsPerYear={1}
                    />
                  ) : (
                    <CompoundInterest
                      principal={Number(contract.global_initial) / 1e6}
                      time={contract.global_period}
                      rate={rate(contract.global_period)}
                      compoundingsPerYear={1}
                    />
                  )}
                </TableCell>
                <TableCell
                  sx={{
                    color:
                      rate((selection || contract).global_period) > 0
                        ? "green"
                        : "inherit",
                    fontWeight: 900,
                    textAlign: "right",
                  }}
                >
                  {!!selection ? (
                    <CompoundInterest
                      principal={Number(contract.global_initial) / 1e6}
                      time={selection.global_period}
                      rate={rate(selection.global_period)}
                      compoundingsPerYear={1}
                      difference={true}
                    />
                  ) : (
                    <CompoundInterest
                      principal={Number(contract.global_initial) / 1e6}
                      time={contract.global_period}
                      rate={rate(contract.global_period)}
                      compoundingsPerYear={1}
                      difference={true}
                    />
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Stack>
    ) : null;
  };
  return (
    <Stack gap={5}>
      <Step1Select />
    </Stack>
  );
};

export default AirdropTable;
