import React, { ReactElement, useEffect, useMemo, useState } from "react";
import "./WithdrawAll.scss";
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  FormControl,
  FormLabel,
  Grid,
  MenuItem,
  Select,
  Skeleton,
  Typography,
} from "@mui/material";
import { Close, Label } from "@mui/icons-material";
import { ModalGrowTransition, ShadedInput } from "@repo/theme";
import { AccountData, CoreStaker, StakingContractState } from "@repo/voix";
import voiStakingUtils from "../../../utils/voiStakingUtils";
import { waitForConfirmation } from "@algorandfoundation/algokit-utils";
import { useWallet } from "@txnlab/use-wallet-react";
import { useLoader, useSnackbar } from "@repo/ui";
import { useSelector } from "react-redux";
import { RootState, useAppDispatch } from "../../../Redux/store";
import { isNumber } from "@repo/utils";
import { AlgoAmount } from "@algorandfoundation/algokit-utils/types/amount";
import { loadAccountData } from "../../../Redux/staking/userReducer";
import { CoreAccount, NodeClient } from "@repo/algocore";
import { AccountResult } from "@algorandfoundation/algokit-utils/types/indexer";
import TransactionDetails from "../../../Components/TransactionDetails/TransactionDetails";
import { NumericFormat } from "react-number-format";
import algosdk, { algosToMicroalgos, microalgosToAlgos } from "algosdk";
import Withdraw from "../../Withdraw/Withdraw";
import { abi, CONTRACT } from "ulujs";
import { AirdropClient, APP_SPEC } from "@repo/voix/src/clients/AirdropClient";

// TODO export to utils
function zip<T>(...arrays: T[][]): T[][] {
  const maxLength = Math.min(...arrays.map((arr) => arr.length));
  return Array.from({ length: maxLength }, (_, i) =>
    arrays.map((arr) => arr[i])
  );
}

interface BigNumberDisplayProps {
  withdrawableAmount: number | string; // Can be a number or string
  tokenSymbol?: string; // Optional, defaults to "VOI"
}

const BigNumberDisplay: React.FC<BigNumberDisplayProps> = ({
  withdrawableAmount,
  tokenSymbol = "VOI",
}) => {
  return (
    <Box display="flex" flexDirection="column" alignItems="center">
      {/* Display the big number */}
      <Typography variant="h4" component="div" gutterBottom>
        {withdrawableAmount}
      </Typography>
      {/* Display "1 VOI" or other token info */}
      <Typography variant="body1" color="textSecondary">
        <NumericFormat
          value={withdrawableAmount}
          suffix=" VOI"
          displayType={"text"}
          thousandSeparator={true}
        ></NumericFormat>
      </Typography>
    </Box>
  );
};

