import {
  NODE_BETANET_HASH,
  NODE_DOCKERNET_GENESIS_ID,
  NODE_MAINNET_HASH,
  NODE_SANDNET_GENESIS_ID,
  NODE_TESTNET_HASH,
  NODE_VOI_TESTNET_HASH,
  NODE_VOI_MAINNET_HASH,
} from "../constants";
import { A_Genesis, A_Status, A_VersionsCheck } from "../types";

export class CoreNode {
  private status: A_Status;
  private versions: A_VersionsCheck;
  private genesis: A_Genesis;
  private health: boolean;
  private ready: boolean;

  constructor(
    status: A_Status,
    versions: A_VersionsCheck,
    genesis: A_Genesis,
    health: boolean,
    ready: boolean
  ) {
    this.status = status;
    this.versions = versions;
    this.genesis = genesis;
    this.health = health;
    this.ready = ready;
  }

  isHealthy(): boolean {
    return this.health;
  }

  isReady(): boolean {
    return this.ready;
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

  getConsensusVersion(): string {
    return this.status["last-version"];
  }

  hasFutureConsensus(): boolean {
    return this.getConsensusVersion() === "future";
  }

  getLatestConsensusVersion(): string {
    if (this.isSandbox()) {
      return this.getConsensusVersion();
    }

    return this.status["next-version"];
  }

  hasLatestConsensusVersion(): boolean {
    const consensusVersion = this.getConsensusVersion();
    const latestConsensusVersion = this.getLatestConsensusVersion();

    return consensusVersion === latestConsensusVersion;
  }

  getOnlyBuildVersion(): string {
    const { build } = this.versions;
    if (build) {
      const { major, minor, build_number } = build;
      return `${major}.${minor}.${build_number}`;
    }
    return "";
  }

  isVoiTestnet(): boolean {
    return this.getGenesisHash() === NODE_VOI_TESTNET_HASH;
  }

  isVoiMainnet(): boolean {
    return this.getGenesisHash() === NODE_VOI_MAINNET_HASH;
  }

  getDispenserLinks(): string[] {
    const links: string[] = [];

    if (this.isBetanet()) {
      links.push("https://betanet.algoexplorer.io/dispenser");
      links.push("https://bank.betanet.algodev.network/");
    }
    if (this.isTestnet()) {
      links.push("https://testnet.algoexplorer.io/dispenser");
      links.push("https://bank.testnet.algorand.network");
    }

    return links;
  }

  isDevMode(): boolean {
    return this.genesis.devmode;
  }

  getFeeSinkAddress(): string {
    return this.genesis.fees;
  }

  getRewardsPoolAddress(): string {
    return this.genesis.rwd;
  }

  getLatestRound(): number {
    return this.status["last-round"];
  }

  getBuildVersion(): string {
    const { build } = this.versions;
    return `${build?.major}.${build?.minor}.${build?.build_number} [Branch: ${build?.branch}] [Channel: ${build?.channel}]`;
  }

  getProtocolUpgradeRemainingSeconds(blockTime: number): number {
    return this.getProtocolUpgradeRemainingBlocks() * blockTime * 1000;
  }

  getProtocolUpgradeBlock(): number {
    return this.status["next-version-round"];
  }

  getProtocolUpgradeRemainingBlocks(): number {
    return this.getProtocolUpgradeBlock() - this.status["last-round"];
  }

  hasNodeCaughtUp(): boolean {
    const catchupTime = this.status["catchup-time"];
    return catchupTime === 0;
  }

  hasProtocolUpgrade(): boolean {
    return this.getProtocolUpgradeRemainingBlocks() > 100;
  }
}
