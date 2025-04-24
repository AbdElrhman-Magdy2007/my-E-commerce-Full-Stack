"use client";

import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// تعريف نوع العنصر في السلة
interface CartItem {
  id: string;
  name: string;
  image: string;
  basePrice: number;
  size?: { name: string; price: number };
  extras?: { id: string; name: string; price: number }[];
  quantity: number;
}

// تعريف الحالة الأولية للسلة
interface CartState {
  items: CartItem[];
}

const initialState: CartState = {
  items: [],
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addItemToCart: (state, action: PayloadAction<CartItem>) => {
      const existingItem = state.items.find((item) => item.id === action.payload.id);
      if (existingItem) {
        existingItem.quantity += action.payload.quantity;
      } else {
        state.items.push(action.payload);
      }
    },

    removeItemFromCart: (state, action: PayloadAction<{ id: string }>) => {
      state.items = state.items.filter((item) => item.id !== action.payload.id);
    },

    updateCartItemQuantity: (state, action: PayloadAction<{ id: string; quantity: number }>) => {
      const item = state.items.find((item) => item.id === action.payload.id);
      if (item) {
        item.quantity = action.payload.quantity;
      }
    },
  },
});

// تصدير الإجراءات والمحددات
export const { addItemToCart, removeItemFromCart, updateCartItemQuantity } = cartSlice.actions;
export const selectCartItems = (state: { cart: CartState }) => state.cart.items;

export default cartSlice.reducer;