interface LockupProps {
  show: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

function WithdrawAll({ show, onClose }: LockupProps): ReactElement {
  function handleClose() {
    onClose();
    resetState();
  }

  function resetState() {
    setAmount("");
    setTxnId("");
    setTxnMsg("");
  }

  const { transactionSigner, activeAccount, signTransactions } = useWallet();

  const { showException, showSnack } = useSnackbar();
  const { showLoader, hideLoader } = useLoader();

  const { loading } = useSelector((state: RootState) => state.node);

  const { account, staking, contract } = useSelector(
    (state: RootState) => state.user
  );

  const { availableContracts } = account;

  const [acknowledge, setAcknowledge] = useState<boolean>(false);

  const [txnR, setTxnR] = useState<any>(null);
  const [zipped, setZipped] = useState<any>(null);
  useEffect(() => {
    if (
      !activeAccount ||
      !availableContracts ||
      availableContracts.length === 0 ||
      !acknowledge
    )
      return;
    const algodClient = voiStakingUtils.network.getAlgodClient();
    const indexerClient = voiStakingUtils.network.getIndexerClient();
    const apps: CoreStaker[] = availableContracts.map((contract) => {
      return new CoreStaker(contract);
    });
    const apids = apps.map((app) => app.contractId());
    (async () => {
      const minbals = await Promise.all(
        apps.map((app: CoreStaker) =>
          app.getMinBalanceByOwner(algodClient, activeAccount.address)
        )
      );
      const bals = [];
      for await (const app of apps) {
        const addr = algosdk.getApplicationAddress(app.contractId());
        const accResult = await algodClient.accountInformation(addr).do();
        const acc = new CoreAccount(accResult as AccountResult);
        const bal = acc.availableBalance();
        bals.push(bal);
      }
      // zip available contracts with min balances
      const zipped = zip(apids, bals, minbals)
        .map(([apid, bal, mb]) => [apid, Math.abs(bal - mb)])
        .filter(([_, mb]) => mb > 0);
      const ci = new CONTRACT(
        zipped[0][0],
        algodClient,
        indexerClient,
        abi.custom,
        {
          addr: activeAccount.address,
          sk: new Uint8Array(0),
        }
      );
      const buildN = [];
      for await (const [apid, mb] of zipped) {
        console.log(apid, mb);
        const cia = new CONTRACT(
          apid,
          algodClient,
          indexerClient,
          {
            name: "",
            methods: APP_SPEC.contract.methods,
            events: [],
          },
          {
            addr: activeAccount.address,
            sk: new Uint8Array(0),
          },
          true,
          false,
          true
        );
        const txnO = (await cia.withdraw(mb)).obj;
        buildN.push(txnO);
      }
      ci.setFee(2000);
      ci.setExtraTxns(buildN);
      ci.setEnableGroupResourceSharing(true);
      const customR = await ci.custom();
      if (customR.success) {
        setTxnR(customR);
        setZipped(zipped);
      }
    })();
  }, [activeAccount, availableContracts, acknowledge]);

  const withdrawableBalance = useMemo(() => {
    if (!zipped || zipped.length === 0) return -1;
    return zipped.reduce((acc, [_, mb]) => acc + mb, 0);
  }, [zipped]);

  console.log({ txnR, zipped });

  const [txnId, setTxnId] = useState<string>("");
  const [txnMsg, setTxnMsg] = useState<string>("");

  const [amount, setAmount] = useState<string>("");

  const accountData = account.data;
  const stakingAccount = staking.account;
  const contractState = contract.state;

  const isDataLoading =
    loading || account.loading || staking.loading || contract.loading;

  async function withdraw() {
    if (!txnR.success) return;

    const algodClient = voiStakingUtils.network.getAlgodClient();

    const stxns = await signTransactions(
      txnR.txns.map((txn: string) => new Uint8Array(Buffer.from(txn, "base64")))
    );

    algodClient.sendRawTransaction(stxns as Uint8Array[]).do();

    onClose();

    console.log({ txnR, zipped });

    // if (!activeAccount) {
    //   showSnack("Please connect your wallet", "error");
    //   return;
    // }

    // if (!amount || !isNumber(amount)) {
    //   showSnack("Invalid amount", "error");
    //   return;
    // }

    // try {
    //   showLoader("Withdrawal in progress");
    //   const transaction = await new CoreStaker(data).withdraw(
    //     voiStakingUtils.network.getAlgodClient(),
    //     AlgoAmount.Algos(Number(amount)).microAlgos,
    //     {
    //       addr: activeAccount.address,
    //       signer: transactionSigner,
    //     }
    //   );
    //   const txnId = transaction.txID();
    //   await waitForConfirmation(
    //     txnId,
    //     20,
    //     voiStakingUtils.network.getAlgodClient()
    //   );

    //   setTxnId(txnId);
    //   setTxnMsg("You have withdrawn successfully.");
    //   resetState();
    // } catch (e) {
    //   showException(e);
    // } finally {
    //   hideLoader();
    // }
  }

  const errorMessage = "";

  return (
    <div>
      {show && (
        <Dialog
          onClose={handleClose}
          fullWidth
          open={show}
          TransitionComponent={ModalGrowTransition}
          transitionDuration={400}
          maxWidth={"xs"}
          className="classic-modal round"
          sx={{
            ".MuiPaper-root": {
              minHeight: "400px",
              display: "flex",
              flexDirection: "column",
            },
          }}
        >
          <DialogTitle>
            {!acknowledge ? "Acknowledgement" : "Withdraw"}
            <Close onClick={handleClose} className="close-modal" />
          </DialogTitle>

          <DialogContent sx={{ flexGrow: 1 }}>
            <Box
              display="flex"
              flexDirection="column"
              alignItems="center"
              justifyContent="center"
            >
              {!acknowledge ? (
                <Typography
                  variant="body2"
                  sx={{
                    textAlign: "left",
                    fontSize: "0.9rem",
                    background: "gainsboro",
                    maxWidth: 400,
                    padding: "10px",
                    borderRadius: "10px",
                    height: "225px",
                  }}
                >
                  Withdraw All will reduce the balance of all your contract
                  accounts, potentially affecting their block proposal ability.
                  The displayed amount is the total withdrawable balance from
                  all your contracts. Confirm that you understand the potential
                  effects.
                </Typography>
              ) : (
                <Box
                  sx={{
                    position: "relative",
                    top: 100,
                  }}
                >
                  {withdrawableBalance < 0 ? (
                    <CircularProgress size={72} />
                  ) : (
                    <BigNumberDisplay
                      withdrawableAmount={
                        withdrawableBalance >= 0
                          ? microalgosToAlgos(withdrawableBalance)
                          : 0
                      }
                    />
                  )}
                </Box>
              )}
            </Box>
          </DialogContent>

          <Box sx={{ p: 2 }}>
            <Button
              disabled={!!acknowledge && withdrawableBalance <= 0}
              fullWidth
              variant="contained"
              color="primary"
              size="large"
              onClick={() => {
                if (!acknowledge) {
                  setAcknowledge(true);
                } else {
                  withdraw();
                }
              }}
            >
              {acknowledge ? "Withdraw" : "I Understand"}
            </Button>
          </Box>

          {txnId && (
            <TransactionDetails
              id={txnId}
              show={Boolean(txnId)}
              onClose={() => setTxnId("")}
              msg={txnMsg}
            />
          )}
        </Dialog>
      )}
    </div>
  );
}

export default WithdrawAll;
