
"use client";

import { Button, buttonVariants } from "@/components/ui/button";
import { Pages, Routes } from "@/constants/enums";
import useFormFields from "@/hooks/useFormFields";
import { IFormField } from "@/types/app";
import { Translations } from "@/types/translations";
import {
  ArrowLeft,
  CameraIcon,
  CheckCircleIcon,
  XCircleIcon,
} from "lucide-react";
import Image from "next/image";
import { useActionState, useEffect, useState, ChangeEvent } from "react";
import { Category, Extra, Size } from "@prisma/client";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import ItemOptions, { ItemOptionsKeys } from "./ItemOptions";
import Link from "@/components/link";
import { useParams } from "next/navigation";
import { addProduct, deleteProduct, updateProduct } from "../_actions/product";
import Loader from "@/components/ui/loader";
import { toast } from "sonner";
import { ProductWithRelations } from "@/types/product";
import { ValidationError } from "@/validations/auth";
import SelectCategory from "./SelectCategory";
import FormFields from "@/components/from-fields/from-fieds";
import clsx from "clsx";

/**
 * Form component for adding or editing a product.
 * @param translations - Localized translation strings.
 * @param categories - List of available categories.
 * @param product - Optional existing product data for editing.
 */
function Form({
  translations,
  categories,
  product,
}: {
  translations: Translations;
  categories: Category[];
  product?: ProductWithRelations;
}) {
  const [selectedImage, setSelectedImage] = useState<string | null>(
    product ? product.image : null
  );
  const [categoryId, setCategoryId] = useState<string>(
    product ? product.categoryId : categories[0]?.id || ""
  );
  const [sizes, setSizes] = useState<Partial<Size>[]>(
    product ? product.sizes : []
  );
  const [extras, setExtras] = useState<Partial<Extra>[]>(
    product ? product.extras : []
  );
  const { getFormFields } = useFormFields({
    slug: `${Routes.ADMIN}/${Pages.MENU_ITEMS}`,
    translations,
  });
  const { locale } = useParams();

  const [formValues, setFormValues] = useState<Record<string, string | number>>(() => {
    const initialValues: Record<string, string | number> = {};
    getFormFields().forEach((field) => {
      initialValues[field.name] =
        product?.[field.name as keyof ProductWithRelations]?.toString() || "";
    });
    initialValues.limit = product?.limit || 1;
    return initialValues;
  });

  const initialState: {
    message?: string;
    error?: ValidationError;
    status?: number | null;
    formData?: FormData | null;
  } = {
    message: "",
    error: {},
    status: null,
    formData: null,
  };

  const [state, action, pending] = useActionState(
    product
      ? updateProduct.bind(null, {
          productId: product.id,
          options: { sizes, extras },
        })
      : addProduct.bind(null, { categoryId, options: { sizes, extras } }),
    initialState
  );

  useEffect(() => {
    if ((state.status === 201 || state.status === 200) && !pending) {
      setSelectedImage(null);
      setCategoryId(categories[0]?.id || "");
      setSizes([]);
      setExtras([]);
      setFormValues(() => {
        const resetValues: Record<string, string | number> = {};
        getFormFields().forEach((field) => {
          resetValues[field.name] = "";
        });
        resetValues.limit = 1;
        return resetValues;
      });
    }
    if (state.message && state.status && !pending) {
      console.log("Server response:", {
        status: state.status,
        message: state.message,
        error: state.error,
      });
      const isSuccess = state.status === 201 || state.status === 200;
      toast[isSuccess ? "success" : "error"](state.message, {
        icon: isSuccess ? (
          <CheckCircleIcon className="w-5 h-5 text-green-400" />
        ) : (
          <XCircleIcon className="w-5 h-5 text-red-400" />
        ),
        style: {
          backgroundColor: isSuccess ? "#1A3C34" : "#4E1313",
          color: isSuccess ? "#6EE7B7" : "#FCA5A5",
          border: `1px solid ${isSuccess ? "#6EE7B7" : "#FCA5A5"}`,
          borderRadius: "10px",
          padding: "16px",
          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
          display: "flex",
          alignItems: "center",
          gap: "12px",
        },
        position: "top-right",
        duration: 3000,
      });
    }
  }, [state.status, state.message, pending, categories]);

  const handleSubmit = (formData: FormData) => {
    console.log("Form values before submission:", formValues);
    // Validate required fields
    const requiredFields = ["name", "description", "basePrice"];
    const missingFields = requiredFields.filter(
      (field) => !formValues[field] || formValues[field].toString().trim() === ""
    );
    if (missingFields.length > 0) {
      console.log("Missing required fields:", missingFields);
      toast.error(
        translations.messages?.missingFields ||
          `Please fill in: ${missingFields.join(", ")}`
      );
      return;
    }
    if (!product && !selectedImage) {
      const fileInput = document.querySelector<HTMLInputElement>("#image-upload");
      if (!fileInput?.files?.[0]) {
        console.log("No image selected for new product");
        toast.error(
          translations.admin?.menuItems?.imageValidation?.required ||
            "Please upload an image"
        );
        return;
      }
      formData.append("image", fileInput.files[0]);
    }
    // Ensure categoryId is included
    if (!categoryId) {
      console.log("No category selected");
      toast.error(
        translations.admin?.menuItems?.form?.category?.validation?.required ||
          "Please select a category"
      );
      return;
    }
    formData.append("categoryId", categoryId);
    Object.entries(formValues).forEach(([key, value]) => {
      if (value !== "" && value !== null && value !== undefined) {
        formData.append(key, value.toString());
      }
    });
    console.log("FormData contents:", Object.fromEntries(formData.entries()));
    action(formData);
  };

  const handleFieldChange =
    (name: string) => (e: ChangeEvent<HTMLInputElement>) => {
      let value: string | number = e.target.value;
      if (name === "limit") {
        value = parseInt(e.target.value) || 1;
      } else if (name === "basePrice") {
        const numValue = parseFloat(e.target.value);
        value = isNaN(numValue) ? "" : numValue.toFixed(2);
      }
      setFormValues((prev) => ({
        ...prev,
        [name]: value,
      }));
    };

  return (
    <form
      action={handleSubmit}
      className="relative flex flex-col md:flex-row gap-8 p-8 bg-black rounded-2xl shadow-lg border border-indigo-600 max-w-4xl mx-auto"
    >
      <div className="absolute top-4 right-4">
        <Link
          href={`/${locale}/${Routes.ADMIN}/${Pages.MENU_ITEMS}`}
          className="flex items-center gap-2 text-indigo-700 hover:text-indigo-500 transition-colors duration-200 group"
        >
          <span className="text-sm font-medium">
            {translations.admin?.tabs?.menuItems || "Back to Menu Items"}
          </span>
          <ArrowLeft className="w-6 h-6 group-hover:translate-x-1 transition-transform duration-200" />
        </Link>
      </div>

      <div className="flex-shrink-0 pt-10">
        <UploadImage
          className={clsx("bg-black border border-indigo-600 rounded-lg p-2")}
          selectedImage={selectedImage}
          setSelectedImage={setSelectedImage}
          translations={translations}
        />
        {state?.error?.image && (
          <p
            className={clsx(
              "text-sm text-indigo-700 font-medium text-center mt-3 flex items-center gap-1",
              "bg-indigo-900/30 border border-indigo-600 rounded-lg p-2"
            )}
            aria-live="polite"
          >
            <span className="text-indigo-700">⚠</span> {state.error.image}
          </p>
        )}
      </div>

      <div className="flex-1 space-y-6 pt-10">
        <div className="grid gap-4">
          {getFormFields().map((field: IFormField) => (
            <div key={field.name} className="space-y-1">
              <FormFields
                {...field}
                error={state?.error?.[field.name]}
                value={formValues[field.name]}
                defaultValue={formValues[field.name]}
                onChange={handleFieldChange(field.name)}
                className={clsx(
                  "w-full p-3 bg-black border border-indigo-600 rounded-lg",
                  "text-indigo-700 placeholder-indigo-700/50",
                  "focus:ring-2 focus:ring-indigo-300 focus:border-indigo-700",
                  "transition-all"
                )}
              />
              {state?.error?.[field.name] && (
                <p
                  className={clsx(
                    "text-sm text-indigo-700 font-medium text-center mt-1 flex items-center gap-1",
                    "bg-indigo-900/30 border border-indigo-600 rounded-lg p-2"
                  )}
                  aria-live="polite"
                >
                  <span className="text-indigo-700">⚠</span>{" "}
                  {state.error[field.name]}
                </p>
              )}
            </div>
          ))}
        </div>
        <div className="space-y-4">
          <div className="space-y-1">
            <label
              htmlFor="limit"
              className="text-indigo-600 text-base font-medium"
            >
              {translations.limit || "Limit"}
            </label>
            <input
              id="limit"
              type="number"
              name="limit"
              value={formValues.limit}
              onChange={handleFieldChange("limit")}
              placeholder="Enter limit"
              aria-label="Limit"
              min="1"
              className={clsx(
                "w-full p-3 bg-black border border-indigo-600 rounded-lg",
                "text-indigo-700 placeholder-indigo-700/50",
                "focus:ring-2 focus:ring-indigo-300 focus:border-indigo-700",
                "transition-all"
              )}
            />
            {state?.error?.limit && (
              <p
                className={clsx(
                  "text-sm text-indigo-700 font-medium text-center mt-1 flex items-center gap-1",
                  "bg-indigo-900/30 border border-indigo-600 rounded-lg p-2"
                )}
                aria-live="polite"
              >
                <span className="text-indigo-700">⚠</span> {state.error.limit}
              </p>
            )}
          </div>
        </div>

        <SelectCategory
          categoryId={categoryId}
          categories={categories}
          setCategoryId={setCategoryId}
          translations={translations}
          className={clsx(
            "w-full p-3 bg-black border border-indigo-600 rounded-lg",
            "text-indigo-700",
            "focus:ring-2 focus:ring-indigo-300 focus:border-indigo-700"
          )}
        />
        {state?.error?.categoryId && (
          <p
            className={clsx(
              "text-sm text-indigo-700 font-medium text-center mt-1 flex items-center gap-1",
              "bg-indigo-900/30 border border-indigo-600 rounded-lg p-2"
            )}
            aria-live="polite"
          >
            <span className="text-indigo-700">⚠</span> {state.error.categoryId}
          </p>
        )}

        <AddSize
          translations={translations}
          sizes={sizes}
          setSizes={setSizes}
        />

        <AddExtras
          extras={extras}
          setExtras={setExtras}
          translations={translations}
        />

        <FormActions
          translations={translations}
          pending={pending}
          product={product}
        />
      </div>
    </form>
  );
}

