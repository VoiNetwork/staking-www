import { ContractDetails } from "../types";
import axios from "axios";
import { API_URL } from "../constants";

export class StakingClient {
  async getContractDetails(address: string): Promise<ContractDetails> {
    const response = await axios.get(
      `${API_URL}/v1/scs/accounts?owner=${address}`,
    );
    return response.data.accounts[0];
  }
}
