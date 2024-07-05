import { AsyncThunk, createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { loadNodes } from "../network/nodesReducer";

export type AppState = {};
const initialState: AppState = {};

export const initApp: AsyncThunk<void, void, {}> = createAsyncThunk(
  "app/initApp",
  async (_, thunkAPI) => {
    const { dispatch } = thunkAPI;
    dispatch(loadNodes());
  },
);

export const appSlice = createSlice({
  name: "app",
  initialState: {
    ...initialState,
  },
  reducers: {},
});

export default appSlice.reducer;
