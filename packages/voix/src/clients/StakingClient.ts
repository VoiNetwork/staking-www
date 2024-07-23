import { AccountData } from "../types";
import axios from "axios";
import { API_URL } from "../constants";

export class StakingClient {
  async getAccountData(address: string): Promise<AccountData[]> {
    const response = await axios.get(
      `${API_URL}/v1/scs/accounts?owner=${address}`,
    );
    return response.data.accounts;
  }
}
