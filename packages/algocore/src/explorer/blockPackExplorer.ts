import { CoreNode } from "../CoreClasses/CoreNode";

export class BlockPackExplorer {
  private nodeInstance: CoreNode;
  constructor(nodeInstance: CoreNode) {
    this.nodeInstance = nodeInstance;
  }

  getBaseUrl() {
    if (this.nodeInstance.isMainnet()) {
      return "https://www.blockpack.app/#/explorer";
    }
    if (this.nodeInstance.isTestnet()) {
      return "https://testnet.blockpack.app/#/explorer";
    }
    if (this.nodeInstance.isBetanet()) {
      return "https://betanet.blockpack.app/#/explorer";
    }
    if (this.nodeInstance.isVoiTestnet()) {
      return "https://voitest.blockpack.app/#/explorer";
    }
  }

  openBlock(block: number): void {
    window.open(`${this.getBaseUrl()}/block/${block}`, "_blank");
  }

  openTransaction(id: string): void {
    window.open(`${this.getBaseUrl()}/transaction/${id}`, "_blank");
  }

  openAddress(address: string): void {
    window.open(`${this.getBaseUrl()}/account/${address}`, "_blank");
  }
}
