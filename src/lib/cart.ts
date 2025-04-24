import { CartItem } from "@/redux/features/cart/cartSlice";


export const deliveryFee = 5;


export const getCartQuantity = (cart: CartItem[] = []) => {
  if (!Array.isArray(cart)) return 0; // التأكد من أن cart مصفوفة
  return cart.reduce((total, item) => total + (item.quantity ?? 0), 0);
};


export const getItemQuantity = (id: string, cart: CartItem[] = []) => {
  return cart.find((item) => item.id === id)?.quantity ?? 0;
};


export const getSubTotal = (cart: CartItem[]) => {
  return cart.reduce((total, cartItem) => {
    const extrasTotal =
      cartItem.extras?.reduce((sum, extra) => sum + (extra.price || 0), 0) || 0;

    const itemTotal =
      cartItem.basePrice + extrasTotal + (cartItem.size?.price || 0);

    return total + itemTotal * (cartItem.quantity ?? 1);
  }, 0);
};

export const getTotalAmount = (cart: CartItem[]) => {
  return getSubTotal(cart) + deliveryFee;
};
