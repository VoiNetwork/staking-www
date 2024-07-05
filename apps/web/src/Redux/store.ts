import { configureStore } from "@reduxjs/toolkit";
import { useDispatch } from "react-redux";
import appReducer from "./app/appReducer";
import nodesReducer from "./network/nodesReducer";
import nodeReducer from "./network/nodeReducer";

export const store = configureStore({
  reducer: {
    app: appReducer,
    nodes: nodesReducer,
    node: nodeReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export const useAppDispatch = () => useDispatch<AppDispatch>();
