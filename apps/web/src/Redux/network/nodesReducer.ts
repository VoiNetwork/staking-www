import {
  AsyncThunk,
  createAsyncThunk,
  createSlice,
  PayloadAction,
} from "@reduxjs/toolkit";
import { NodeConnectionParams } from "@repo/algocore";
import { loadNodeDetails } from "./nodeReducer";
import voiStaking from "../../utils/voiStakingUtils";

async function getNodes(): Promise<NodeConnectionParams[]> {
  return getPreConfiguredNodes();
}

export function getPreConfiguredNodes(): [NodeConnectionParams] {
  return [
    {
      id: "nodly_voinet",
      label: "Voinet",
      name: "voitest",
      algod: {
        url: "https://testnet-api.voi.nodly.io",
        port: "",
        token: "",
      },
      indexer: {
        url: "https://testnet-idx.voi.nodly.io",
        port: "",
        token: "",
      },
    },
  ];
}

export interface NodesReducer {
  nodes: NodeConnectionParams[];
  selectedNode?: NodeConnectionParams;
}

const initialState: NodesReducer = {
  nodes: [],
  selectedNode: undefined,
};

export const loadNodes: AsyncThunk<NodeConnectionParams[], void, {}> =
  createAsyncThunk("nodes/loadNodes", async (_, thunkAPI) => {
    const { dispatch } = thunkAPI;
    const nodes = await getNodes();
    dispatch(loadSelectedNode());
    return nodes;
  });

export const loadSelectedNode: AsyncThunk<
  NodeConnectionParams,
  void,
  NonNullable<unknown>
> = createAsyncThunk("nodes/loadSelectedNode", async (_, thunkApi) => {
  const availableNodes = await getNodes();

  const { dispatch } = thunkApi;

  const node = availableNodes[0];

  voiStaking.setNetwork(node);
  dispatch(loadNodeDetails());

  return node;
});

export const nodesSlice = createSlice({
  name: "nodes",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(
      loadNodes.fulfilled,
      (state, action: PayloadAction<NodeConnectionParams[]>) => {
        if (action.payload) {
          state.nodes = action.payload;
        }
      },
    );
    builder.addCase(
      loadSelectedNode.fulfilled,
      (state, action: PayloadAction<NodeConnectionParams | undefined>) => {
        if (action.payload) {
          state.selectedNode = action.payload;
        }
      },
    );
  },
});

export default nodesSlice.reducer;
