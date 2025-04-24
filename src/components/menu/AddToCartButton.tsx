"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import Image from "next/image";
import { Label } from "@/components/ui/Label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { formatCurrency } from "@/lib/formatters";
import { Checkbox } from "../ui/checkbox";
import { ProductWithRelations } from "@/types/product";
import { Extra, Size } from "@prisma/client";
import { useState, useMemo, useCallback, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import {
  addToCartItem,
  removeCartItem,
  removeItemFromCart,
  selectCartItems,
} from "@/redux/features/cart/cartSlice";
import { getItemQuantity } from "@/lib/cart";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import clsx from "clsx";
import { toast } from "sonner";

// تعريف الـ Props
interface AddToCartButtonProps {
  item: ProductWithRelations;
  isLoading?: boolean;
}

// تحسين السكيلتون مع ترتيب جديد
function AddToCartSkeleton() {
  return (
    <div className="p-4 sm:p-6">
      <Skeleton
        width="70%"
        height={32}
        className="mb-4 mx-auto"
        baseColor="#1e1b4b"
        highlightColor="#312e81"
      />
      <div className="flex justify-center mb-4">
        <Skeleton
          height={160}
          width={160}
          className="rounded-full"
          baseColor="#1e1b4b"
          highlightColor="#312e81"
        />
      </div>
      <Skeleton
        width="80%"
        height={16}
        className="mb-6 mx-auto"
        baseColor="#1e1b4b"
        highlightColor="#312e81"
      />
      <div className="grid gap-4">
        <div>
          <Skeleton
            width="25%"
            height={20}
            className="mb-2"
            baseColor="#1e1b4b"
            highlightColor="#312e81"
          />
          <Skeleton
            height={70}
            className="rounded-md"
            baseColor="#1e1b4b"
            highlightColor="#312e81"
          />
        </div>
        <div>
          <Skeleton
            width="25%"
            height={20}
            className="mb-2"
            baseColor="#1e1b4b"
            highlightColor="#312e81"
          />
          <Skeleton
            height={90}
            className="rounded-md"
            baseColor="#1e1b4b"
            highlightColor="#312e81"
          />
        </div>
        <Skeleton
          width="60%"
          height={28}
          className="mt-4 mx-auto"
          baseColor="#1e1b4b"
          highlightColor="#312e81"
        />
      </div>
      <Skeleton
        width="100%"
        height={48}
        className="mt-4 rounded-xl"
        baseColor="#1e1b4b"
        highlightColor="#312e81"
      />
    </div>
  );
}

function AddToCartButton({ item, isLoading = false }: AddToCartButtonProps) {
  const cart = useAppSelector(selectCartItems);
  const dispatch = useAppDispatch();

  const quantity = useMemo(() => getItemQuantity(item.id, cart), [item.id, cart]);

  const defaultSize = useMemo(
    () => cart.find((element) => element.id === item.id)?.size ?? item.sizes[0],
    [cart, item.id, item.sizes]
  );
  const defaultExtras = useMemo(
    () => cart.find((element) => element.id === item.id)?.extras ?? [],
    [cart, item.id]
  );

  const [selectedSize, setSelectedSize] = useState<Size>(defaultSize);
  const [selectedExtras, setSelectedExtras] = useState<Extra[]>(defaultExtras);

  const totalPrice = useMemo(() => {
    let price = item.basePrice + (selectedSize?.price ?? 0);
    for (const extra of selectedExtras) {
      price += extra.price;
    }
    return price;
  }, [item.basePrice, selectedSize, selectedExtras]);

  // Log limit to console
  useEffect(() => {
    console.log('Product Limit:', item.limit ?? 1);
  }, [item.limit]);

  const handleAddToCart = useCallback(() => {
    const limit = item.limit ?? 1; // Default to 1 if limit is null
    if (quantity >= limit) {
      toast.error(`Cannot add more than ${limit} items to the cart.`, {
        style: {
          backgroundColor: "#4E1313",
          color: "#FCA5A5",
          border: "1px solid #FCA5A5",
          borderRadius: "10px",
          padding: "16px",
        },
        position: "top-right",
        duration: 3000,
      });
      return;
    }
    dispatch(
      addToCartItem({
        name: item.name,
        id: item.id,
        image: item.image,
        basePrice: item.basePrice,
        size: selectedSize,
        extras: selectedExtras,
        quantity: 1,
      })
    );
  }, [dispatch, item, selectedSize, selectedExtras, quantity]);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          type="button"
          size="lg"
          className={clsx(
            "mt-4 w-full bg-indigo-600",
            "hover:bg-indigo-700",
            "transition-transform transform hover:scale-105 duration-300 ease-in-out",
            "shadow-xl px-6 py-3 text-lg font-semibold rounded-xl text-indigo-100",
            "active:scale-95 focus:ring-4 focus:ring-indigo-300",
            isLoading && "opacity-50 cursor-not-allowed"
          )}
          disabled={isLoading}
          aria-label={isLoading ? "Loading" : `Add ${item.name} to cart`}
        >
          {isLoading ? (
            <Skeleton
              width={100}
              height={20}
              baseColor="#1e1b4b"
              highlightColor="#312e81"
            />
          ) : (
            <span className="flex items-center gap-2">🛒 Add to Cart</span>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent
        className={clsx(
          "sm:max-w-[550px] max-h-[90vh] overflow-y-auto",
          "bg-black rounded-2xl shadow-2xl p-4 sm:p-6 border border-indigo-600"
        )}
      >
        {isLoading ? (
          <AddToCartSkeleton />
        ) : (
          <div className="flex flex-col gap-4 sm:gap-6">
            <DialogHeader className="flex flex-col items-center text-center">
              <DialogTitle className="text-2xl sm:text-3xl font-bold text-indigo-700 mb-2 sm:mb-3">
                {item.name}
              </DialogTitle>
            </DialogHeader>
            <div className="flex justify-center">
              <div className="relative w-full max-w-[160px] sm:max-w-[200px] aspect-square">
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  className="rounded-full shadow-lg object-cover transition-transform duration-500 hover:scale-105"
                  sizes="(max-width: 640px) 160px, 200px"
                  loading="lazy"
                />
              </div>
            </div>
            <DialogDescription className="text-indigo-700 text-sm leading-relaxed text-center max-w-md mx-auto">
              {item.description}
            </DialogDescription>
            <div className="grid gap-4 sm:gap-6">
              <div className="flex flex-col gap-2">
                <Label className="font-medium text-indigo-700 text-base sm:text-lg">
                  🔘 Select Size
                </Label>
                <PickSize
                  item={item}
                  sizes={item.sizes}
                  selectedSize={selectedSize}
                  setSelectedSize={setSelectedSize}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label className="font-medium text-indigo-700 text-base sm:text-lg">
                  ⭐ Choose Extras
                </Label>
                <Extras
                  extras={item.extras}
                  selectedExtras={selectedExtras}
                  setSelectedExtras={setSelectedExtras}
                />
              </div>
            </div>
            <div
              className="text-center bg-indigo-900/20 rounded-lg py-2 sm:py-3"
              aria-describedby="cart-details"
            >
              <span className="text-lg sm:text-xl font-semibold text-indigo-700">
                Total: {formatCurrency(totalPrice)}
              </span>
              <span className="block text-sm text-indigo-700 mt-1">
                Quantity: {quantity}
              </span>
              <span className="block text-sm text-indigo-700 mt-1">
                Limit: {item.limit ?? 1}
              </span>
            </div>
            <DialogFooter className="flex flex-col sm:flex-row sm:justify-center gap-2 sm:gap-3 mt-2 sm:mt-4">
              {quantity === 0 ? (
                <Button
                  onClick={handleAddToCart}
                  className={clsx(
                    "w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700",
                    "transition-transform transform hover:scale-105 duration-300 ease-in-out",
                    "shadow-lg px-6 sm:px-8 py-2 sm:py-3 text-base sm:text-lg font-semibold text-indigo-100 rounded-xl",
                    "active:scale-95 focus:ring-4 focus:ring-indigo-300"
                  )}
                  aria-label={`Confirm adding ${item.name} to cart for ${formatCurrency(totalPrice)}`}
                >
                  ✅ Confirm & Add to Cart
                </Button>
              ) : (
                <ChooseQuantity
                  quantity={quantity}
                  item={item}
                  selectedSize={selectedSize}
                  selectedExtras={selectedExtras}
                />
              )}
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function PickSize({
  sizes,
  item,
  selectedSize,
  setSelectedSize,
}: {
  sizes: Size[];
  item: ProductWithRelations;
  selectedSize: Size;
  setSelectedSize: React.Dispatch<React.SetStateAction<Size>>;
}) {
  return (
    <RadioGroup
      className="grid grid-cols-1 sm:grid-cols-2 gap-2"
      aria-label="Select product size"
    >
      {sizes.map((size) => (
        <div
          key={size.id}
          className={clsx(
            "flex items-center p-2 rounded-lg border transition-colors duration-200",
            selectedSize.id === size.id
              ? "border-indigo-600 bg-indigo-900/30"
              : "border-indigo-800 hover:bg-indigo-900/10"
          )}
        >
          <RadioGroupItem
            value={size.name}
            checked={selectedSize.id === size.id}
            onClick={() => setSelectedSize(size)}
            id={size.id}
            className="mr-2 text-indigo-400"
            aria-label={`Select ${size.name} size for ${formatCurrency(item.basePrice + size.price)}`}
          />
          <Label
            htmlFor={size.id}
            className="flex-1 text-sm font-medium text-indigo-700 cursor-pointer"
          >
            {size.name} ({formatCurrency(item.basePrice + size.price)})
          </Label>
        </div>
      ))}
    </RadioGroup>
  );
}

function Extras({
  extras,
  selectedExtras,
  setSelectedExtras,
}: {
  extras: Extra[];
  selectedExtras: Extra[];
  setSelectedExtras: React.Dispatch<React.SetStateAction<Extra[]>>;
}) {
  const handleExtraToggle = useCallback(
    (extra: Extra) => {
      setSelectedExtras((prev) =>
        prev.some((e) => e.id === extra.id)
          ? prev.filter((e) => e.id !== extra.id)
          : [...prev, extra]
      );
    },
    [setSelectedExtras]
  );

  return (
    <div
      className="grid grid-cols-1 sm:grid-cols-2 gap-2"
      aria-label="Select product extras"
    >
      {extras.map((extra) => (
        <div
          key={extra.id}
          className={clsx(
            "flex items-center p-2 rounded-lg border transition-colors duration-200",
            selectedExtras.some((e) => e.id === extra.id)
              ? "border-indigo-600 bg-indigo-900/30"
              : "border-indigo-800 hover:bg-indigo-900/10"
          )}
        >
          <Checkbox
            id={extra.id}
            checked={selectedExtras.some((e) => e.id === extra.id)}
            onCheckedChange={() => handleExtraToggle(extra)}
            className="mr-2 border-indigo-400 text-indigo-600"
            aria-label={`Add ${extra.name} extra for ${formatCurrency(extra.price)}`}
          />
          <Label
            htmlFor={extra.id}
            className="flex-1 text-sm font-medium text-indigo-700 cursor-pointer"
          >
            {extra.name} ({formatCurrency(extra.price)})
          </Label>
        </div>
      ))}
    </div>
  );
}

function ChooseQuantity({
  quantity,
  item,
  selectedSize,
  selectedExtras,
}: {
  quantity: number;
  item: ProductWithRelations;
  selectedSize: Size;
  selectedExtras: Extra[];
}) {
  const dispatch = useAppDispatch();

  const limit = item.limit ?? 1; // Default to 1 if limit is null

  const handleAdd = useCallback(() => {
    if (quantity >= limit) {
      toast.error(`Cannot add more than ${limit} items to the cart.`, {
        style: {
          backgroundColor: "#4E1313",
          color: "#FCA5A5",
          border: "1px solid #FCA5A5",
          borderRadius: "10px",
          padding: "16px",
        },
        position: "top-right",
        duration: 3000,
      });
      return;
    }
    dispatch(
      addToCartItem({
        basePrice: item.basePrice,
        name: item.name,
        id: item.id,
        image: item.image,
        size: selectedSize,
        extras: selectedExtras,
        quantity: 1,
      })
    );
  }, [dispatch, item, selectedSize, selectedExtras, quantity, limit]);

  const handleRemove = useCallback(() => {
    dispatch(removeCartItem({ id: item.id }));
  }, [dispatch, item.id]);

  const handleRemoveAll = useCallback(() => {
    dispatch(removeItemFromCart({ id: item.id }));
  }, [dispatch, item.id]);

  return (
    <div
      className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3 w-full"
      aria-label={`Manage quantity of ${item.name} in cart`}
    >
      <Button
        size="sm"
        onClick={handleRemoveAll}
        className={clsx(
          "w-full sm:w-auto px-4 sm:px-5 py-2 bg-transparent border-indigo-600 hover:bg-indigo-700",
          "text-indigo-100 font-medium rounded-lg transition-colors duration-200",
          "focus:ring-4 focus:ring-indigo-300"
        )}
        aria-label={`Remove all ${item.name} from cart`}
      >
        Remove All
      </Button>
      <div className="flex items-center gap-2 bg-indigo-900 rounded-lg p-1">
        <Button
          variant="outline"
          size="sm"
          onClick={handleRemove}
          className={clsx(
            "h-8 sm:h-9 w-8 sm:w-9 text-sm sm:text-base font-bold",
            "border-indigo-600 text-indigo-700 hover:bg-indigo-800 hover:text-indigo-100",
            "focus:ring-4 focus:ring-indigo-300"
          )}
          aria-label={`Decrease quantity of ${item.name}`}
        >
          -
        </Button>
        <span className="px-2 sm:px-3 text-sm font-medium text-indigo-700">
          {quantity}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={handleAdd}
          className={clsx(
            "h-8 sm:h-9 w-8 sm:w-9 text-sm sm:text-base font-bold",
            "border-indigo-600 text-indigo-700 hover:bg-indigo-800 hover:text-indigo-100",
            "focus:ring-4 focus:ring-indigo-300",
            quantity >= limit && "opacity-50 cursor-not-allowed"
          )}
          disabled={quantity >= limit}
          aria-label={`Increase quantity of ${item.name}`}
        >
          +
        </Button>
      </div>
      <DialogClose asChild>
        <Button
          variant="outline"
          className={clsx(
            "w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700",
            "transition-transform transform hover:scale-105 duration-300 ease-in-out",
            "shadow-lg px-4 sm:px-6 py-2 text-sm sm:text-base font-semibold text-indigo-100 rounded-lg",
            "active:scale-95 focus:ring-4 focus:ring-indigo-300"
          )}
          aria-label={`Close dialog for ${item.name}`}
        >
          OK
        </Button>
      </DialogClose>
    </div>
  );
}

export default AddToCartButton;
