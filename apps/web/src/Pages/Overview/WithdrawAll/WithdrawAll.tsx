import React, { ReactElement, useEffect, useMemo, useState } from "react";
import "./WithdrawAll.scss";
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  Typography,
} from "@mui/material";
import { Close } from "@mui/icons-material";
import { ModalGrowTransition } from "@repo/theme";
import { CoreStaker } from "@repo/voix";
import voiStakingUtils from "../../../utils/voiStakingUtils";
import { useWallet } from "@txnlab/use-wallet-react";
import { useLoader, useSnackbar } from "@repo/ui";
import { useSelector } from "react-redux";
import { RootState } from "../../../Redux/store";
import { CoreAccount } from "@repo/algocore";
import { AccountResult } from "@algorandfoundation/algokit-utils/types/indexer";
import TransactionDetails from "../../../Components/TransactionDetails/TransactionDetails";
import { NumericFormat } from "react-number-format";
import algosdk, { microalgosToAlgos } from "algosdk";
import { abi, CONTRACT } from "ulujs";
import { APP_SPEC } from "@repo/voix/src/clients/AirdropClient";
import _ from "lodash";

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
          suffix={` ${tokenSymbol}`}
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
    setTxnId("");
    setTxnMsg("");
  }

  const { activeAccount, signTransactions } = useWallet();

  const { showException, showSnack } = useSnackbar();
  const { showLoader, hideLoader } = useLoader();

  const { account } = useSelector((state: RootState) => state.user);

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
      const zipped = _.zip(apids, bals, minbals)
        .map(([apid, bal, mb]) => [apid, Math.abs(bal - mb)])
        .filter(([_, mb]) => mb > 0);
      if (zipped.length === 0) {
        setZipped([]);
        return;
      }
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
    if (!zipped) return -1;
    if (zipped.length === 0) return 0;
    return zipped.reduce((acc, [_, mb]) => acc + mb, 0);
  }, [zipped]);

  const [txnId, setTxnId] = useState<string>("");
  const [txnMsg, setTxnMsg] = useState<string>("");

  async function withdraw() {
    if (!txnR.success) return;
    try {
      const algodClient = voiStakingUtils.network.getAlgodClient();
      const stxns = await signTransactions(
        txnR.txns.map(
          (txn: string) => new Uint8Array(Buffer.from(txn, "base64"))
        )
      );
      algodClient.sendRawTransaction(stxns as Uint8Array[]).do();
      onClose();
    } catch (e) {
      showException(e);
    }
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
