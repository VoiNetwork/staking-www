import "./Airdrop.scss";
import { ReactElement, useEffect, useState } from "react";
import { useWallet } from "@txnlab/use-wallet-react";
import { LoadingTile } from "@repo/ui";
import { CoreStaker } from "@repo/voix";
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
import { Button, Grid } from "@mui/material";
import { microalgosToAlgos } from "algosdk";
import { NumericFormat } from "react-number-format";
import Stepper from "../../Components/Stepper/Stepper";

//import JsonViewer from "../../Components/JsonViewer/JsonViewer";

import Lockup from "./Lockup/Lockup";
import { loadAccountData } from "../../Redux/staking/userReducer";
import { Contract } from "ulujs/types/arc200";
import ContractPicker from "../../Components/ContractPicker/ContractPicker";

function Airdrop(): ReactElement {
  const { loading } = useSelector((state: RootState) => state.node);
  const { activeAccount } = useWallet();

  const { account, staking, contract } = useSelector(
    (state: RootState) => state.user
  );

  const { availableContracts } = account;

  const funder = "BNERIHFXRPMF5RI4UQHMB6CFZ4RVXIBOJUNYEUXKDUSETECXDNGWLW5EOY";

  const filteredContracts = availableContracts.filter(
    (contract) => contract.global_funder === funder
  );

  const dispatch = useAppDispatch();

  const accountData = account.data;
  const stakingAccount = staking.account;
  const contractState = contract.state;

  //const [isMetadataVisible, setMetadataVisibility] = useState<boolean>(false);

  const isDataLoading = loading || account.loading || staking.loading;

  const { genesis, health, versionsCheck, status, ready } = useSelector(
    (state: RootState) => state.node
  );
  const coreNodeInstance = new CoreNode(
    status,
    versionsCheck,
    genesis,
    health,
    ready
  );

  const [isLockupModalVisible, setLockupModalVisibility] =
    useState<boolean>(false);

  const [expiresIn, setExpiresIn] = useState<string>("--");

  async function loadExpiresIn(account: AccountResult) {
    try {
      const status = await new NodeClient(voiStakingUtils.network).status();
      const currentRound = status["last-round"];
      const blockTimeMs = await new BlockClient(
        voiStakingUtils.network
      ).getAverageBlockTimeInMS();
      const expiresIn = new CoreAccount(account).partKeyExpiresIn(
        currentRound,
        blockTimeMs
      );
      setExpiresIn(expiresIn);
    } catch (e) {
      /* empty */
    }
  }

  useEffect(() => {
    if (staking.account) {
      if (new CoreAccount(staking.account).isOnline()) {
        loadExpiresIn(staking.account);
      }
    }
  }, [staking]);

  const step_funder =
    "BNERIHFXRPMF5RI4UQHMB6CFZ4RVXIBOJUNYEUXKDUSETECXDNGWLW5EOY";
  const step_parent_id = 87585701;
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
          {/*<Button variant="outlined">Go to dashbaord</Button>*/}
        </div>
        <div className="overview-body">
          {isDataLoading && <LoadingTile></LoadingTile>}
          {!isDataLoading && accountData && filteredContracts.length > 0 ? (
            <Stepper
              funder={step_funder}
              parent_id={step_parent_id}
              rate={step_rate}
            ></Stepper>
          ) : null}
          {!isDataLoading && !accountData && filteredContracts.length === 0 ? (
            <div className="info-msg">
              No contract details found for your account.
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export default Airdrop;
