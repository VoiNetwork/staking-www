import { Network } from "../network";
import { Indexer_Health } from "../constants";
import { Indexer } from "algosdk";

export class IdxClient {
  indexer: Indexer;
  network: Network;

  constructor(network: Network) {
    this.network = network;
    this.indexer = network.getIndexerClient();
  }

  async health(): Promise<Indexer_Health> {
    return (await this.indexer.makeHealthCheck().do()) as Indexer_Health;
  }
}
