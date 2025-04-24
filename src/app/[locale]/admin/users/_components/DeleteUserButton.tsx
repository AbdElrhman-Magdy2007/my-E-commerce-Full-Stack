"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { toast } from "@/hooks/use-toast";
import { deleteUser } from "@/app/[locale]/admin/users/_actions/user";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import Loader from "@/components/ui/loader";
import clsx from "clsx";
import { Languages } from "@/constants/enums";

function DeleteUserButton({ userId }: { userId: string }) {
  const { locale } = useParams();
  const isArabic = locale === Languages.ARABIC;
  const [state, setState] = useState<{
    pending: boolean;
    status: number | null;
    message: string;
  }>({
    pending: false,
    status: null,
    message: "",
  });

  const handleDelete = async (id: string) => {
    try {
      setState((prev) => ({ ...prev, pending: true }));
      const res = await deleteUser(id);
      setState({ pending: false, status: res.status, message: res.message });
    } catch (error) {
      console.error("Failed to delete user:", error);
      setState({
        pending: false,
        status: 500,
        message: "An unexpected error occurred while deleting the user.",
      });
    }
  };

  useEffect(() => {
    if (state.message && state.status && !state.pending) {
      const isSuccess = state.status === 200;
      toast({
        title: state.message,
        variant: isSuccess ? "default" : "destructive",
        style: {
          borderRadius: "0.5rem",
          padding: "0.75rem 1rem",
          border: "1px solid",
          boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
          fontSize: "0.875rem",
          fontWeight: "500",
          display: "flex",
          alignItems: "center",
          gap: "0.75rem",
          ...(isSuccess
            ? {
                backgroundColor: "#f0fdf4",
                color: "#15803d",
                borderColor: "#bbf7d0",
              }
            : {
                backgroundColor: "#fef2f2",
                color: "#b91c1c",
                borderColor: "#fecaca",
              }),
          ...(isSuccess
            ? {
                ".dark &": {
                  backgroundColor: "#14532d",
                  color: "#bbf7d0",
                  borderColor: "#15803d",
                },
              }
            : {
                ".dark &": {
                  backgroundColor: "#7f1d1d",
                  color: "#fecaca",
                  borderColor: "#b91c1c",
                },
              }),
        },
        dir: isArabic ? "rtl" : "ltr",
      });
    }
  }, [state.pending, state.message, state.status, isArabic]);

  return (
    <Button
    type="button"
    variant="outline"
    size="icon"
    disabled={state.pending}
    onClick={() => handleDelete(userId)}
    className={clsx(
      // Base styles
      "border-red-600 text-red-600 dark:border-red-500 dark:text-red-500",
      // Background
      "bg-black dark:bg-black",
      // Hover and active states
      "hover:bg-gray-900 hover:text-red-700 dark:hover:bg-gray-800 dark:hover:text-red-400",
      "active:bg-gray-800 dark:active:bg-gray-700",
      // Disabled state
      state.pending && "opacity-60 cursor-not-allowed",
      // Transitions and shadow
      "transition-all duration-300 ease-in-out shadow-sm hover:shadow-md",
      // Icon size
      "[&>svg]:h-4 [&>svg]:w-4"
    )}
    aria-label={state.pending ? "Deleting user..." : "Delete user"}
    title="Delete user"
  >
    {state.pending ? (
      <Loader className="h-5 w-5 animate-spin" />
    ) : (
      <Trash2 className="h-5 w-5" />
    )}
  </Button>
  );
}

export default DeleteUserButton;


// "use client";
 
//  import { Button } from "@/components/ui/button";
//  import { Trash2 } from "lucide-react";
//  import { useEffect, useState } from "react";
//  import { deleteUser } from "../_actions/user";
//  import { toast } from "@/hooks/use-toast";
 
//  function DeleteUserButton({ userId }: { userId: string }) {
//    const [state, setState] = useState<{
//      pending: boolean;
//      status: null | number;
//      message: string;
//    }>({
//      pending: false,
//      status: null,
//      message: "",
//    });
//    const handleDelete = async (id: string) => {
//      try {
//        setState((prev) => {
//          return { ...prev, pending: true };
//        });
//        const res = await deleteUser(id);
//        setState((prev) => {
//          return { ...prev, status: res.status, message: res.message };
//        });
//      } catch (error) {
//        console.log(error);
//      } finally {
//        setState((prev) => {
//          return { ...prev, pending: false };
//        });
//      }
//    };
 
//    useEffect(() => {
//      if (state.message && state.status && !state.pending) {
//        toast({
//          title: state.message,
//          className: state.status === 200 ? "text-green-400" : "text-destructive",
//        });
//      }
//    }, [state.pending, state.message, state.status]);
//    return (
//      <Button
//        type="button"
//        variant="outline"
//        disabled={state.pending}
//        onClick={() => handleDelete(userId)}
//      >
//        <Trash2 />
//      </Button>
//    );
//  }
 
//  export default DeleteUserButton;