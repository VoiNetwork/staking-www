import { Indexer_Health } from "../constants";
import { A_Status } from "../types";

export class CoreIndexer {
  private health: Indexer_Health;

  constructor(health: Indexer_Health) {
    this.health = health;
  }

  round(): number {
    return this.health.round;
  }

  version(): string {
    return this.health.version;
  }

  isMigrating(): boolean {
    return this.health["is-migrating"];
  }

  getIndexerBehindBlocks(status: A_Status): number {
    const nodeRound = status["last-round"];
    const indexerRound = this.health.round;

    return nodeRound - indexerRound;
  }

  hasIndexerCaughtUp(status: A_Status): boolean {
    return this.getIndexerBehindBlocks(status) <= 50;
  }
}
