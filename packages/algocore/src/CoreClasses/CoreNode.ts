import {
  NODE_BETANET_HASH,
  NODE_DOCKERNET_GENESIS_ID,
  NODE_MAINNET_HASH,
  NODE_SANDNET_GENESIS_ID,
  NODE_TESTNET_HASH,
  NODE_VOI_TESTNET_HASH,
} from "../constants";
import { A_Genesis, A_Status, A_VersionsCheck } from "../types";

export class CoreNode {
  private status: A_Status;
  private versions: A_VersionsCheck;
  private genesis: A_Genesis;
  private health: boolean;

  constructor(
    status: A_Status,
    versions: A_VersionsCheck,
    genesis: A_Genesis,
    health: boolean,
  ) {
    this.status = status;
    this.versions = versions;
    this.genesis = genesis;
    this.health = health;
  }

  isSandbox(): boolean {
    const genId = this.getGenesisId();
    return (
      genId === NODE_SANDNET_GENESIS_ID || genId === NODE_DOCKERNET_GENESIS_ID
    );
  }

  isBetanet(): boolean {
    return this.getGenesisHash() === NODE_BETANET_HASH;
  }

  isTestnet(): boolean {
    return this.getGenesisHash() === NODE_TESTNET_HASH;
  }

  isMainnet(): boolean {
    return this.getGenesisHash() === NODE_MAINNET_HASH;
  }

  getGenesisId(): string {
    return this.versions.genesis_id;
  }

  getGenesisHash(): string {
    return this.versions.genesis_hash_b64;
  }

  isVoiTestnet(): boolean {
    return this.getGenesisHash() === NODE_VOI_TESTNET_HASH;
  }
}
