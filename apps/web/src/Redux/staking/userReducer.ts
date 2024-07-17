import {
  AsyncThunk,
  createAsyncThunk,
  createSlice,
  PayloadAction,
} from "@reduxjs/toolkit";
import {
  AccountData,
  CoreStaker,
  StakingClient,
  StakingContractState,
} from "@repo/voix";
import { AccountResult } from "@algorandfoundation/algokit-utils/types/indexer";
import { AccountClient } from "@repo/algocore";
import voiStakingUtils from "../../utils/voiStakingUtils";

export type UserState = {
  account: {
    loading: boolean;
    data: AccountData | undefined;
  };
  staking: {
    loading: boolean;
    account: AccountResult | undefined;
  };
  contract: {
    loading: boolean;
    state: StakingContractState | undefined;
  };
};

const initialState: UserState = {
  account: {
    loading: false,
    data: undefined,
  },
  staking: {
    loading: false,
    account: undefined,
  },
  contract: {
    loading: false,
    state: undefined,
  },
};

export const loadAccountData: AsyncThunk<void, string, any> = createAsyncThunk(
  "user/loadAccountData",
  async (address: string, thunkAPI) => {
    const { dispatch } = thunkAPI;
    try {
      dispatch(setAccountDataLoading(true));
      const accountData = await new StakingClient().getAccountData(address);
      dispatch(setAccountData(accountData));
      dispatch(loadStakingAccount(accountData.contractAddress));
      dispatch(loadContractState(accountData));
    } catch (e) {
      /* empty */
    } finally {
      dispatch(setAccountDataLoading(false));
    }
  },
);

export const loadStakingAccount: AsyncThunk<void, string, any> =
  createAsyncThunk(
    "user/loadStakingAccount",
    async (address: string, thunkAPI) => {
      const { dispatch } = thunkAPI;
      try {
        dispatch(setStakingAccountLoading(true));
        const account = await new AccountClient(voiStakingUtils.network).get(
          address,
        );
        dispatch(setStakingAccount(account));
      } catch (e) {
        /* empty */
      } finally {
        dispatch(setStakingAccountLoading(false));
      }
    },
  );

export const loadContractState: AsyncThunk<void, AccountData, any> =
  createAsyncThunk(
    "user/loadContractState",
    async (data: AccountData, thunkAPI) => {
      const { dispatch } = thunkAPI;
      try {
        dispatch(setContractStateLoading(true));
        const state = await new CoreStaker(data).getStakingState(
          voiStakingUtils.network.getAlgodClient(),
        );
        dispatch(setContractState(state));
      } catch (e) {
        /* empty */
      } finally {
        dispatch(setContractStateLoading(false));
      }
    },
  );

export const nodeSlice = createSlice({
  name: "node",
  initialState,
  reducers: {
    setAccountDataLoading: (state, action: PayloadAction<boolean>) => {
      state.account.loading = action.payload;
    },
    setAccountData: (state, action: PayloadAction<AccountData>) => {
      state.account.data = action.payload;
    },
    setStakingAccountLoading: (state, action: PayloadAction<boolean>) => {
      state.staking.loading = action.payload;
    },
    setStakingAccount: (state, action: PayloadAction<AccountResult>) => {
      state.staking.account = action.payload;
    },
    setContractStateLoading: (state, action: PayloadAction<boolean>) => {
      state.contract.loading = action.payload;
    },
    setContractState: (state, action: PayloadAction<StakingContractState>) => {
      state.contract.state = action.payload;
    },
  },
});

export const {
  setStakingAccountLoading,
  setAccountData,
  setAccountDataLoading,
  setStakingAccount,
  setContractStateLoading,
  setContractState,
} = nodeSlice.actions;

export default nodeSlice.reducer;