/**
 * Component for uploading and displaying a product image.
 */
const UploadImage = ({
  selectedImage,
  setSelectedImage,
  translations,
  className,
}: {
  selectedImage: string | null;
  setSelectedImage: React.Dispatch<React.SetStateAction<string | null>>;
  translations: Translations;
  className?: string;
}) => {
  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedImage(URL.createObjectURL(file));
    }
  };

  return (
    <div
      className={clsx(
        "group relative w-48 h-48 overflow-hidden rounded-full border-2 border-indigo-600 shadow-sm hover:shadow-md transition-all",
        className
      )}
    >
      {selectedImage ? (
        <Image
          src={selectedImage}
          alt={
            translations.admin?.["menu-items"]?.form?.image?.validation ||
            "Product Image"
          }
          width={192}
          height={192}
          className="rounded-full object-cover"
        />
      ) : (
        <div className="w-full h-full bg-indigo-600 rounded-full flex items-center justify-center">
          <CameraIcon className="w-10 h-10 text-indigo-700" />
        </div>
      )}
      <div
        className={clsx(
          "absolute inset-0 bg-indigo-600/30 flex items-center justify-center transition-opacity duration-300",
          selectedImage ? "group-hover:opacity-100 opacity-0" : "opacity-100"
        )}
      >
        <input
          type="file"
          accept="image/*"
          className="hidden"
          id="image-upload"
          onChange={handleImageChange}
          name="image"
        />
        <label
          htmlFor="image-upload"
          className="w-full h-full flex items-center justify-center cursor-pointer"
        >
          <CameraIcon className="w-8 h-8 text-indigo-700 drop-shadow-md" />
        </label>
      </div>
    </div>
  );
};

