"use client";

function Success() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="max-w-md mx-auto bg-white shadow-2xl rounded-3xl p-10 space-y-8 border border-gray-200 text-center">
        <h2 className="text-3xl font-black text-gray-900 font-serif tracking-tight">
          Payment Successful!
        </h2>
        <p className="text-gray-600">
          Thank you for your purchase. You’ll receive a confirmation soon.
        </p>
      </div>
    </div>
  );
}

export default Success;