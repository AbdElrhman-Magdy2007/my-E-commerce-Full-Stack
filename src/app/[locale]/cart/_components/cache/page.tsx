"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

function Cacheing() {
  const router = useRouter();

  useEffect(() => {
    // Simulate some processing (e.g., caching or payment confirmation)
    const timer = setTimeout(() => {
      // Redirect to a success page or back to home after 3 seconds
      router.push("/success"); // Adjust the path as needed
    }, 3000);

    return () => clearTimeout(timer); // Cleanup
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="max-w-md mx-auto bg-white shadow-2xl rounded-3xl p-10 space-y-8 border border-gray-200 text-center">
        <h2 className="text-3xl font-black text-gray-900 font-serif tracking-tight">
          Processing Your Payment
        </h2>
        <div className="flex justify-center">
          <svg
            className="animate-spin h-10 w-10 text-blue-600"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        </div>
        <p className="text-gray-600">
          Please wait while we process your transaction...
        </p>
      </div>
    </div>
  );
}

export default Cacheing;