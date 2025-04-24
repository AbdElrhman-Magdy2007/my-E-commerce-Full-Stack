import { RootState } from "@/redux/store";
import { Extra, Size } from "@prisma/client";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type CartItem = {
  name: string;
  id: string;
  image: string;
  basePrice: number;
  quantity?: number;
  size?: Size;
  extras?: Extra[];
};
interface CartState {
  items: CartItem[];
}

// تحميل البيانات من `localStorage` إذا كانت متاحة
const getInitialCartItems = (): CartItem[] => {
  if (typeof window !== "undefined") {
    const savedCartItems = localStorage.getItem("cartItems");
    return savedCartItems ? JSON.parse(savedCartItems) : [];
  }
  return [];
};

const initialState: CartState = {
  items: getInitialCartItems(),
};
export const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addToCartItem: (state, action: PayloadAction<CartItem>) => {
      const existingItem = state.items.find(
        (item) => item.id === action.payload.id
      );
      if (existingItem) {
        existingItem.quantity = (existingItem.quantity || 0) + 1;
        existingItem.extras = action.payload.extras;
        existingItem.size = action.payload.size;
      } else {
        state.items.push({ ...action.payload, quantity: 1 });
      }
    },
    removeCartItem: (state, action: PayloadAction<{ id: string }>) => {
      const item = state.items.find((item) => item.id === action.payload.id);
      if (item) {
        if (item.quantity === 1) {
          state.items = state.items.filter(
            (item) => item.id !== action.payload.id
          );
        } else {
          item.quantity! -= 1;
        }
      }
    },
    removeItemFromCart: (state, action: PayloadAction<{ id: string }>) => {
      state.items = state.items.filter((item) => item.id !== action.payload.id);
    },
    clearCart: (state) => {
      state.items = [];
    }
  },
});

export const { addToCartItem, removeCartItem, removeItemFromCart, clearCart } = cartSlice.actions;

export default cartSlice.reducer;

export const selectCartItems = (state: RootState) => state.cart.items;
