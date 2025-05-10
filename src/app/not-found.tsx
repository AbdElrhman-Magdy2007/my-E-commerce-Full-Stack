// src/app/[locale]/not-found.tsx
import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "404 - Page Not Found",
  description: "The page you are looking for does not exist.",
};

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <div className="text-center p-8">
        <h1 className="text-6xl font-bold text-indigo-700 mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-indigo-600 mb-4">Page Not Found</h2>
        <p className="text-indigo-500 mb-8">The page you are looking for does not exist.</p>
        <Link 
          href="/" 
          className="inline-block bg-indigo-700 text-white px-6 py-3 rounded-lg hover:bg-indigo-800 transition-colors"
        >
          Return Home
        </Link>
      </div>
    </div>
  );
}