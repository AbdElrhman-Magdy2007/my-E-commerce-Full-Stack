

"use client";

import { getSubTotal, deliveryFee } from "@/lib/cart";
import { formatCurrency } from "@/lib/formatters";
import {
  removeItemFromCart,
  selectCartItems,
} from "@/redux/features/cart/cartSlice";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import Image from "next/image";
import { useMemo, useCallback, useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import clsx from "clsx";

function CartItems() {
  const cart = useAppSelector(selectCartItems);
  const dispatch = useAppDispatch();
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (loaded) {
      localStorage.setItem("cartItems", JSON.stringify(cart));
    }
  }, [cart, loaded]);

  const subTotal = useMemo(() => getSubTotal(cart), [cart]);
  const total = useMemo(() => subTotal + (deliveryFee ?? 0), [subTotal]);

  const handleRemove = useCallback(
    (id: string) => {
      if (confirm("Are you sure you want to remove this item from the cart?")) {
        dispatch(removeItemFromCart({ id }));
      }
    },
    [dispatch]
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-black border border-indigo-600 shadow-md rounded-2xl p-6 sm:p-8 max-w-4xl mx-auto"
      lang="en"
      dir="ltr"
    >
      {cart.length > 0 ? (
        <>
          <ul className="space-y-4">
            {cart.map((item) => {
              const sizePrice = item.size?.price || 0;
              const extrasPrice =
                item.extras?.reduce((sum, extra) => sum + extra.price, 0) || 0;
              const unitPrice = item.basePrice + sizePrice + extrasPrice;
              const totalPrice = unitPrice * item.quantity;

              return (
                <motion.li
                  key={item.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.2 }}
                  className={clsx(
                    "flex flex-col sm:flex-row items-center gap-4",
                    "bg-black border border-indigo-600 rounded-lg p-4",
                    "hover:shadow-lg transition-shadow duration-200"
                  )}
                >
                  {/* Product Image */}
                  <div
                    className="relative w-20 sm:w-24 h-20 sm:h-24 flex-shrink-0 rounded-full overflow-hidden border border-indigo-600"
                  >
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 80px, 96px"
                      loading="lazy"
                    />
                  </div>

                  {/* Product Details */}
                  <div className="flex-1 space-y-1 text-indigo-700">
                    <h4 className="font-semibold text-base sm:text-lg">
                      {item.name}
                    </h4>
                    <p className="text-sm sm:text-base">
                      💰 Base Price:{" "}
                      <span className="font-semibold">
                        {formatCurrency(item.basePrice)}
                      </span>
                    </p>
                    {item.size && (
                      <p className="text-sm sm:text-base">
                        📏 Size: {item.size.name}{" "}
                        <span className="font-semibold">
                          (+{formatCurrency(sizePrice)})
                        </span>
                      </p>
                    )}
                    {item.extras?.length > 0 && (
                      <p className="text-sm sm:text-base">
                        ⭐ Extras:{" "}
                        {item.extras.map((extra) => (
                          <span
                            key={extra.id}
                            className="ml-1 bg-indigo-900/30 px-1.5 py-0.5 rounded text-xs"
                          >
                            {extra.name} (+{formatCurrency(extra.price)})
                          </span>
                        ))}
                      </p>
                    )}
                  </div>

                  {/* Quantity and Price */}
                  <div className="flex flex-col items-center gap-1 text-indigo-700">
                    <p className="text-sm sm:text-base">
                      📦 Quantity:{" "}
                      <span className="font-semibold">{item.quantity}</span>
                    </p>
                    <p className="text-base sm:text-lg font-bold">
                      {formatCurrency(totalPrice)}
                    </p>
                  </div>

                  {/* Remove Button */}
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleRemove(item.id)}
                    className={clsx(
                      "w-10 h-10 flex items-center justify-center",
                      "bg-indigo-600 text-indigo-100 rounded-lg",
                      "hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-300",
                      "transition-colors duration-200"
                    )}
                    aria-label={`Remove ${item.name} from cart`}
                  >
                    <Trash2 size={18} />
                  </motion.button>
                </motion.li>
              );
            })}
          </ul>

          {/* Totals */}
          <div
            className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 bg-indigo-900/20 rounded-lg p-4 text-center"
            aria-describedby="cart-totals"
          >
            <div>
              <span className="text-indigo-700 text-sm sm:text-base">
                📦 Subtotal
              </span>
              <p className="text-base sm:text-lg font-semibold text-indigo-700">
                {formatCurrency(subTotal)}
              </p>
            </div>
            <div>
              <span className="text-indigo-700 text-sm sm:text-base">
                🚚 Delivery
              </span>
              <p className="text-base sm:text-lg font-semibold text-indigo-700">
                {formatCurrency(deliveryFee ?? 0)}
              </p>
            </div>
            <div>
              <span className="text-indigo-700 text-base sm:text-lg font-bold">
                🛒 Total
              </span>
              <p className="text-lg sm:text-xl font-bold text-indigo-700">
                {formatCurrency(total)}
              </p>
            </div>
          </div>
        </>
      ) : (
        <div className="text-center py-6 bg-black border border-indigo-600 rounded-lg">
          <div className="flex flex-col items-center gap-4">
            <span className="text-lg sm:text-xl text-indigo-700 font-medium">
              🛒 Your cart is empty
            </span>
            <Link
              href="/"
              className={clsx(
                "inline-flex items-center gap-2 text-indigo-700 font-medium",
                "hover:text-indigo-500 transition-colors duration-200",
                "focus:ring-2 focus:ring-indigo-300 rounded-lg px-3 py-1.5"
              )}
              aria-label="Continue Shopping"
            >
              Continue Shopping
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </Link>
          </div>
        </div>
      )}
    </motion.div>
  );
}

export default CartItems;