import { Algodv2 } from "algosdk";
import { Network } from "../network";
import {
  AccountResult,
  TransactionSearchResults,
  AssetsCreatedLookupResult,
  AssetsLookupResult,
  ApplicationCreatedLookupResult,
} from "@algorandfoundation/algokit-utils/types/indexer";
import IndexerClient from "algosdk/dist/types/client/v2/indexer/indexer";
import {
  A_OptedAppsLookupResponse,
  AccountsSearchResult,
  SearchAccountsParams,
} from "../types";
import { isNumber } from "@repo/utils";

export class AccountClient {
  client: Algodv2;
  indexer: IndexerClient;
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

  async searchForTransactions(
    address: string,
    token: string = "",
  ): Promise<TransactionSearchResults> {
    const req = this.indexer.searchForTransactions().address(address);
    if (token) {
      req.nextToken(token);
    }

    const response = await req.do();
    return response as TransactionSearchResults;
  }

  async searchForCreatedAssets(
    address: string,
    token: string = "",
  ): Promise<AssetsCreatedLookupResult> {
    const req = this.indexer.lookupAccountCreatedAssets(address);
    if (token) {
      req.nextToken(token);
    }

    const response = await req.do();
    return response as AssetsCreatedLookupResult;
  }

  async searchForOptedAssets(
    address: string,
    token: string = "",
  ): Promise<AssetsLookupResult> {
    const req = this.indexer.lookupAccountAssets(address);
    if (token) {
      req.nextToken(token);
    }

    const response = await req.do();
    return response as AssetsLookupResult;
  }

  async searchForCreatedApplications(
    address: string,
    token: string = "",
  ): Promise<ApplicationCreatedLookupResult> {
    const req = this.indexer.lookupAccountCreatedApplications(address);
    if (token) {
      req.nextToken(token);
    }

    const response = await req.do();
    return response as ApplicationCreatedLookupResult;
  }

  async searchForOptedApplications(
    address: string,
    token: string = "",
  ): Promise<A_OptedAppsLookupResponse> {
    const req = this.indexer.lookupAccountAppLocalStates(address);
    if (token) {
      req.nextToken(token);
    }

    const response = await req.do();
    return response as A_OptedAppsLookupResponse;
  }

  async searchForAccounts(
    params: SearchAccountsParams,
  ): Promise<AccountsSearchResult> {
    const { token, assetId, appId } = params;
    let searchInstance = this.indexer.searchAccounts();

    if (token) {
      searchInstance = searchInstance.nextToken(token);
    }

    if (assetId) {
      if (isNumber(assetId)) {
        searchInstance = searchInstance.assetID(Number(assetId));
      } else {
        searchInstance = searchInstance.assetID(-100);
      }
    }

    if (appId) {
      if (isNumber(appId)) {
        searchInstance = searchInstance.applicationID(Number(appId));
      } else {
        searchInstance = searchInstance.applicationID(-100);
      }
    }

    return (await searchInstance.do()) as AccountsSearchResult;
  }

  async searchForReKeyedAccounts(
    address: string,
    token?: string,
  ): Promise<AccountsSearchResult> {
    let searchInstance = this.indexer.searchAccounts().authAddr(address);

    if (token) {
      searchInstance = searchInstance.nextToken(token);
    }

    return (await searchInstance.do()) as AccountsSearchResult;
  }
}
