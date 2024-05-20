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
  NodeClient,
} from "@repo/algocore";
import voiXUtils from "../../utils/voiXUtils";

export interface Node {
  loading: boolean;
  status: A_Status;
  health: boolean;
  ready: boolean;
  versionsCheck: A_VersionsCheck;
  genesis: A_Genesis;
}

const initialState: Node = {
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
  },
};

export const loadNodeDetails: AsyncThunk<void, void, {}> = createAsyncThunk(
  "node/loadNodeDetails",
  async (_, thunkAPI) => {
    const { dispatch } = thunkAPI;
    try {
      dispatch(setLoading(true));
      const network = voiXUtils.network;
      const nodeClient = new NodeClient(network);

      const statusAwait = nodeClient.status();
      const versionsCheckAwait = nodeClient.versionsCheck();
      const genesisAwait = nodeClient.genesis();
      const healthAwait = nodeClient.health();

      const [status, versionsCheck, genesis, health] = await Promise.all([
        statusAwait,
        versionsCheckAwait,
        genesisAwait,
        healthAwait,
      ]);

      dispatch(setStatus(status));
      dispatch(setVersions(versionsCheck));
      dispatch(setGenesis(genesis));
      dispatch(setHealth(health));
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
    setVersions: (state, action: PayloadAction<A_VersionsCheck>) => {
      state.versionsCheck = action.payload;
    },
    setGenesis: (state, action: PayloadAction<A_Genesis>) => {
      state.genesis = action.payload;
    },
  },
});

export const { setLoading, setVersions, setStatus, setGenesis, setHealth } =
  nodeSlice.actions;
export default nodeSlice.reducer;
