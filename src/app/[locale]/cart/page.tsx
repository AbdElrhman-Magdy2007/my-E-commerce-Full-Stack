
import CheckoutForm from "./_components/CheckoutForm";
import Link from "next/link";
import { clsx } from "clsx";
import CartItems from "./_components/Cartltems";

function CartPage() {
  return (
    <main className="bg-black min-h-screen">
      <section
        className="py-8 sm:py-12"
        aria-labelledby="cart-title"
        aria-describedby="cart-description"
      >
        <div className="container mx-auto px-4 sm:px-6 max-w-7xl">
          <header className="text-center mb-6 sm:mb-8">
            <h1
              id="cart-title"
              className="text-3xl sm:text-4xl font-bold italic text-indigo-700 transition-colors duration-200 hover:text-indigo-500"
            >
              Your Cart
            </h1>
            <p
              id="cart-description"
              className="mt-2 text-base sm:text-lg text-indigo-700 max-w-2xl mx-auto leading-relaxed"
            >
              Review your selected items and proceed to checkout.
            </p>
          </header>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
            <div
              className={clsx(
                "bg-black border border-indigo-600 rounded-2xl shadow-md",
                "p-4 sm:p-6 transition-all duration-200 hover:shadow-lg",
                "focus-within:ring-2 focus-within:ring-indigo-300"
              )}
            >
              <h2 className="text-xl sm:text-2xl font-semibold text-indigo-700 mb-4">
                Your Items
              </h2>
              <CartItems />
            </div>
            <div
              className={clsx(
                "bg-black border border-indigo-600 rounded-2xl shadow-md",
                "p-4 sm:p-6 transition-all duration-200 hover:shadow-lg",
                "focus-within:ring-2 focus-within:ring-indigo-300",
                "lg:sticky lg:top-6"
              )}
            >
              <h2 className="text-xl sm:text-2xl font-semibold text-indigo-700 mb-4">
                Checkout
              </h2>
              <CheckoutForm />
            </div>
          </div>
          <footer className="mt-6 sm:mt-8 text-center">
            <Link
              href="/"
              className={clsx(
                "inline-flex items-center gap-2 text-indigo-700 text-base sm:text-lg font-medium",
                "hover:text-indigo-500 transition-colors duration-200",
                "focus:ring-2 focus:ring-indigo-300 rounded-lg px-4 py-2"
              )}
              aria-label="Continue shopping"
            >
              <span>Continue Shopping</span>
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
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </Link>
          </footer>
        </div>
      </section>
    </main>
  );
}

export default CartPage;
