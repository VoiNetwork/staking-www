import "./Airdrop.scss";
import { ReactElement, useEffect, useState } from "react";
import { useWallet } from "@txnlab/use-wallet-react";
import { LoadingTile } from "@repo/ui";
import { AccountData, CoreStaker } from "@repo/voix";
import { useSelector } from "react-redux";
import { RootState, useAppDispatch } from "../../Redux/store";
import {
  BlockClient,
  BlockPackExplorer,
  CoreAccount,
  CoreNode,
  NodeClient,
} from "@repo/algocore";
import voiStakingUtils from "../../utils/voiStakingUtils";
import { AccountResult } from "@algorandfoundation/algokit-utils/types/indexer";
import { Box, Button, Grid, Tab, Tabs } from "@mui/material";
import { microalgosToAlgos } from "algosdk";
import { NumericFormat } from "react-number-format";
import Table from "./Table/Table";
import axios from "axios";

//import JsonViewer from "../../Components/JsonViewer/JsonViewer";

import Lockup from "./Lockup/Lockup";
import { loadAccountData } from "../../Redux/staking/userReducer";
import { Contract } from "ulujs/types/arc200";
import ContractPicker from "../../Components/pickers/ContractPicker/ContractPicker";

function Airdrop(): ReactElement {
  const { loading } = useSelector((state: RootState) => state.node);
  const { activeAccount } = useWallet();

  const { account } = useSelector((state: RootState) => state.user);

  const { availableContracts } = account;

  // MAINNET
  const funder = "62TIVJSZOS4DRSSYYDDZELQAGFYQC5JWKCHRBPPYKTZN2OOOXTGLB5ZJ4E";
  const parent_id = 5211;

  const [airdropContracts, setAirdropContracts] = useState<AccountData[]>([]);
  const [airdrop2Contracts, setAirdrop2Contracts] = useState<AccountData[]>([]);
  useEffect(() => {
    if (!availableContracts) return;
    setAirdropContracts(
      availableContracts.filter(
        (contract) =>
          contract.global_funder === funder &&
          contract.global_parent_id === parent_id &&
          contract.global_initial !== "0"
      )
    );
    setAirdrop2Contracts(
      availableContracts.filter(
        (contract) =>
          contract.global_funder === funder &&
          contract.global_parent_id === parent_id &&
          contract.global_initial === "0"
      )
    );
  }, [availableContracts]);

  const accountData = account.data;

  const isDataLoading = loading || account.loading;

  const [estimatedReward, setEstimatedReward] = useState<number>(0);
  useEffect(() => {
    if (!activeAccount) return;
    axios
      .get(`https://voirewards.com/api/phase2?wallet=${activeAccount.address}`)
      .then((res) => {
        setEstimatedReward(res.data?.estimatedReward || 0);
      })
      .catch((err) => {
        console.log(err);
      });
  }, [activeAccount]);

  const [tabIndex, setTabIndex] = useState(0); // Add tab state
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabIndex(newValue);
  };

  const step_rate = (period: number) => {
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

  return (
    <div className="overview-wrapper">
      <div className="overview-container">
        <div className="overview-header">
          <div>Airdrop</div>
        </div>
        <div className="overview-body">
          <Tabs
            value={tabIndex}
            onChange={handleTabChange}
            aria-label="Airdrop tabs"
          >
            <Tab label="Phase I" />
            <Tab label="Phase II" />
          </Tabs>

          {tabIndex === 0 && (
            <div>
              {!isDataLoading && accountData && airdropContracts.length > 0 ? (
                <Box sx={{ mt: 5 }}>
                  <Table
                    contracts={airdropContracts}
                    funder={funder}
                    parent_id={parent_id}
                    rate={step_rate}
                  ></Table>
                </Box>
              ) : (
                <Box sx={{ mt: 5 }}>
                  <div>No Testnet Phase I Airdrop found for your acount.</div>
                </Box>
              )}
            </div>
          )}

          {tabIndex === 1 && (
            <div>
              {!isDataLoading && accountData && airdrop2Contracts.length > 0 ? (
                <Box sx={{ mt: 5 }}>
                  <Table
                    contracts={airdrop2Contracts.map((contract) => ({
                      ...contract,
                      global_initial: (estimatedReward * 1e6).toString(),
                    }))} // Set the initial amount to the estimated reward
                    funder={funder}
                    parent_id={parent_id}
                    rate={step_rate}
                  ></Table>
                </Box>
              ) : (
                <Box sx={{ mt: 5 }}>
                  <div>No Testnet Phase II Airdrop found for your acount.</div>
                </Box>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Airdrop;
