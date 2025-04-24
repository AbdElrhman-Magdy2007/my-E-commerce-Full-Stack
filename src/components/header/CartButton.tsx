"use client";

import { Routes } from "@/constants/enums";
import { getCartQuantity } from "@/lib/cart";
import { selectCartItems } from "@/redux/features/cart/cartSlice";
import { useAppSelector } from "@/redux/hooks";
import { ShoppingCartIcon } from "lucide-react";
import Link from "next/link";

const CartButton = () => {
  const cart = useAppSelector(selectCartItems);
  const cartQuantity = getCartQuantity(cart);
  return (
    <Link href={`/${Routes.CART}`}>
      <span className="px-5 text-xl material-symbols-outlined">{cartQuantity}</span>
      <ShoppingCartIcon />
    </Link>
  );
};

export default CartButton;
