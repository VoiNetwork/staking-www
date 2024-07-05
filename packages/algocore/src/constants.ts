export const TIMESTAMP_DISPLAY_FORMAT = "ddd, dd mmmm  yyyy HH:MM:ss";
export const TIMESTAMP_DISPLAY_FORMAT_MINI = "dd/mmm/yyyy HH:MM";

export const BLOCKS_FOR_AVERAGE_BLOCK_TIME = 100;
export const BLOCKS_FOR_AVERAGE_TPS = 100;
export const NODE_TESTNET_HASH: string =
  "SGO1GKSzyE7IEPItTxCByw9x8FmnrCDexi9/cOUJOiI=";
export const NODE_MAINNET_HASH: string =
  "wGHE2Pwdvd7S12BL5FaOP20EGYesN73ktiC1qzkkit8=";
export const NODE_BETANET_HASH: string =
  "mFgazF+2uRS1tMiL9dsj01hJGySEmPN28B/TjjvpVW0=";
export const NODE_SANDNET_GENESIS_ID: string = "sandnet-v1";
export const NODE_DOCKERNET_GENESIS_ID: string = "dockernet-v1";
export const NODE_VOI_TESTNET_HASH: string =
  "IXnoWtviVVJW5LGivNFc0Dq14V3kqaXuK2u5OQrdVZo=";

export interface Indexer_Health {
  "db-available": boolean;
  errors: string[];
  "is-migrating": boolean;
  message: string;
  round: number;
  version: string;
}

export const ZERO_ADDRESS_STRING =
  "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAY5HFKQ";
