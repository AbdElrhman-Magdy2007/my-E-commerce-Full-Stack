"use client";

import { useCallback, useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { Category } from "@prisma/client";
import { Languages, Directions } from "@/constants/enums";
import { Translations } from "@/types/translations";
import { updateCategory } from "../_actions/category";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/Label";
import { EditIcon, X } from "lucide-react";
import Loader from "@/components/ui/loader";
import clsx from "clsx";

// Constants for image validation
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/gif"];

// Form state type
interface FormState {
  message?: string;
  error?: Record<string, string>;
  status?: number | null;
}

// Initial form state
const initialState: FormState = {
  message: "",
  error: {},
  status: null,
};

// EditCategory component
function EditCategory({
  translations,
  category,
}: {
  translations: Translations;
  category: Category;
}) {
  const { locale } = useParams();
  const [state, setState] = useState<FormState>(initialState);
  const [isPending, setIsPending] = useState(false);
  const [open, setOpen] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(category.image || null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const isArabic = locale === Languages.ARABIC;
  const imageInputRef = useRef<HTMLInputElement>(null);

  // Cleanup image preview URL to prevent memory leaks
  useEffect(() => {
    return () => {
      if (imagePreview && imagePreview.startsWith("blob:")) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  // Handle toast notifications and dialog state
  useEffect(() => {
    if (!state.message || !state.status) return;

    toast.dismiss("category-update-loading");
    toast(state.message, {
      style: {
        borderRadius: "0.5rem",
        padding: "0.75rem 1rem",
        border: "1px solid",
        fontSize: "0.875rem",
        fontWeight: "500",
        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
        ...(state.status === 200
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
        ...(state.status === 200
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
      duration: 3000,
      position: "top-right",
    });

    if (state.status === 200) {
      setOpen(false);
      setImageFile(null);
      setImagePreview(category.image || null);
      setState(initialState);
      if (imageInputRef.current) {
        imageInputRef.current.value = "";
      }
    }
  }, [state.message, state.status, category.image]);

  // Handle image change with validation
  const handleImageChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) {
        setImageFile(null);
        setImagePreview(category.image || null);
        return;
      }

      // Validate image type
      if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
        toast.error(
          translations.admin?.categories?.form?.image?.invalidType ||
            "Please upload a valid image (JPEG, PNG, or GIF)",
          {
            style: {
              borderRadius: "0.5rem",
              padding: "0.75rem 1rem",
              backgroundColor: "#fef2f2",
              color: "#b91c1c",
              border: "1px solid #fecaca",
              boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
            },
            duration: 3000,
          }
        );
        return;
      }

      // Validate image size
      if (file.size > MAX_IMAGE_SIZE) {
        toast.error(
          translations.admin?.categories?.form?.image?.size ||
            "Image size exceeds 5MB limit",
          {
            style: {
              borderRadius: "0.5rem",
              padding: "0.75rem 1rem",
              backgroundColor: "#fef2f2",
              color: "#b91c1c",
              border: "1px solid #fecaca",
              boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
            },
            duration: 3000,
          }
        );
        return;
      }

      // Update preview and file state
      setImageFile(file);
      if (imagePreview && imagePreview.startsWith("blob:")) {
        URL.revokeObjectURL(imagePreview);
      }
      setImagePreview(URL.createObjectURL(file));
    },
    [translations, category.image, imagePreview]
  );

  // Handle image removal
  const handleRemoveImage = useCallback(() => {
    setImageFile(null);
    setImagePreview(null);
    if (imageInputRef.current) {
      imageInputRef.current.value = "";
    }
  }, []);

  // Handle form submission
  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setIsPending(true);

      const formData = new FormData(e.currentTarget);
      if (imageFile) {
        formData.set("image", imageFile);
      } else if (!imagePreview) {
        formData.set("image", ""); // Indicate image removal
      }

      try {
        // Show loading toast
        toast.loading(translations.saving || "Saving...", {
          id: "category-update-loading",
          style: {
            borderRadius: "0.5rem",
            padding: "0.75rem 1rem",
            backgroundColor: "#f3f4f6",
            color: "#374151",
            border: "1px solid #e5e7eb",
            fontSize: "0.875rem",
            fontWeight: "500",
            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
            ".dark &": {
              backgroundColor: "#1f2937",
              color: "#d1d5db",
              borderColor: "#374151",
            },
          },
          duration: Infinity,
        });

        // Submit form data
        const result = await updateCategory(category.id, initialState, formData);
        setState(result);
        setIsPending(false);
      } catch (error) {
        setIsPending(false);
        toast.dismiss("category-update-loading");
        toast.error(
          translations.messages?.unexpectedError || "An unexpected error occurred",
          {
            style: {
              borderRadius: "0.5rem",
              padding: "0.75rem 1rem",
              backgroundColor: "#fef2f2",
              color: "#b91c1c",
              border: "1px solid #fecaca",
              boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
            },
            duration: 3000,
          }
        );
      }
    },
    [translations, category.id, imageFile, imagePreview]
  );

  // Reset form when dialog opens
  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (isOpen) {
      setState(initialState);
      setImageFile(null);
      setImagePreview(category.image || null);
      if (imageInputRef.current) {
        imageInputRef.current.value = "";
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          aria-label={translations.admin?.categories?.form?.editName || "Edit category"}
          className={clsx(
            "border-indigo-600 text-indigo-600 dark:border-indigo-800 dark:text-indigo-400",
            "hover:bg-indigo-900 hover:text-indigo-100 dark:hover:bg-indigo-900/50 dark:hover:text-indigo-200",
            "transition-all duration-300 ease-in-out transform hover:scale-105",
            "shadow-sm hover:shadow-md"
          )}
        >
          <EditIcon className="h-4 w-4" />
        </Button>
      </DialogTrigger>

      <DialogContent
        className={clsx(
          "bg-black dark:bg-gray-900 rounded-xl shadow-2xl p-6 max-w-lg mx-auto",
          isArabic ? "text-right" : "text-left",
          "animate-in fade-in-50 duration-300"
        )}
        dir={isArabic ? Directions.RTL : Directions.LTR}
      >
        <DialogHeader>
          <DialogTitle
            className={clsx(
              "text-xl font-bold text-indigo-100 dark:text-indigo-200",
              isArabic ? "text-right" : "text-left",
              "relative after:content-[''] after:absolute after:bottom-0 after:left-0 after:h-1 after:w-12 after:bg-indigo-600 after:rounded"
            )}
          >
            {translations.admin?.categories?.form?.editName || "Edit Category"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 pt-6">
          {/* Category Name Field */}
          <div
            className={clsx(
              "flex flex-col gap-4",
              isArabic ? "sm:flex-row-reverse" : "sm:flex-row",
              isArabic ? "text-right" : "text-left"
            )}
          >
            <Label
              htmlFor="categoryName"
              className={clsx(
                "text-sm font-medium text-indigo-100 dark:text-gray-200",
                "w-full sm:w-1/3 flex items-center"
              )}
            >
              {translations.admin?.categories?.form?.name?.label || "Name"}
            </Label>
            <div className="w-full sm:flex-1 space-y-2">
              <Input
                type="text"
                id="categoryName"
                name="categoryName"
                defaultValue={category.name}
                placeholder={
                  translations.admin?.categories?.form?.name?.placeholder ||
                  "Enter category name"
                }
                disabled={isPending}
                className={clsx(
                  "w-full rounded-lg border-indigo-600 dark:border-gray-600",
                  "bg-black/50 dark:bg-gray-800/50 text-indigo-100 dark:text-gray-100",
                  "focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500",
                  "transition-all duration-300 ease-in-out",
                  "hover:border-indigo-700",
                  "disabled:opacity-50 disabled:cursor-not-allowed",
                  state.error?.categoryName && "border-red-500 animate-shake"
                )}
                aria-describedby={state.error?.categoryName ? "categoryName-error" : undefined}
              />
              {state.error?.categoryName && (
                <p
                  id="categoryName-error"
                  className="text-sm text-red-500 dark:text-red-400 flex items-center gap-1 animate-fade-in"
                  aria-live="polite"
                >
                  <span className="text-red-500">⚠</span> {state.error.categoryName}
                </p>
              )}
            </div>
          </div>

          {/* Image Field */}
          <div
            className={clsx(
              "flex flex-col gap-4",
              isArabic ? "sm:flex-row-reverse" : "sm:flex-row",
              isArabic ? "text-right" : "text-left"
            )}
          >
            <Label
              htmlFor="image"
              className={clsx(
                "text-sm font-medium text-indigo-100 dark:text-gray-200",
                "w-full sm:w-1/3 flex items-center"
              )}
            >
              {translations.admin?.categories?.form?.image?.label || "Image"}
            </Label>
            <div className="w-full sm:flex-1 space-y-2">
              {imagePreview && (
                <div className="relative w-40 h-40 group">
                  <img
                    src={imagePreview}
                    alt={translations.admin?.categories?.form?.image?.preview || "Image preview"}
                    className="w-full h-full object-cover rounded-lg border-2 border-indigo-600 shadow-md transition-transform duration-300 group-hover:scale-105"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    onClick={handleRemoveImage}
                    className={clsx(
                      "absolute top-2 right-2 bg-red-600 text-white rounded-full",
                      "opacity-0 group-hover:opacity-100 transition-opacity duration-300",
                      "hover:bg-red-700"
                    )}
                    aria-label={translations.removeImage || "Remove image"}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
              <Input
                type="file"
                id="image"
                name="image"
                accept="image/jpeg,image/png,image/gif"
                onChange={handleImageChange}
                disabled={isPending}
                ref={imageInputRef}
                className={clsx(
                  "w-full rounded-lg border-indigo-600 dark:border-gray-600",
                  "bg-black/50 dark:bg-gray-800/50 text-indigo-100 dark:text-gray-100",
                  "focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500",
                  "transition-all duration-300 ease-in-out",
                  "hover:border-indigo-700",
                  "disabled:opacity-50 disabled:cursor-not-allowed",
                  state.error?.image && "border-red-500 animate-shake"
                )}
                aria-describedby={state.error?.image ? "image-error" : undefined}
              />
              {state.error?.image && (
                <p
                  id="image-error"
                  className="text-sm text-red-500 dark:text-red-400 flex items-center gap-1 animate-fade-in"
                  aria-live="polite"
                >
                  <span className="text-red-500">⚠</span> {state.error.image}
                </p>
              )}
            </div>
          </div>

          {/* Form Actions */}
          <DialogFooter
            className={clsx(
              "flex flex-col sm:flex-row sm:gap-3",
              isArabic ? "sm:flex-row-reverse" : "sm:flex-row",
              "mt-6"
            )}
          >
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isPending}
              className={clsx(
                "w-full sm:w-auto border-indigo-600 text-indigo-100 dark:border-gray-600 dark:text-gray-200",
                "hover:bg-indigo-900 dark:hover:bg-gray-700",
                "transition-all duration-300 ease-in-out transform hover:scale-105",
                "shadow-sm hover:shadow-md"
              )}
            >
              {translations.cancel || "Cancel"}
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              className={clsx(
                "w-full sm:w-auto bg-indigo-600 text-indigo-100 dark:bg-indigo-700 dark:text-indigo-200",
                "hover:bg-indigo-700 dark:hover:bg-indigo-800",
                "focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2",
                "transition-all duration-300 ease-in-out transform hover:scale-105",
                "shadow-md hover:shadow-lg",
                isPending && "opacity-60 cursor-not-allowed",
                isPending && "flex items-center gap-2"
              )}
              aria-label={
                isPending
                  ? translations.saving || "Saving..."
                  : translations.save || "Save and close"
              }
            >
              {isPending ? (
                <>
                  <Loader className="h-4 w-4 animate-spin" />
                  {translations.saving || "Saving..."}
                </>
              ) : (
                translations.save || "Save"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default EditCategory;