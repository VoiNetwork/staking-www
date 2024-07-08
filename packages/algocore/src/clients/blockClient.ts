import { Algodv2, Indexer } from "algosdk";
import { Network } from "../network";
import { A_Block } from "../types";
import { BLOCKS_FOR_AVERAGE_BLOCK_TIME } from "../constants";

export class BlockClient {
  client: Algodv2;
  indexer: Indexer;
  network: Network;

  constructor(network: Network) {
    this.network = network;
    this.client = network.getAlgodClient();
    this.indexer = network.getIndexerClient();
  }

  async get(id: number, headerOnly: boolean = false): Promise<A_Block> {
    const response = await this.indexer
      .lookupBlock(id)
      .headerOnly(headerOnly)
      .do();
    return response as A_Block;
  }

  async getAverageBlockTimeInMS(): Promise<number> {
    const roundsToConsider = BLOCKS_FOR_AVERAGE_BLOCK_TIME;
    const status = await this.client.status().do();
    const currentRound = status["last-round"];
    const averageBlock = currentRound - roundsToConsider;

    const blockA = await this.client.block(currentRound).do();
    const blockB = await this.client.block(averageBlock).do();

    const diff = (blockA.block.ts - blockB.block.ts) / roundsToConsider;
    return diff * 1000;
  }
}
