import * as sdk from "algosdk";
import { Algodv2 } from "algosdk";
import {
  AlgodConnectionParams,
  IndexerConnectionParams,
  NodeConnectionParams,
} from "./types";
import IndexerClient from "algosdk/dist/types/client/v2/indexer/indexer";

export class Network {
  public algod: AlgodConnectionParams;
  private indexer: IndexerConnectionParams;

  constructor({ algod, indexer }: NodeConnectionParams) {
    this.algod = algod;
    this.indexer = indexer;
  }

  getAlgodClient(): Algodv2 {
    const { url, port, token } = this.algod;
    return new sdk.Algodv2(token, url, port);
  }

  getIndexerClient(): IndexerClient {
    const { url, port, token } = this.indexer;
    return new sdk.Indexer(token, url, port);
  }
}
