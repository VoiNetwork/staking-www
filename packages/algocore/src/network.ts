import { Algodv2, Indexer, Kmd } from "algosdk";
import {
  AlgodConnectionParams,
  IndexerConnectionParams,
  KmdConnectionParams,
  NodeConnectionParams,
} from "./types";

export class Network {
  public algod: AlgodConnectionParams;
  public kmd: KmdConnectionParams | undefined;
  private indexer: IndexerConnectionParams;

  constructor({ algod, kmd, indexer }: NodeConnectionParams) {
    this.algod = algod;
    this.kmd = kmd;
    this.indexer = indexer;
  }

  getAlgodClient(): Algodv2 {
    const { url, port, token } = this.algod;
    return new Algodv2(token, url, port);
  }

  getIndexerClient(): Indexer {
    const { url, port, token } = this.indexer;
    return new Indexer(token, url, port);
  }

  getKmdClient(): Kmd | undefined {
    if (this.kmd) {
      const { url, port, token } = this.kmd;
      return new Kmd(token, url, port);
    }
  }

  getAlgodUrl(): string {
    const { url, port } = this.algod;
    return port ? `${url}:${port}` : url;
  }

  getIndexerUrl(): string {
    const { url, port } = this.indexer;
    return port ? `${url}:${port}` : url;
  }
}
