// "use client"

// import { SessionProvider } from "next-auth/react"

// function NextAuthSessionProvider({ children }: { children: React.ReactNode }) {
//   return (
//     <SessionProvider>{children}</SessionProvider>
//     )
// }

// export default NextAuthSessionProvider

"use client";

import { SessionProvider } from "next-auth/react";
import { ReactNode } from "react";

interface SessionProviderProps {
  children: ReactNode;
}

export default function NextAuthSessionProvider({ children }: SessionProviderProps) {
  return <SessionProvider>{children}</SessionProvider>;
}