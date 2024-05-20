import { Network, NodeConnectionParams } from "@repo/algocore";

export const nodeParams: NodeConnectionParams = {
  id: "nodly_voinet",
  label: "Voinet",
  name: "voitest",
  algod: {
    url: "https://testnet-api.voi.nodly.io",
    port: "",
    token: "",
  },
  indexer: {
    url: "https://testnet-idx.voi.nodly.io",
    port: "",
    token: "",
  },
};

class VoiXUtils {
  network: Network = new Network(nodeParams);

  setNetwork(network: NodeConnectionParams): void {
    this.network = new Network(network);
  }
}

export default new VoiXUtils();
