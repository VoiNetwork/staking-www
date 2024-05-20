import {
  AccountParticipation,
  AccountResult,
  ApplicationResult,
  AppLocalState,
  AssetHolding,
  AssetResult,
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

  getCreatedAssets(): AssetResult[] {
    return this.account["created-assets"] || [];
  }

  getCreatedApplications(): ApplicationResult[] {
    return this.account["created-apps"] || [];
  }

  getOptedApplications(): AppLocalState[] {
    return this.account["apps-local-state"] || [];
  }

  getOptedApplication(id: number): AppLocalState | undefined {
    const optedApps = this.getOptedApplications();

    return optedApps.find((app) => {
      return app.id === id;
    });
  }

  minBalance(): number {
    return this.account["min-balance"];
  }

  getHoldingAssets(): AssetHolding[] {
    return this.account["assets"] || [];
  }

  isCreatedAsset(assetId: number): boolean {
    const createdAssets = this.getCreatedAssets();

    for (const asset of createdAssets) {
      if (asset.index === assetId) {
        return true;
      }
    }

    return false;
  }

  getCreatedAsset(assetId: number): AssetResult | undefined {
    const createdAssets = this.getCreatedAssets();

    for (const asset of createdAssets) {
      if (asset.index === assetId) {
        return asset;
      }
    }
  }

  getHoldingAsset(assetId: number): AssetHolding | undefined {
    const assets = this.getHoldingAssets();
    for (const asset of assets) {
      if (asset["asset-id"] === assetId) {
        return asset;
      }
    }
  }

  balanceOf(assetId: number): number {
    const asset = this.getHoldingAsset(assetId);

    if (asset) {
      return asset.amount;
    }

    return 0;
  }

  getCreatedAssetsCount(): number {
    return this.account["total-created-assets"];
  }

  getOptedAssetsCount(): number {
    return this.account["total-assets-opted-in"];
  }

  getCreatedApplicationsCount(): number {
    return this.account["total-created-apps"];
  }

  getOptedApplicationsCount(): number {
    return this.account["total-apps-opted-in"];
  }

  getAssetBal(asset: AssetResult): number {
    return (
      this.balanceOf(asset.index) / Math.pow(10, Number(asset.params.decimals))
    );
  }

  canManage(asset: AssetResult): boolean {
    const manager = asset.params.manager;
    return this.account.address === manager;
  }

  canFreeze(asset: AssetResult): boolean {
    const freeze = asset.params.freeze;
    return this.account.address === freeze;
  }

  canClawback(asset: AssetResult): boolean {
    const clawback = asset.params.clawback;
    return this.account.address === clawback;
  }

  getReKeyedAddress(): string {
    return this.account["auth-addr"] || "";
  }

  isReKeyed(): boolean {
    return Boolean(this.getReKeyedAddress());
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

  partKeyExpiresIn(
    currentRound: number,
    blockTimeMs: number,
  ): string | undefined {
    const remainingRounds = this.partKeyExpiresInBlocks(currentRound);
    const diff = Math.floor(remainingRounds * blockTimeMs);
    return humanizeDuration(diff, { largest: 2, round: true });
  }
}
