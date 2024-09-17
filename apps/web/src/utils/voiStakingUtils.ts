import { Network, NodeConnectionParams } from "@repo/algocore";
import {
  getPreConfiguredNodes,
  getSelectedNode,
} from "../Redux/network/nodesReducer";

class VoiStakingUtils {
  params: NodeConnectionParams;
  network: Network;
  constructor() {
    const nodeConnectionParams =
      getSelectedNode() || getPreConfiguredNodes()[0];
    this.network = new Network(nodeConnectionParams);
    this.params = nodeConnectionParams;
  }

  setNetwork(network: NodeConnectionParams): void {
    this.network = new Network(network);
  }
}

export default new VoiStakingUtils();
