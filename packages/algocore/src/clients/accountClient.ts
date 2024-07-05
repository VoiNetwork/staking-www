import { Algodv2, Indexer } from "algosdk";
import { Network } from "../network";
import { AccountResult } from "@algorandfoundation/algokit-utils/types/indexer";

export class AccountClient {
  client: Algodv2;
  indexer: Indexer;
  network: Network;

  constructor(network: Network) {
    this.network = network;
    this.client = network.getAlgodClient();
    this.indexer = network.getIndexerClient();
  }

  async get(address: string): Promise<AccountResult> {
    return (await this.client
      .accountInformation(address)
      .do()) as AccountResult;
  }
}
