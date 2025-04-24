
"use client";

import { useState, FormEvent, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/Label";
import { Textarea } from "@/components/ui/textarea";
import { getTotalAmount } from "@/lib/cart";
import { formatCurrency } from "@/lib/formatters";
import { selectCartItems } from "@/redux/features/cart/cartSlice";
import { useAppSelector } from "@/redux/hooks";
import { loadStripe } from "@stripe/stripe-js";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import clsx from "clsx";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY as string
);

interface FormData {
  phone: string;
  address: string;
  city: string;
  country: string;
  submit?: string;
}

function CheckoutForm() {
  const cart = useAppSelector(selectCartItems);
  const totalAmount = useMemo(() => getTotalAmount(cart), [cart]);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<FormData>>({});
  const router = useRouter();
  const { data: session } = useSession();

  const [formData, setFormData] = useState<FormData>({
    phone: "",
    address: "",
    city: "",
    country: "",
  });

  useEffect(() => {
    if (session?.user) {
      setFormData({
        phone: session.user.phone || "",
        address: session.user.streetAddress || "",
        city: session.user.city || "",
        country: session.user.country || "",
      });
    }
  }, [session]);

  const validateForm = () => {
    const newErrors: Partial<FormData> = {};
    if (!formData.phone.trim()) newErrors.phone = "Phone number is required";
    if (!formData.address.trim()) newErrors.address = "Address is required";
    if (!formData.city.trim()) newErrors.city = "City is required";
    if (!formData.country.trim()) newErrors.country = "Country is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cart,
          shipping: formData,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to process payment");
      }

      const { id: sessionId } = data;
      const stripe = await stripePromise;
      if (!stripe) {
        throw new Error("Failed to process payment");
      }

      const { error } = await stripe.redirectToCheckout({ sessionId });
      if (error) {
        throw new Error(error.message);
      }
    } catch (error: any) {
      setErrors({ submit: error.message || "Failed to process payment" });
    } finally {
      setIsLoading(false);
    }
  };

  if (!cart || cart.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className={clsx(
          "max-w-md mx-auto text-center py-8 sm:py-12 bg-black",
          "border border-indigo-600 rounded-xl shadow-xl",
          "px-4 sm:px-6"
        )}
        lang="en"
        dir="ltr"
      >
        <div className="flex flex-col items-center gap-6">
          <span className="text-xl sm:text-2xl text-indigo-700 font-medium">
            🛒 Your cart is empty
          </span>
          <motion.div whileHover={{ scale: 1.05 }} transition={{ duration: 0.2 }}>
            <Link
              href="/"
              className={clsx(
                "inline-flex items-center gap-2 px-6 py-3",
                "bg-indigo-600 text-indigo-100 font-medium text-base sm:text-lg",
                "rounded-lg hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-300",
                "shadow-md transition-all duration-200"
              )}
              aria-label="Continue Shopping"
            >
              Shop Now
              <svg
                className="w-5 h-5"
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
          </motion.div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={clsx(
        "max-w-2xl mx-auto bg-black border border-indigo-600",
        "shadow-xl rounded-2xl p-6 sm:p-8 md:p-10 space-y-6",
        "focus-within:ring-2 focus-within:ring-indigo-300"
      )}
      lang="en"
      dir="ltr"
    >
      <h2
        className="text-2xl sm:text-3xl font-bold text-indigo-700 text-center"
        id="checkout-title"
      >
        Checkout
      </h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <Label
            htmlFor="phone"
            className={clsx(
              "text-indigo-700 font-semibold text-base sm:text-lg",
              "flex items-center gap-2"
            )}
          >
            📞 Phone Number
          </Label>
          <Input
            id="phone"
            type="tel"
            placeholder="Enter your phone number"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            required
            className={clsx(
              "w-full p-3 bg-black border border-indigo-600 rounded-lg",
              "text-indigo-700 placeholder-indigo-700/50",
              "focus:ring-2 focus:ring-indigo-300 focus:border-indigo-700",
              errors.phone && "border-red-500"
            )}
            aria-label="Phone Number"
          />
          <AnimatePresence>
            {errors.phone && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={clsx(
                  "text-sm text-indigo-700 flex items-center gap-1",
                  "bg-indigo-900/30 rounded-lg p-2"
                )}
                aria-live="polite"
              >
                <span>⚠</span> {errors.phone}
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        <div className="space-y-4">
          <Label
            htmlFor="address"
            className={clsx(
              "text-indigo-700 font-semibold text-base sm:text-lg",
              "flex items-center gap-2"
            )}
          >
            🏠 Address
          </Label>
          <Textarea
            id="address"
            placeholder="Enter your address"
            name="address"
            value={formData.address}
            onChange={handleChange}
            required
            rows={4}
            className={clsx(
              "w-full p-3 bg-black border border-indigo-600 rounded-lg",
              "text-indigo-700 placeholder-indigo-700/50",
              "focus:ring-2 focus:ring-indigo-300 focus:border-indigo-700",
              errors.address && "border-red-500"
            )}
            aria-label="Address"
          />
          <AnimatePresence>
            {errors.address && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={clsx(
                  "text-sm text-indigo-700 flex items-center gap-1",
                  "bg-indigo-900/30 rounded-lg p-2"
                )}
                aria-live="polite"
              >
                <span>⚠</span> {errors.address}
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          <div className="space-y-4">
            <Label
              htmlFor="city"
              className={clsx(
                "text-indigo-700 font-semibold text-base sm:text-lg",
                "flex items-center gap-2"
              )}
            >
              🌆 City
            </Label>
            <Input
              id="city"
              type="text"
              placeholder="Enter your city"
              name="city"
              value={formData.city}
              onChange={handleChange}
              required
              className={clsx(
                "w-full p-3 bg-black border border-indigo-600 rounded-lg",
                "text-indigo-700 placeholder-indigo-700/50",
                "focus:ring-2 focus:ring-indigo-300 focus:border-indigo-700",
                errors.city && "border-red-500"
              )}
              aria-label="City"
            />
            <AnimatePresence>
              {errors.city && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className={clsx(
                    "text-sm text-indigo-700 flex items-center gap-1",
                    "bg-indigo-900/30 rounded-lg p-2"
                  )}
                  aria-live="polite"
                >
                  <span>⚠</span> {errors.city}
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          <div className="space-y-4">
            <Label
              htmlFor="country"
              className={clsx(
                "text-indigo-700 font-semibold text-base sm:text-lg",
                "flex items-center gap-2"
              )}
            >
              🌍 Country
            </Label>
            <Input
              id="country"
              type="text"
              placeholder="Enter your country"
              name="country"
              value={formData.country}
              onChange={handleChange}
              required
              className={clsx(
                "w-full p-3 bg-black border border-indigo-600 rounded-lg",
                "text-indigo-700 placeholder-indigo-700/50",
                "focus:ring-2 focus:ring-indigo-300 focus:border-indigo-700",
                errors.country && "border-red-500"
              )}
              aria-label="Country"
            />
            <AnimatePresence>
              {errors.country && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className={clsx(
                    "text-sm text-indigo-700 flex items-center gap-1",
                    "bg-indigo-900/30 rounded-lg p-2"
                  )}
                  aria-live="polite"
                >
                  <span>⚠</span> {errors.country}
                </motion.p>
              )}
            </AnimatePresence>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className={clsx(
            "text-center bg-indigo-900/20 rounded-lg py-4 shadow-inner",
            "text-indigo-700"
          )}
          aria-describedby="total-amount"
        >
          <span className="text-lg sm:text-xl font-semibold">
            Total: {formatCurrency(totalAmount)}
          </span>
        </motion.div>

        <AnimatePresence>
          {errors.submit && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={clsx(
                "text-sm text-indigo-700 flex items-center justify-center gap-1",
                "bg-indigo-900/30 rounded-lg p-2"
              )}
              aria-live="polite"
            >
              <span>⚠</span> {errors.submit}
            </motion.p>
          )}
        </AnimatePresence>

        <motion.div whileHover={{ scale: 1.05 }} transition={{ duration: 0.2 }}>
          <Button
            type="submit"
            disabled={isLoading}
            className={clsx(
              "w-full bg-indigo-600 text-indigo-100 font-semibold py-3 rounded-lg",
              "hover:bg-indigo-700 transition-all duration-200",
              "focus:ring-2 focus:ring-indigo-300 shadow-md",
              isLoading && "opacity-50 cursor-not-allowed"
            )}
            aria-label={`Pay ${formatCurrency(totalAmount)}`}
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                Processing...
              </span>
            ) : (
              `Pay ${formatCurrency(totalAmount)}`
            )}
          </Button>
        </motion.div>
      </form>
    </motion.div>
  );
}

export default CheckoutForm;