/**
 * Component for form actions (submit, delete, cancel).
 */
const FormActions = ({
  translations,
  pending,
  product,
}: {
  translations: Translations;
  pending: boolean;
  product?: ProductWithRelations;
}) => {
  const { locale } = useParams();
  const [state, setState] = useState<{
    pending: boolean;
    status: null | number;
    message: string;
  }>({
    pending: false,
    status: null,
    message: "",
  });

  const handleDelete = async (id: string) => {
    try {
      setState((prev) => ({ ...prev, pending: true }));
      const res = await deleteProduct(id);
      setState((prev) => ({
        ...prev,
        status: res.status,
        message: res.message,
      }));
    } catch (error) {
      console.error("Delete error:", error);
      setState((prev) => ({
        ...prev,
        status: 500,
        message:
          translations.messages?.unexpectedError ||
          "An unexpected error occurred",
      }));
    } finally {
      setState((prev) => ({ ...prev, pending: false }));
    }
  };

  useEffect(() => {
    if (state.message && state.status && !state.pending) {
      const isSuccess = state.status === 200;
      toast[isSuccess ? "success" : "error"](state.message, {
        icon: isSuccess ? (
          <CheckCircleIcon className="w-5 h-5 text-green-400" />
        ) : (
          <XCircleIcon className="w-5 h-5 text-red-400" />
        ),
        style: {
          backgroundColor: isSuccess ? "#1A3C34" : "#4E1313",
          color: isSuccess ? "#6EE7B7" : "#FCA5A5",
          border: `1px solid ${isSuccess ? "#6EE7B7" : "#FCA5A5"}`,
          borderRadius: "10px",
          padding: "16px",
          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
          display: "flex",
          alignItems: "verify",
          gap: "12px",
        },
        position: "top-right",
        duration: 3000,
      });
    }
  }, [state.message, state.status, state.pending, translations]);

  return (
    <div className="flex flex-col gap-4 mt-6">
      <div className={`grid ${product ? "grid-cols-2" : "grid-cols-1"} gap-4`}>
        <Button
          type="submit"
          disabled={pending}
          className={clsx(
            "bg-indigo-600 text-indigo-100 font-semibold py-3 rounded-lg",
            "hover:bg-indigo-700 border border-indigo-600",
            "focus:ring-2 focus:ring-indigo-300",
            "shadow-md transition-all flex items-center justify-center gap-2",
            pending && "opacity-50 cursor-not-allowed"
          )}
        >
          {pending ? (
            <Loader className="w-5 h-5 text-indigo-100" />
          ) : product ? (
            translations.save || "Save"
          ) : (
            translations.create || "Create"
          )}
        </Button>
        {product && (
          <Button
            variant="outline"
            disabled={state.pending}
            onClick={() => handleDelete(product.id)}
            className={clsx(
              "border-indigo-600 text-indigo-700 font-semibold py-3 rounded-lg",
              "hover:bg-indigo-600 hover:text-indigo-100",
              "focus:ring-2 focus:ring-indigo-300",
              "shadow-md transition-all flex items-center justify-center gap-2",
              state.pending && "opacity-50 cursor-not-allowed"
            )}
          >
            {state.pending ? (
              <Loader className="w-5 h-5 text-indigo-700" />
            ) : (
              translations.delete || "Delete"
            )}
          </Button>
        )}
      </div>
      <Link
        href={`/${locale}/${Routes.ADMIN}/${Pages.MENU_ITEMS}`}
        className={buttonVariants({
          variant: "outline",
          className: clsx(
            "w-full text-center font-semibold border border-indigo-600",
            "py-3 rounded-lg text-indigo-700",
            "hover:bg-indigo-600 hover:text-indigo-100",
            "focus:ring-2 focus:ring-indigo-300",
            "shadow-sm transition-all"
          ),
        })}
      >
        {translations.cancel || "Cancel"}
      </Link>
    </div>
  );
};

