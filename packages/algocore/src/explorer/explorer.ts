import { BlockPackExplorer } from "./blockPackExplorer";
import { CoreNode } from "../CoreClasses/CoreNode";

export class Explorer {
  private nodeInstance: CoreNode;
  constructor(nodeInstance: CoreNode) {
    this.nodeInstance = nodeInstance;
  }

  getExplorer() {
    return new BlockPackExplorer(this.nodeInstance);
  }

  openBlock(block: number): void {
    this.getExplorer().openBlock(block);
  }

  openTransaction(id: string): void {
    this.getExplorer().openTransaction(id);
  }

  openAddress(address: string): void {
    this.getExplorer().openAddress(address);
  }
}
