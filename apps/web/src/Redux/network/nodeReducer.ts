import {
  AsyncThunk,
  createAsyncThunk,
  createSlice,
  PayloadAction,
} from "@reduxjs/toolkit";
import {
  A_Genesis,
  A_Status,
  A_VersionsCheck,
  IdxClient,
  Indexer_Health,
  NodeClient,
} from "@repo/algocore";
import voiStaking from "../../utils/voiStakingUtils";

export interface NodeState {
  loading: boolean;
  status: A_Status;
  health: boolean;
  ready: boolean;
  versionsCheck: A_VersionsCheck;
  genesis: A_Genesis;
  indexer: {
    health: Indexer_Health;
  };
}

const initialState: NodeState = {
  loading: false,
  versionsCheck: {
    genesis_id: "",
    genesis_hash_b64: "",
    build: {
      build_number: 0,
      major: 0,
      branch: "",
      minor: 0,
      commit_hash: "",
      channel: "",
    },
  },
  status: {
    catchpoint: "",
    "catchpoint-acquired-blocks": 0,
    "catchpoint-processed-accounts": 0,
    "catchpoint-total-accounts": 0,
    "catchpoint-total-blocks": 0,
    "catchpoint-verified-accounts": 0,
    "catchup-time": 0,
    "last-catchpoint": "",
    "last-round": 0,
    "last-version": "",
    "next-version": "",
    "next-version-round": 0,
    "next-version-supported": false,
    "stopped-at-unsupported-round": false,
    "time-since-last-round": 0,
  },
  health: false,
  ready: false,
  genesis: {
    network: "",
    fees: "",
    proto: "",
    rwd: "",
    timestamp: 0,
    devmode: false,
    alloc: [],
  },
  indexer: {
    health: {
      "db-available": false,
      errors: [],
      "is-migrating": false,
      message: "",
      round: 0,
      version: "",
    },
  },
};

export const loadNodeDetails: AsyncThunk<void, void, {}> = createAsyncThunk(
  "node/loadNodeDetails",
  async (_, thunkAPI) => {
    const { dispatch } = thunkAPI;
    try {
      dispatch(setLoading(true));
      const network = voiStaking.network;
      const nodeClient = new NodeClient(network);

      const idxClient = new IdxClient(network);

      const statusAwait = nodeClient.status();
      const versionsCheckAwait = nodeClient.versionsCheck();
      const genesisAwait = nodeClient.genesis();
      const healthAwait = nodeClient.health();

      const idxHealthAwait = idxClient.health();

      const [status, versionsCheck, genesis, health, idxHealth] =
        await Promise.all([
          statusAwait,
          versionsCheckAwait,
          genesisAwait,
          healthAwait,
          idxHealthAwait,
        ]);

      dispatch(setStatus(status));
      dispatch(setVersions(versionsCheck));
      dispatch(setGenesis(genesis));
      dispatch(setHealth(health));
      dispatch(setIndexerHealth(idxHealth));
      dispatch(setLoading(false));
    } catch (e: any) {
      dispatch(setLoading(false));
    }
  },
);

export const nodeSlice = createSlice({
  name: "node",
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setStatus: (state, action: PayloadAction<A_Status>) => {
      state.status = action.payload;
    },
    setHealth: (state, action: PayloadAction<boolean>) => {
      state.health = action.payload;
    },
    setReady: (state, action: PayloadAction<boolean>) => {
      state.ready = action.payload;
    },
    setVersions: (state, action: PayloadAction<A_VersionsCheck>) => {
      state.versionsCheck = action.payload;
    },
    setGenesis: (state, action: PayloadAction<A_Genesis>) => {
      state.genesis = action.payload;
    },
    setIndexerHealth: (state, action: PayloadAction<Indexer_Health>) => {
      state.indexer.health = action.payload;
    },
  },
});

export const {
  setLoading,
  setVersions,
  setStatus,
  setGenesis,
  setHealth,
  setReady,
  setIndexerHealth,
} = nodeSlice.actions;
export default nodeSlice.reducer;
