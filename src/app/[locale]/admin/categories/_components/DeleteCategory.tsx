"use client";

import { useCallback, useState, useTransition } from "react";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { deleteCategory } from "../_actions/category";
import Loader from "@/components/ui/loader";
import clsx from "clsx";
import { Translations } from "@/types/translations";

// Define action response type
interface ActionResponse {
  status: number;
  message?: string;
  error?: Record<string, string>;
}

/**
 * Component for deleting a category with confirmation and image cleanup
 * @param id - The ID of the category to delete
 * @param translations - Translation strings for internationalization (optional)
 */
function DeleteCategory({ id, translations = {} }: { id: string; translations?: Partial<Translations> }) {
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);

  // Fallback translations
  const defaultTranslations = {
    deleteCategory: "Delete category",
    confirmDelete: "Are you sure?",
    deleteCategoryWarning: "This action cannot be undone. The category and its associated image will be permanently deleted.",
    deleting: "Deleting...",
    delete: "Delete",
    cancel: "Cancel",
    messages: {
      deleteCategorySuccess: "Category deleted successfully",
      unexpectedError: "An unexpected error occurred",
    },
  };

  // Merge provided translations with defaults
  const safeTranslations = {
    ...defaultTranslations,
    ...translations,
    messages: {
      ...defaultTranslations.messages,
      ...(translations.messages || {}),
    },
  };

  // Toast styling configurations
  const toastStyles = {
    success: {
      style: {
        backgroundColor: "#f0fdf4",
        color: "#15803d",
        border: "1px solid #bbf7d0",
        borderRadius: "8px",
        padding: "12px",
        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
        fontSize: "0.875rem",
        fontWeight: "500",
      },
      duration: 3000,
    },
    error: {
      style: {
        backgroundColor: "#fef2f2",
        color: "#b91c1c",
        border: "1px solid #fecaca",
        borderRadius: "8px",
        padding: "12px",
        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
        fontSize: "0.875rem",
        fontWeight: "500",
      },
      duration: 3000,
    },
    loading: {
      id: "category-delete-loading",
      style: {
        backgroundColor: "#f3f4f6",
        color: "#374151",
        border: "1px solid #e5e7eb",
        borderRadius: "8px",
        padding: "12px",
        fontSize: "0.875rem",
        fontWeight: "500",
      },
      duration: Infinity,
    },
  };

  // Handle category deletion
  const handleDelete = useCallback(() => {
    toast.loading(safeTranslations.deleting, toastStyles.loading);

    startTransition(async () => {
      try {
        const res: ActionResponse = await deleteCategory(id);
        toast.dismiss(toastStyles.loading.id);
        toast(res.message || safeTranslations.messages.deleteCategorySuccess, {
          ...(res.status === 200 ? toastStyles.success : toastStyles.error),
        });
        if (res.status === 200) {
          setOpen(false);
        }
      } catch (error) {
        toast.dismiss(toastStyles.loading.id);
        toast(safeTranslations.messages.unexpectedError, toastStyles.error);
        console.error("Error deleting category:", error);
      }
    });
  }, [id, safeTranslations, toastStyles]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          disabled={isPending}
          className={clsx(
            "border-red-600 text-red-600 dark:border-red-700 dark:text-red-500",
            "bg-black dark:bg-gray-900",
            "hover:bg-red-600 hover:text-white dark:hover:bg-red-700 dark:hover:text-white",
            "active:bg-red-700 dark:active:bg-red-800",
            isPending && "opacity-60 cursor-not-allowed",
            "transition-all duration-300 ease-in-out",
            "shadow-sm hover:shadow-md",
            "[&>svg]:h-4 [&>svg]:w-4"
          )}
          aria-label={safeTranslations.deleteCategory}
        >
          {isPending ? (
            <Loader className="h-4 w-4 animate-spin text-red-600 dark:text-red-500" />
          ) : (
            <Trash2 className="h-4 w-4" />
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-black dark:bg-gray-900 rounded-lg">
        <DialogHeader>
          <DialogTitle className="text-indigo-100 dark:text-indigo-200">
            {safeTranslations.confirmDelete}
          </DialogTitle>
          <p className="text-indigo-300 dark:text-indigo-400">
            {safeTranslations.deleteCategoryWarning}
          </p>
        </DialogHeader>
        <DialogFooter className="flex flex-row gap-2 justify-end">
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={isPending}
            className={clsx(
              "border-indigo-600 text-indigo-100 dark:border-gray-600 dark:text-gray-200",
              "hover:bg-indigo-900 dark:hover:bg-gray-700"
            )}
            aria-label={safeTranslations.cancel}
          >
            {safeTranslations.cancel}
          </Button>
          <Button
            onClick={handleDelete}
            className={clsx(
              "bg-red-600 text-white dark:bg-red-700 dark:text-white",
              "hover:bg-red-700 dark:hover:bg-red-800",
              isPending && "opacity-60 cursor-not-allowed",
              isPending && "flex items-center gap-2"
            )}
            disabled={isPending}
            aria-label={safeTranslations.delete}
          >
            {isPending ? (
              <>
                <Loader className="h-4 w-4 animate-spin" />
                {safeTranslations.deleting}
              </>
            ) : (
              safeTranslations.delete
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default DeleteCategory;