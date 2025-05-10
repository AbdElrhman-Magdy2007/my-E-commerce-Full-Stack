// "use client";

// import { Provider } from "react-redux";
// import { store } from "@/redux/store";


// export default function ReduxProvider({ 
//     children ,
//     }: {
//         children: React.ReactNode;
//     }) {
//     return <Provider store={store}>{children}</Provider>;
// }

"use client";

import { Provider } from "react-redux";
import { store } from "@/redux/store";
import { ReactNode } from "react"; // Explicitly import ReactNode

interface ReduxProviderProps {
  children: ReactNode;
}

export default function ReduxProvider({ children }: ReduxProviderProps) {
  return <Provider store={store}>{children}</Provider>;
}