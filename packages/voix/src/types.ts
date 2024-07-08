export interface ContractDetails {
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
  part_vote_k: string | null;
  part_sel_k: string | null;
  part_vote_fst: string | null;
  part_vote_lst: string | null;
  part_vote_kd: string | null;
  part_sp_key: string | null;
  deleted: number;
}
