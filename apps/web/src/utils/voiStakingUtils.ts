import { Network, NodeConnectionParams } from "@repo/algocore";
import { getPreConfiguredNodes } from "../Redux/network/nodesReducer";

class VoiStakingUtils {
  network: Network;

  constructor() {
    const mainnet = getPreConfiguredNodes()[0];
    this.network = new Network(mainnet);
  }

  setNetwork(network: NodeConnectionParams): void {
    this.network = new Network(network);
  }
}

export default new VoiStakingUtils();
