import { AsyncThunk, createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { loadNodeDetails } from "../network/nodeReducer";

export type AppState = {
  isDevMode: boolean;
};
const initialState: AppState = {
  isDevMode: false,
};

export const initApp: AsyncThunk<void, void, {}> = createAsyncThunk(
  "app/initApp",
  async (_, thunkAPI) => {
    const { dispatch } = thunkAPI;
    dispatch(loadNodeDetails());
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