/**
 * Component for adding size options to a product.
 */
const AddSize = ({
  sizes,
  setSizes,
  translations,
}: {
  sizes: Partial<Size>[];
  setSizes: React.Dispatch<React.SetStateAction<Partial<Size>[]>>;
  translations: Translations;
}) => {
  return (
    <Accordion
      type="single"
      collapsible
      className="bg-black border border-indigo-600 rounded-lg shadow-sm"
    >
      <AccordionItem value="item-1" className="border-none">
        <AccordionTrigger
          className={clsx(
            "text-indigo-700 text-2xl font-semibold px-4 py-3",
            "hover:bg-indigo-600 hover:text-indigo-100",
            "focus:ring-2 focus:ring-indigo-300",
            "transition-colors"
          )}
        >
          {translations.sizes || "Sizes"}
        </AccordionTrigger>
        <AccordionContent className="px-4 py-3 text-indigo-700">
          <ItemOptions
            optionKey={ItemOptionsKeys.SIZES}
            state={sizes}
            setState={setSizes}
            translations={translations}
            className="bg-black text-indigo-700 border-indigo-600"
          />
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};

/**
 * Component for adding extra ingredients or add-ons to a product.
 */
const AddExtras = ({
  extras,
  setExtras,
  translations,
}: {
  extras: Partial<Extra>[];
  setExtras: React.Dispatch<React.SetStateAction<Partial<Extra>[]>>;
  translations: Translations;
}) => {
  return (
    <Accordion
      type="single"
      collapsible
      className="bg-black border border-indigo-600 rounded-lg shadow-sm"
    >
      <AccordionItem value="item-1" className="border-none">
        <AccordionTrigger
          className={clsx(
            "text-indigo-700 text-2xl font-semibold px-4 py-3",
            "hover:bg-indigo-600 hover:text-indigo-100",
            "focus:ring-2 focus:ring-indigo-300",
            "transition-colors"
          )}
        >
          {typeof translations.extrasIngredients === "object" &&
          "title" in translations.extrasIngredients
            ? (translations.extrasIngredients as { title: string }).title
            : "Extras & Ingredients"}
        </AccordionTrigger>
        <AccordionContent className="px-4 py-3 text-indigo-700">
          <ItemOptions
            state={extras}
            optionKey={ItemOptionsKeys.EXTRAS}
            setState={setExtras}
            translations={translations}
            className="bg-black text-indigo-700 border-indigo-600"
          />
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};

export default Form;
export { UploadImage, FormActions, AddSize, AddExtras };
