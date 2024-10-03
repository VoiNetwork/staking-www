import "./StakingForecast.scss";
import React, { ReactElement, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState, useAppDispatch } from "../../Redux/store";
import { useWallet } from "@txnlab/use-wallet-react";
import { LoadingTile, useLoader, useSnackbar } from "@repo/ui";
import {
  Box,
  Button,
  Divider,
  Fade,
  FormControl,
  FormLabel,
  Grid,
  InputAdornment,
  LinearProgress,
  ListItemText,
  Menu,
  MenuItem,
  Stack,
  Typography,
} from "@mui/material";
import { NumericFormat } from "react-number-format";
import { isValidAddress } from "algosdk";
import { CoreStaker, SECOND_IN_MONTH } from "@repo/voix";
import { loadAccountData } from "../../Redux/staking/userReducer";
import TransactionDetails from "../../Components/TransactionDetails/TransactionDetails";
import { useConfirm } from "material-ui-confirm";
import { confirmationProps, ShadedInput } from "@repo/theme";
import ContractPicker from "@/Components/pickers/ContractPicker/ContractPicker";
import LockupPicker from "@/Components/pickers/LockupPicker/LockupPicker";
import humanizeDuration from "humanize-duration";
import { ArrowDropDown } from "@mui/icons-material";
import moment from "moment";
import { useNavigate } from "react-router-dom";
import Banner from "@/Components/Banner/Banner";
import DeadlineCountdown from "@/Components/DeadlineCountdown/DeadlineCountdown";

