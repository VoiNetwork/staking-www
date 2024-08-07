import {
  AccountParticipation,
  AccountResult,
} from "@algorandfoundation/algokit-utils/types/indexer";
import humanizeDuration from "humanize-duration";

export class CoreAccount {
  private account: AccountResult;

  constructor(account: AccountResult) {
    this.account = account;
  }

  balance(): number {
    return this.account.amount;
  }

  isOnline(): boolean {
    return this.status() === "Online";
  }

  address(): string {
    return this.account.address;
  }

  status(): string {
    return this.account.status;
  }

  get(): AccountResult {
    return this.account;
  }

  minBalance(): number {
    return this.account["min-balance"];
  }

  availableBalance(): number {
    const availableBalance = this.balance() - this.minBalance();
    return availableBalance > 0 ? availableBalance : 0;
  }

  getParticipation(): AccountParticipation | undefined {
    return this.account.participation;
  }

  partKeyExpiresInBlocks(currentRound: number): number {
    if (this.isOnline()) {
      const partKey = this.getParticipation();
      if (partKey) {
        const lastRound = partKey["vote-last-valid"];
        if (currentRound > lastRound) {
          return -1;
        }
        return lastRound - currentRound;
      }
    }

    return -1;
  }

  partKeyExpiresIn(currentRound: number, blockTimeMs: number): string {
    const remainingRounds = this.partKeyExpiresInBlocks(currentRound);
    const diff = Math.floor(remainingRounds * blockTimeMs);
    return humanizeDuration(diff, { largest: 2, round: true });
  }
}
