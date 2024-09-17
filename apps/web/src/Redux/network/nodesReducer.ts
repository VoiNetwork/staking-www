import {
  AsyncThunk,
  createAsyncThunk,
  createSlice,
  PayloadAction,
} from "@reduxjs/toolkit";
import { NodeConnectionParams } from "@repo/algocore";
import { loadNodeDetails } from "./nodeReducer";
import voiStaking from "../../utils/voiStakingUtils";

const SELECTED_NODE_KEY = "selectedNode";

// Helper to persist selected node to localStorage
function persistSelectedNode(nodeId: string) {
  localStorage.setItem(SELECTED_NODE_KEY, nodeId);
}

// Helper to retrieve the selected node from localStorage
export function getPersistedSelectedNode(): string | null {
  return localStorage.getItem(SELECTED_NODE_KEY);
}

export function getSelectedNode(): NodeConnectionParams | undefined {
  const persistedNodeId = getPersistedSelectedNode();
  if (persistedNodeId) {
    return getPreConfiguredNodes().find((node) => node.id === persistedNodeId);
  }
}

async function getNodes(): Promise<NodeConnectionParams[]> {
  return getPreConfiguredNodes();
}

export function getPreConfiguredNodes(): NodeConnectionParams[] {
  return [
    {
      id: "nodly_voimain",
      label: "Voi Mainnet",
      name: "voimain",
      algod: {
        url: "https://mainnet-api.voi.nodely.dev",
        port: "",
        token: "",
      },
      indexer: {
        url: "https://mainnet-idx.voi.nodely.dev",
        port: "",
        token: "",
      },
    },
    {
      id: "nodly_voitest",
      label: "Voi Testnet",
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

// Load all nodes
export const loadNodes: AsyncThunk<NodeConnectionParams[], void, {}> =
  createAsyncThunk("nodes/loadNodes", async (_, thunkAPI) => {
    const { dispatch } = thunkAPI;
    const nodes = await getNodes();

    // Check if a node was persisted and load it
    const persistedNodeId = getPersistedSelectedNode();
    if (persistedNodeId) {
      dispatch(loadSelectedNode(persistedNodeId)); // Load persisted node
    } else {
      dispatch(loadSelectedNode(undefined)); // Load default node
    }

    return nodes;
  });

// Load the selected node by ID and persist it
export const loadSelectedNode: AsyncThunk<
  NodeConnectionParams,
  string | undefined,
  NonNullable<unknown>
> = createAsyncThunk("nodes/loadSelectedNode", async (nodeId, thunkApi) => {
  const availableNodes = await getNodes();
  const { dispatch } = thunkApi;

  // Select a node by ID, or default to the first node if no ID is provided
  const selectedNode =
    nodeId !== undefined
      ? availableNodes.find((node) => node.id === nodeId)
      : availableNodes[0];

  if (selectedNode) {
    // Persist the selected node ID
    persistSelectedNode(selectedNode.id);

    voiStaking.setNetwork(selectedNode);
    dispatch(loadNodeDetails());
  }

  return selectedNode;
});

// Slice definition
export const nodesSlice = createSlice({
  name: "nodes",
  initialState,
  reducers: {
    // Action to manually select a node by ID and persist it
    selectNode: (state, action: PayloadAction<string>) => {
      const node = state.nodes.find((node) => node.id === action.payload);
      if (node) {
        state.selectedNode = node;
        persistSelectedNode(node.id);
      }
    },
  },
  extraReducers: (builder) => {
    builder.addCase(
      loadNodes.fulfilled,
      (state, action: PayloadAction<NodeConnectionParams[]>) => {
        if (action.payload) {
          state.nodes = action.payload;
        }
      }
    );
    builder.addCase(
      loadSelectedNode.fulfilled,
      (state, action: PayloadAction<NodeConnectionParams | undefined>) => {
        if (action.payload) {
          state.selectedNode = action.payload;
        }
      }
    );
  },
});

export const { selectNode } = nodesSlice.actions;
export default nodesSlice.reducer;
