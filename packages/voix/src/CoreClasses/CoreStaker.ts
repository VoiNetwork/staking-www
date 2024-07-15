import { ContractDetails, StakingContractState } from "../types";
import { SmartContractStakingClient } from "../clients/SmartContractStakingClient";
import { Algodv2, Transaction } from "algosdk";
import { TransactionSignerAccount } from "@algorandfoundation/algokit-utils/types/account";

export class CoreStaker {
  contractDetails: ContractDetails;

  constructor(contractDetails: ContractDetails) {
    this.contractDetails = contractDetails;
  }

  contractId(): number {
    return this.contractDetails.contractId;
  }

  stakingAddress(): string {
    return this.contractDetails.contractAddress;
  }

  async getStakingState(algod: Algodv2): Promise<StakingContractState> {
    const contractId = this.contractId();
    return await new SmartContractStakingClient(
      { resolveBy: "id", id: contractId },
      algod,
    ).getGlobalState();
  }

  getLockingPeriod(state: StakingContractState): number {
    return state.period?.asNumber() || 0;
  }

  hasLocked(state: StakingContractState): boolean {
    return this.getLockingPeriod(state) != 0;
  }

  async lock(
    algod: Algodv2,
    months: number,
    sender: TransactionSignerAccount,
  ): Promise<Transaction> {
    const contractId = this.contractId();
    const result = await new SmartContractStakingClient(
      { resolveBy: "id", id: contractId },
      algod,
    ).configure(
      {
        period: months,
      },
      {
        sender,
      },
    );

    return result.transaction;
  }
}
