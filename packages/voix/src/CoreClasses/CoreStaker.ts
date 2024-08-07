import { AccountData, ParticipateParams, StakingContractState } from "../types";
import { AirdropClient } from "../clients/AirdropClient";
import {
  ABIContract,
  Algodv2,
  AtomicTransactionComposer,
  makePaymentTxnWithSuggestedParamsFromObject,
  Transaction,
} from "algosdk";
import { TransactionSignerAccount } from "@algorandfoundation/algokit-utils/types/account";
import abi from "../clients/airdrop.contract.json";
import { getTransactionParams } from "@algorandfoundation/algokit-utils";
import { AccountResult } from "@algorandfoundation/algokit-utils/types/indexer";
import { CoreAccount } from "@repo/algocore";
import { AlgoAmount } from "@algorandfoundation/algokit-utils/types/amount";
import humanizeDuration from "humanize-duration";

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

  deployer(): number {
    return this.accountData.global_parent_id;
  }

  messenger(): number {
    return this.accountData.global_messenger_id;
  }

  lockupPeriodLimit(): number {
    return this.accountData.global_period_limit;
  }

  async getStakingState(algod: Algodv2): Promise<StakingContractState> {
    const contractId = this.contractId();
    return await new AirdropClient(
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

  hasStaked(contractAccount: AccountResult): boolean {
    return new CoreAccount(contractAccount).isOnline();
  }

  deadline(): number {
    return this.accountData.global_deadline;
  }

  currentTimestamp(): number {
    return Math.floor(Date.now() / 1000);
  }

  lockupDeadlineDate(): string {
    const timestamp = this.deadline();
    const date = new Date(timestamp * 1000);

    return date.toString();
  }

  getLockupDeadlineRemainingSeconds(): number {
    const deadline = this.deadline();
    const currentTime = this.currentTimestamp();

    const remainingTime = deadline - currentTime;
    return remainingTime >= 0 ? remainingTime : 0;
  }

  hasLockupDeadlineCompleted(): boolean {
    return this.getLockupDeadlineRemainingSeconds() <= 0;
  }

  getLockupDeadlineDuration(): string {
    if (this.hasLockupDeadlineCompleted()) {
      return "";
    }

    const seconds = this.getLockupDeadlineRemainingSeconds();
    return humanizeDuration(seconds * 1000, { largest: 3, round: false });
  }

  periodSeconds(): number {
    return this.accountData.global_period_seconds;
  }

  getPeriodInSeconds(period: number) {
    const periodSeconds = this.periodSeconds();
    return period * periodSeconds;
  }

  getPeriodInDuration(period: number) {
    const seconds = this.getPeriodInSeconds(period);
    return humanizeDuration(seconds * 1000, { largest: 2, round: false });
  }

  lockupPeriod() {
    return this.accountData.global_period;
  }

  getLockupDuration() {
    const period = this.lockupPeriod();
    return this.getPeriodInDuration(period);
  }

  async lock(
    algod: Algodv2,
    months: number,
    sender: TransactionSignerAccount,
  ): Promise<Transaction> {
    const contractId = this.contractId();
    const result = await new AirdropClient(
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

    return result.txIDs[1];
  }

  async withdraw(
    algod: Algodv2,
    amount: number,
    sender: TransactionSignerAccount,
  ): Promise<Transaction> {
    const contractId = this.contractId();
    const result = await new AirdropClient(
      { resolveBy: "id", id: contractId },
      algod,
    ).withdraw(
      {
        amount: amount,
      },
      {
        sender,
        sendParams: {
          fee: AlgoAmount.MicroAlgos(2000),
        },
      },
    );

    return result.transaction;
  }

  async deposit(
    algod: Algodv2,
    amount: number,
    sender: TransactionSignerAccount,
  ): Promise<string> {
    const txnParams = await getTransactionParams(undefined, algod);
    const atc = new AtomicTransactionComposer();

    const paymentTxn = makePaymentTxnWithSuggestedParamsFromObject({
      from: sender.addr,
      to: this.stakingAddress(),
      suggestedParams: txnParams,
      amount: amount,
    });

    atc.addTransaction({ txn: paymentTxn, signer: sender.signer });

    const result = await atc.execute(algod, 4);

    return result.txIDs[0];
  }

  async transfer(
    algod: Algodv2,
    address: string,
    sender: TransactionSignerAccount,
  ): Promise<Transaction> {
    const contractId = this.contractId();
    const result = await new AirdropClient(
      { resolveBy: "id", id: contractId },
      algod,
    ).transfer(
      {
        newOwner: address,
      },
      {
        sender,
      },
    );

    return result.transaction;
  }
}
