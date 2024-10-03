import { BinaryState, IntegerState } from "./clients/AirdropClient";

export type AccountData = {
  contractId: number;
  contractAddress: string;
  creator: string;
  createRound: number;
  lastSyncRound: number;
  global_funder: string;
  global_funding: string | null;
  global_owner: string;
  global_period: number;
  global_total: string | null;
  global_period_seconds: number;
  global_lockup_delay: number;
  global_vesting_delay: number;
  global_period_limit: number;
  global_delegate: string | null;
  global_parent_id: number;
  global_messenger_id: number;
  global_initial: string;
  global_deadline: number;
  global_distribution_count: number;
  global_distribution_seconds: number;
  part_vote_k: string | null;
  part_sel_k: string | null;
  part_vote_fst: number | null;
  part_vote_lst: number | null;
  part_vote_kd: number | null;
  part_sp_key: string | null;
  deleted: number;
};

export type StakingContractState = {
  funder?: BinaryState;
  funding?: IntegerState;
  owner?: BinaryState;
  period?: IntegerState;
  total?: IntegerState;
  delegate?: BinaryState;
};

export type ParticipateParams = {
  selK: Uint8Array;
  spKey: Uint8Array;
  voteFst: number | bigint;
  voteK: Uint8Array;
  voteKd: number | bigint;
  voteLst: number | bigint;
};

export type CreateParams = {
  amount: number;
  extraPayment?: number;
  owner: string;
  funder: string;
  delegate: string;
  period: number;
};
