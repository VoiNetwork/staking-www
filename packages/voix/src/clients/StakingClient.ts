import { AccountData } from "../types";
import axios from "axios";
import { VOIMAIN_API_URL, VOITEST_API_URL } from "../constants";
import { NodeConnectionParams } from "@repo/algocore";

export class StakingClient {
  node: NodeConnectionParams;
  constructor(node: NodeConnectionParams) {
    this.node = node;
  }
  getAPIUrl(): string {
    switch (this.node.name) {
      case "voimain":
        return VOIMAIN_API_URL;
      case "voitest":
        return VOITEST_API_URL;
      default:
        return VOIMAIN_API_URL;
    }
  }
  async getAccountData(address: string): Promise<AccountData[]> {
    const response = await axios.get(`${this.getAPIUrl()}/v1/scs/accounts`, {
      params: {
        owner: address,
        deleted: 0,
      },
    });
    return response.data.accounts;
  }
}