function StakingForecast(): ReactElement {
  const navigate = useNavigate();
  const [menuSelection, setMenuSelection] = useState<number>(0);
  const [menuAnchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  function closeMenu() {
    setAnchorEl(null);
  }

  const confirmation = useConfirm();
  const { transactionSigner, activeAccount } = useWallet();

  const { showException, showSnack } = useSnackbar();
  const { showLoader, hideLoader } = useLoader();

  const { loading } = useSelector((state: RootState) => state.node);
  const { account, staking, contract } = useSelector(
    (state: RootState) => state.user
  );

  const dispatch = useAppDispatch();

  const accountData = account.data;
  const stakingAccount = staking.account;
  const contractState = contract.state;

  const isDataLoading =
    loading || account.loading || staking.loading || contract.loading;

  const [amount, setAmount] = useState<number>(1);
  const [lockupPeriod, setLockupPeriod] = useState<string>("0");
  const [forcastedRate, setForecastedRate] = useState<number>(0);
  const [forecastedReward, setForecastedReward] = useState<number>(0);
  const [totalTokens, setTotalTokens] = useState<number>(0);
  const [confirmed, setConfirmed] = useState<boolean>(false);

  useEffect(() => {
    if (activeAccount) {
      dispatch(loadAccountData(activeAccount.address));
    }
  }, [activeAccount, dispatch]);

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
  const week1Deadline = new Date("2024-10-07T00:00:00"); // Replace with your Week 1 deadline date

  const weeksPassed = getWeeksFromTime(startTime);

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

  useEffect(() => {
    if (Number.isNaN(weeksPassed) || Number.isNaN(lockupPeriod)) {
      setForecastedRate(0);
    }
    return setForecastedRate(
      computeRate(weeksPassed + 1)(parseInt(lockupPeriod))
    );
  }, [weeksPassed, lockupPeriod]);

  useEffect(() => {
    if (!amount || !lockupPeriod || !forcastedRate) {
      setForecastedReward(0);
    }
    return setForecastedReward(amount * forcastedRate);
  }, [amount, lockupPeriod, forcastedRate]);

  useEffect(() => {
    if (!forecastedReward || !forcastedRate) {
      setTotalTokens(0);
    }
    return setTotalTokens(forecastedReward + amount);
  }, [amount, forecastedReward]);

  return (
    <>
      <DeadlineCountdown deadline={week1Deadline} />
      <div className="staking-forecast-wrapper">
        <Banner maxWidth="830px" />
        <div className="staking-forecast-container">
          <div className="staking-forecast-header">
            <div>Staking Forecast</div>
          </div>
          <Stack direction="column" spacing={2}>
            <Typography variant="body2" className="staking-forecast-subheader">
              The staking forecast tool allows you to easily forecast your
              staking rewards that best suit your needs.
            </Typography>
            <Typography variant="body2" className="staking-forecast-subheader">
              Looking to acquire more Voi to stake? Use a centralized exchange
              such as{" "}
              <a
                style={{
                  color: "lightgoldenrodyellow",
                  textDecoration: "none",
                  fontWeight: 900,
                }}
                href="https://www.mexc.com/exchange/VOI_USDT?_from=header"
                target="_blank"
              >
                MEXC
              </a>{" "}
              or{" "}
              <a
                style={{
                  color: "lightgoldenrodyellow",
                  textDecoration: "none",
                  fontWeight: 900,
                }}
                href="https://www.coinstore.com/spot/VOIUSDT"
                target="_blank"
              >
                Coinstore
              </a>
              . If you are looking to bridge from another network read{" "}
              <a
                style={{
                  color: "lightgoldenrodyellow",
                  textDecoration: "none",
                  fontWeight: 900,
                }}
                href="https://medium.com/@voifoundation/staking-program-how-to-guide-382ea5085dab"
                target="_blank"
              >
                the staking guide
              </a>
              .
            </Typography>
            <div className="staking-forecast-body">
              {isDataLoading && <LoadingTile></LoadingTile>}

              {!isDataLoading &&
                activeAccount &&
                accountData &&
                stakingAccount &&
                contractState && (
                  <div>
                    <div className="props">
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
                          <Divider></Divider>
                        </Grid>
                        <Grid item xs={12} sm={12} md={6} lg={6} xl={6}>
                          <FormControl fullWidth variant="outlined">
                            <FormLabel className="classic-label flex">
                              <div>
                                Amount to Stake
                                <span
                                  style={{
                                    color: "lightgoldenrodyellow",
                                    marginLeft: "10px",
                                    fontSize: "12px",
                                    cursor: "pointer",
                                  }}
                                  onClick={() => {
                                    confirmation({
                                      ...confirmationProps,
                                      title: (
                                        <div style={{ textAlign: "left" }}>
                                          Need more VOI?
                                        </div>
                                      ),
                                      description: (
                                        <div
                                          style={{
                                            textAlign: "left",
                                          }}
                                        >
                                          <Typography variant="body2">
                                            <span style={{ fontWeight: 900 }}>
                                              Option 1: Buy VOI on Centralized
                                              Exchange
                                            </span>
                                            <br />
                                            <p>
                                              Go to an exchange. Currently, you
                                              must be located outside of the
                                              United States to use{" "}
                                              <a
                                                href="https://www.mexc.com/exchange/VOI_USDT"
                                                target="_blank"
                                              >
                                                MEXC
                                              </a>{" "}
                                              or{" "}
                                              <a
                                                href="ttps://www.coinstore.com/spot/VOIUSDT"
                                                target="_blank"
                                              >
                                                Coinstore
                                              </a>
                                              .
                                            </p>
                                            <br />
                                            <span style={{ fontWeight: 900 }}>
                                              Option 2: Bridge with{" "}
                                              <a
                                                href="https://app.aramid.finance/bridge/Base/Voi/USDC/Aramid%20USDC"
                                                target="_blank"
                                              >
                                                Aramid
                                              </a>
                                            </span>
                                            <br />
                                            <p>
                                              Bridge USDC from Base, Arbitrum or
                                              Algorand.
                                            </p>
                                            <br />
                                            <span style={{ fontWeight: 900 }}>
                                              Option 3: Swap
                                            </span>
                                            <br />
                                            <p>
                                              Swap USDC or other token for VOI
                                              on{" "}
                                              <a
                                                href="https://voi.humble.sh"
                                                target="_blank"
                                              >
                                                HumbPact Swap
                                              </a>
                                              .
                                            </p>
                                          </Typography>
                                        </div>
                                      ),
                                      confirmationText: "Close",
                                      hideCancelButton: true,
                                    });
                                  }}
                                >
                                  Need more VOI?
                                </span>
                              </div>
                            </FormLabel>
                            <ShadedInput
                              value={amount}
                              onChange={(ev) => {
                                setAmount(parseFloat(ev.target.value) || 0);
                              }}
                              type="number"
                              fullWidth
                              endAdornment={
                                <InputAdornment position="end">
                                  VOI
                                </InputAdornment>
                              }
                            />
                          </FormControl>
                        </Grid>

                        <Grid item xs={12} sm={12} md={6} lg={6} xl={6}>
                          <FormControl fullWidth variant="outlined">
                            <FormLabel className="classic-label flex">
                              <div>Lockup Period (Months)</div>
                            </FormLabel>
                            <ShadedInput
                              value={lockupPeriod}
                              onChange={(ev) => {
                                if (ev.target.value === "") {
                                  setLockupPeriod("");
                                } else if (
                                  parseInt(ev.target.value) >= 0 &&
                                  parseInt(ev.target.value) <= 18
                                ) {
                                  setLockupPeriod(
                                    `${parseInt(ev.target.value) || 0}`
                                  );
                                }
                              }}
                              type="number"
                              fullWidth
                            />
                          </FormControl>
                        </Grid>

                        <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
                          <Divider></Divider>
                        </Grid>
                        <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
                          <LinearProgress
                            sx={{ borderRadius: "5px", height: "10px" }}
                            color="inherit"
                            variant="determinate"
                            value={
                              ((Math.min(12, parseInt(lockupPeriod)) +
                                parseInt(lockupPeriod)) /
                                (18 + 12)) *
                              100
                            }
                          />
                        </Grid>
                        <Grid item xs={12} sm={12} md={6} lg={6} xl={6}>
                          <FormControl fullWidth variant="outlined">
                            <FormLabel className="classic-label flex">
                              <div>Vesting Period (Months)</div>
                            </FormLabel>
                            {humanizeDuration(
                              Math.min(12, parseInt(lockupPeriod)) *
                                SECOND_IN_MONTH *
                                1000,
                              {
                                units: ["y", "mo"],
                                round: true,
                              }
                            )}
                          </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={12} md={6} lg={6} xl={6}>
                          <FormControl fullWidth variant="outlined">
                            <FormLabel className="classic-label flex">
                              <div>Total Period (Months)</div>
                            </FormLabel>
                            {humanizeDuration(
                              (Math.min(12, parseInt(lockupPeriod)) +
                                parseInt(lockupPeriod)) *
                                SECOND_IN_MONTH *
                                1000,
                              {
                                units: ["y", "mo"],
                                round: true,
                              }
                            )}
                          </FormControl>
                        </Grid>

                        <Grid item xs={12} sm={12} md={6} lg={4} xl={4}>
                          <FormControl fullWidth variant="outlined">
                            <FormLabel className="classic-label flex">
                              <div>Bonus Rate</div>
                            </FormLabel>
                            <NumericFormat
                              value={(forcastedRate || 0).toFixed(3)}
                              displayType={"text"}
                              suffix="%"
                              thousandSeparator={true}
                            />
                          </FormControl>
                        </Grid>

                        <Grid item xs={12} sm={12} md={6} lg={4} xl={4}>
                          <div className="forecast-result">
                            <div className="forecast-label">
                              Forecasted Reward
                            </div>
                            <div className="forecast-value">
                              <NumericFormat
                                value={forecastedReward.toFixed(3)}
                                suffix=" VOI"
                                displayType={"text"}
                                thousandSeparator={true}
                              />
                            </div>
                          </div>
                        </Grid>

                        <Grid item xs={12} sm={12} md={6} lg={4} xl={4}>
                          <div className="forecast-result">
                            <div className="forecast-label">Total Tokens</div>
                            <div className="forecast-value">
                              <NumericFormat
                                value={totalTokens.toFixed(3)}
                                suffix=" VOI"
                                displayType={"text"}
                                thousandSeparator={true}
                              />
                            </div>
                          </div>
                        </Grid>
                      </Grid>

                      <Menu
                        anchorEl={menuAnchorEl}
                        className="classic-menu"
                        open={Boolean(menuAnchorEl)}
                        disableAutoFocusItem={true}
                        anchorOrigin={{
                          vertical: "bottom",
                          horizontal: "right",
                        }}
                        transformOrigin={{
                          vertical: "top",
                          horizontal: "right",
                        }}
                        PaperProps={{
                          sx: {
                            transform:
                              "translateX(0px) translateY(5px) !important",
                          },
                        }}
                        onClose={closeMenu}
                      >
                        {[...Array(18)].map((_, index) => {
                          // Since keys() gives 0-based index, we add 1 to start from 1
                          const period = index + 1;
                          return (
                            <MenuItem
                              key={period}
                              onClick={(ev) => {
                                ev.stopPropagation();
                                ev.preventDefault();
                                closeMenu();
                                setMenuSelection(period);
                              }}
                            >
                              <ListItemText
                                sx={{
                                  display: "flex",
                                  justifyContent: "space-between",
                                }}
                                disableTypography
                              >
                                <div>{period}</div>
                              </ListItemText>
                            </MenuItem>
                          );
                        })}
                      </Menu>
                    </div>
                    <div
                      className="forecast-button"
                      onClick={() => {
                        if (!activeAccount) {
                          showSnack("Please connect your wallet", "error");
                          return;
                        }
                        confirmation({
                          ...confirmationProps,
                          title: (
                            <div
                              style={{
                                textAlign: "left",
                              }}
                            >
                              Are you sure?
                            </div>
                          ),
                          description: (
                            <div style={{ textAlign: "left" }}>
                              {`You are previewing the staking of ${amount} VOI for ${humanizeDuration(
                                (Math.min(12, parseInt(lockupPeriod)) +
                                  parseInt(lockupPeriod)) *
                                  SECOND_IN_MONTH *
                                  1000,
                                {
                                  units: ["y", "mo"],
                                  round: true,
                                }
                              )} with a bonus rate of ${(
                                100 * forcastedRate
                              ).toFixed(3)}% for a total of ${(
                                amount + forecastedReward
                              ).toFixed(
                                3
                              )} VOI. This will locked for ${humanizeDuration(
                                parseInt(lockupPeriod) * SECOND_IN_MONTH * 1000,
                                {
                                  units: ["y", "mo"],
                                  round: true,
                                }
                              )} months and vested for ${Math.min(
                                12,
                                parseInt(lockupPeriod)
                              )} months.`}
                            </div>
                          ),
                        })
                          .then(() => {
                            //showSnack("Staking forecast generated!", "success");
                            setConfirmed(true);
                          })
                          .catch(() => {});
                      }}
                    >
                      Preview Forecast
                    </div>
                    {confirmed ? (
                      <Fade in={confirmed}>
                        <div
                          style={{
                            marginTop: "20px",
                            textAlign: "left",
                          }}
                        >
                          <Divider sx={{ my: 3 }}></Divider>
                          <Typography variant="h6">What's next?</Typography>
                          <Typography variant="body2">
                            <br />
                            <span style={{ fontWeight: 900 }}>Get VOI</span>
                            <br />
                            <br />
                            Option 1: Buy VOI on Centralized Exchange
                            <br />
                            <p>
                              Go to an exchange. Currently, you must be located
                              outside of the United States to use{" "}
                              <a
                                style={{
                                  color: "lightgoldenrodyellow",
                                  textDecoration: "none",
                                  fontWeight: 900,
                                }}
                                href="https://www.mexc.com/exchange/VOI_USDT"
                                target="_blank"
                              >
                                MEXC
                              </a>{" "}
                              or{" "}
                              <a
                                style={{
                                  color: "lightgoldenrodyellow",
                                  textDecoration: "none",
                                  fontWeight: 900,
                                }}
                                href="ttps://www.coinstore.com/spot/VOIUSDT"
                                target="_blank"
                              >
                                Coinstore
                              </a>
                              .
                            </p>
                            <br />
                            Option 2: Bridge with{" "}
                            <a
                              style={{
                                color: "lightgoldenrodyellow",
                                textDecoration: "none",
                                fontWeight: 900,
                              }}
                              href="https://app.aramid.finance/bridge/Base/Voi/USDC/Aramid%20USDC"
                              target="_blank"
                            >
                              Aramid
                            </a>
                            <br />
                            <p>Bridge USDC from Base, Arbitrum or Algorand.</p>
                            <br />
                            <span style={{ fontWeight: 900 }}>
                              Option 3: Swap
                            </span>
                            <br />
                            <p>
                              Swap USDC or other token for VOI on{" "}
                              <a
                                style={{
                                  color: "lightgoldenrodyellow",
                                  textDecoration: "none",
                                  fontWeight: 900,
                                }}
                                href="https://voi.humble.sh"
                                target="_blank"
                              >
                                HumbPact Swap
                              </a>
                              .
                            </p>
                          </Typography>
                          <Typography variant="body2">
                            <br />
                            <span style={{ fontWeight: 900 }}>Stake VOI</span>
                            <br />
                            <br />
                            <ol>
                              <li>
                                1. Click on the "Stake" button to begin to enter
                                stake amount and lockup duration
                              </li>
                              <li>
                                2. Confirm the stake amount and lockup duration
                              </li>
                              <li>3. Sign transaction</li>
                            </ol>
                            <br />
                            <div>
                              <a
                                onClick={() => {
                                  navigate("/staking");
                                }}
                                style={{
                                  animation: "blinking 2s infinite",
                                  color: "lightgoldenrodyellow",
                                  textDecoration: "none",
                                  fontWeight: 900,
                                }}
                                href="#"
                              >
                                Stake Now
                              </a>
                            </div>
                          </Typography>
                        </div>
                      </Fade>
                    ) : null}
                  </div>
                )}
            </div>
          </Stack>
        </div>
      </div>
    </>
  );
}

export default StakingForecast;
