import { AccountData, ParticipateParams, StakingContractState } from "../types";
import { SmartContractStakingClient } from "../clients/SmartContractStakingClient";
import { Algodv2, Transaction } from "algosdk";
import { TransactionSignerAccount } from "@algorandfoundation/algokit-utils/types/account";

export class CoreStaker {
  accountData: AccountData;

  constructor(accountData: AccountData) {
    this.accountData = accountData;
  }

  contractId(): number {
    return this.accountData.contractId;
  }

  stakingAddress(): string {
    return this.accountData.contractAddress;
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

  hasStaked(): boolean {
    return this.accountData.part_vote_k != null;
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

  async stake(
    algod: Algodv2,
    params: ParticipateParams,
    sender: TransactionSignerAccount,
  ): Promise<Transaction> {
    const contractId = this.contractId();
    const result = await new SmartContractStakingClient(
      { resolveBy: "id", id: contractId },
      algod,
    ).participate(params, {
      sender,
    });

    return result.transaction;
  }
}
