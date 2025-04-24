import { configureStore } from "@reduxjs/toolkit";
import cartReducer from "./features/cart/cartSlice";
import { Environment } from "@/constants/enums";

export const store = configureStore({
  reducer: {
    cart: cartReducer,
  },
  devTools: process.env.NODE_ENV !== Environment.DEV,
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
