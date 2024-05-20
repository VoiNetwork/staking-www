import {
  AlgodTokenHeader,
  CustomTokenHeader,
  IndexerTokenHeader,
  KMDTokenHeader,
} from "algosdk";

export type AlgodConnectionParams = {
  url: string;
  port: string;
  token: string | AlgodTokenHeader | CustomTokenHeader;
};

export type KmdConnectionParams = {
  url: string;
  port: string;
  token: string | KMDTokenHeader | CustomTokenHeader;
};

export type IndexerConnectionParams = {
  url: string;
  port: string;
  token: string | IndexerTokenHeader | CustomTokenHeader;
};

export type A_VersionsCheck = {
  versions?: string[];
  genesis_id: string;
  genesis_hash_b64: string;
  build?: {
    major: number;
    minor: number;
    build_number: number;
    commit_hash: string;
    branch: string;
    channel: string;
  };
};

export type A_Status = {
  catchpoint: string;
  "catchpoint-acquired-blocks": number;
  "catchpoint-processed-accounts": number;
  "catchpoint-total-accounts": number;
  "catchpoint-total-blocks": number;
  "catchpoint-verified-accounts": number;
  "catchup-time": number;
  "last-catchpoint": string;
  "last-round": number;
  "last-version": string;
  "next-version": string;
  "next-version-round": number;
  "next-version-supported": boolean;
  "stopped-at-unsupported-round": boolean;
  "time-since-last-round": number;
};

export interface A_Health {
  "db-available": boolean;
  errors: string[];
  "is-migrating": boolean;
  message: string;
  round: number;
  version: string;
}

export type NodeConnectionParams = {
  id: string;
  label: string;
  name: string;
  algod: AlgodConnectionParams;
  indexer: IndexerConnectionParams;
};

export type A_Genesis = {
  fees: string;
  proto: string;
  rwd: string;
  timestamp: number;
  devmode: boolean;
  network: string;
};
