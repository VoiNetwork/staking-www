import { AccountData, ParticipateParams, StakingContractState } from "../types";
import { SmartContractStakingClient } from "../clients/SmartContractStakingClient";
import {
  ABIContract,
  Algodv2,
  AtomicTransactionComposer,
  makePaymentTxnWithSuggestedParamsFromObject,
  Transaction,
} from "algosdk";
import { TransactionSignerAccount } from "@algorandfoundation/algokit-utils/types/account";
import abi from "../clients/contract.json";
import { getTransactionParams } from "@algorandfoundation/algokit-utils";

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
    return !!this.accountData.part_vote_fst;
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
  ): Promise<string> {
    const contractId = this.contractId();

    const txnParams = await getTransactionParams(undefined, algod);
    const atc = new AtomicTransactionComposer();

    const paymentTxn = makePaymentTxnWithSuggestedParamsFromObject({
      from: sender.addr,
      to: this.stakingAddress(),
      suggestedParams: txnParams,
      amount: 1000,
    });

    atc.addTransaction({ txn: paymentTxn, signer: sender.signer });

    atc.addMethodCall({
      appID: contractId,
      method: new ABIContract(abi).getMethodByName("participate"),
      methodArgs: [
        params.voteK,
        params.selK,
        params.voteFst,
        params.voteLst,
        params.voteKd,
        params.spKey,
      ],
      sender: sender.addr,
      signer: sender.signer,
      suggestedParams: txnParams,
    });

    const result = await atc.execute(algod, 4);

    return result.txIDs[0];
  }
}
