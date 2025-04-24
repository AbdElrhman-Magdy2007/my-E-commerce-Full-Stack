
// "use client";

// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/Label";
// import Loader from "@/components/ui/loader";
// import { toast } from "@/hooks/use-toast";
// import { Translations } from "@/types/translations";
// import { useActionState, useEffect, useState, ChangeEvent } from "react";
// import { addCategory } from "../_actions/category";
// import clsx from "clsx";
// import { CameraIcon } from "lucide-react";
// import Image from "next/image";

// // أنواع الأخطاء من الـ schema
// type ValidationError = {
//   categoryName?: string;
//   image?: string;
// };

// // نوع حالة الـ form
// type FormState = {
//   message?: string;
//   error?: ValidationError;
//   status?: number | null;
// };

// // الحالة الابتدائية
// const initialState: FormState = {
//   message: "",
//   error: {},
//   status: null,
// };

// // المكون الرئيسي للفورم
// function Form({ translations }: { translations: Translations }) {
//   const [state, formAction, isPending] = useActionState(addCategory, initialState);
//   const [categoryName, setCategoryName] = useState("");
//   const [selectedImage, setSelectedImage] = useState<string | null>(null);
//   const [imageFile, setImageFile] = useState<File | null>(null);
//   const [imageError, setImageError] = useState<string | null>(null);

//   // التعامل مع استجابة الفورم
//   useEffect(() => {
//     if (!state.status) return;

//     toast({
//       title: state.message || translations.messages.unexpectedError || "An error occurred",
//       variant: state.status >= 400 ? "destructive" : "default",
//       className: clsx(
//         state.status >= 400
//           ? "bg-red-900 text-red-400 border-red-600"
//           : "bg-green-900 text-green-400 border-green-600",
//         "rounded-lg p-3"
//       ),
//       duration: 3000,
//     });

//     if (state.status === 201) {
//       setCategoryName("");
//       setSelectedImage(null);
//       setImageFile(null);
//       setImageError(null);
//     }
//   }, [state.status, state.message, state.error, isPending, translations]);

//   // التعامل مع إرسال الفورم
//   const handleSubmit = (formData: FormData) => {
//     if (!categoryName.trim()) {
//       toast({
//         title:
//           translations.admin?.categories?.form?.name?.validation?.required ||
//           "Category name is required",
//         variant: "destructive",
//         className: "bg-red-900 text-red-400 border-red-600 rounded-lg p-3",
//         duration: 3000,
//       });
//       return;
//     }

//     if (!imageFile) {
//       setImageError(
//         translations.admin?.categories?.form?.image?.validation?.required ||
//           "Image is required"
//       );
//       toast({
//         title:
//           translations.admin?.categories?.form?.image?.validation?.required ||
//           "Image is required",
//         variant: "destructive",
//         className: "bg-red-900 text-red-400 border-red-600 rounded-lg p-3",
//         duration: 3000,
//       });
//       return;
//     }

//     // Log category data to console
//     console.log("Submitting Category Data:", {
//       categoryName,
//       image: {
//         name: imageFile.name,
//         size: `${(imageFile.size / 1024).toFixed(2)} KB`,
//         type: imageFile.type,
//       },
//     });

//     formData.append("categoryName", categoryName);
//     formData.append("image", imageFile);
//     formAction(formData);
//   };

//   // التعامل مع تغيير اسم الفئة
//   const handleNameChange = (e: ChangeEvent<HTMLInputElement>) => {
//     setCategoryName(e.target.value);
//   };

//   return (
//     <form
//       action={handleSubmit}
//       aria-labelledby="form-title"
//       className="bg-black p-8 rounded-2xl shadow-lg border border-indigo-600 max-w-md mx-auto"
//     >
//       <h2 id="form-title" className="sr-only">
//         {translations.admin?.categories?.form?.title || "Add New Category"}
//       </h2>
//       <div className="space-y-6">
//         {/* معاينة ورفع الصورة */}
//         <div className="flex flex-col items-center">
//           <UploadImage
//             selectedImage={selectedImage}
//             setSelectedImage={setSelectedImage}
//             setImageFile={setImageFile}
//             translations={translations}
//             disabled={isPending}
//             setImageError={setImageError}
//           />
//           {(state.error?.image || imageError) && (
//             <p
//               className="mt-2 text-sm text-indigo-700 flex items-center gap-1 bg-indigo-900/30 border border-indigo-600 rounded-lg p-2"
//               aria-live="polite"
//             >
//               <span className="text-indigo-700">⚠</span> {state.error?.image || imageError}
//             </p>
//           )}
//         </div>

//         {/* حقل اسم الفئة */}
//         <div className="space-y-2">
//           <Label htmlFor="categoryName" className="text-indigo-100">
//             {translations.admin?.categories?.form?.name?.label || "Category Name"}
//           </Label>
//           <Input
//             id="categoryName"
//             type="text"
//             value={categoryName}
//             onChange={handleNameChange}
//             placeholder={
//               translations.admin?.categories?.form?.name?.placeholder ||
//               "Enter category name"
//             }
//             disabled={isPending}
//             className={clsx(
//               "bg-black border-indigo-600 text-indigo-100 placeholder-indigo-700/50",
//               "focus:ring-2 focus:ring-indigo-400 focus:border-indigo-500",
//               isPending && "opacity-50 cursor-not-allowed"
//             )}
//             aria-describedby={state.error?.categoryName ? "categoryName-error" : undefined}
//             aria-label={translations.admin?.categories?.form?.name?.label || "Category Name"}
//           />
//           {state.error?.categoryName && (
//             <p
//               id="categoryName-error"
//               className="text-sm text-indigo-700 flex items-center gap-1"
//               aria-live="polite"
//             >
//               <span className="text-indigo-700">⚠</span> {state.error.categoryName}
//             </p>
//           )}
//         </div>

//         {/* زر الإرسال */}
//         <Button
//           type="submit"
//           size="lg"
//           disabled={isPending}
//           className={clsx(
//             "w-full bg-indigo-600 hover:bg-indigo-700 text-indigo-100",
//             "focus:ring-2 focus:ring-indigo-400",
//             isPending && "opacity-50 cursor-not-allowed"
//           )}
//           aria-label={
//             isPending
//               ? translations.submitting || "Submitting..."
//               : translations.create || "Create Category"
//           }
//         >
//           {isPending ? (
//             <Loader className="w-6 h-6 text-indigo-100 animate-spin" />
//           ) : (
//             translations.create || "Create"
//           )}
//         </Button>
//       </div>
//     </form>
//   );
// }

// // مكون رفع الصورة
// const UploadImage = ({
//   selectedImage,
//   setSelectedImage,
//   setImageFile,
//   translations,
//   disabled,
//   setImageError,
// }: {
//   selectedImage: string | null;
//   setSelectedImage: React.Dispatch<React.SetStateAction<string | null>>;
//   setImageFile: React.Dispatch<React.SetStateAction<File | null>>;
//   translations: Translations;
//   disabled?: boolean;
//   setImageError: React.Dispatch<React.SetStateAction<string | null>>;
// }) => {
//   const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0];
//     if (!file) {
//       setImageError(
//         translations.admin?.categories?.form?.image?.validation?.required ||
//           "Image is required"
//       );
//       return;
//     }

//     // التحقق من نوع الصورة
//     if (!file.type.startsWith("image/")) {
//       setImageError(
//         translations.admin?.categories?.form?.image?.invalidType ||
//           "Please upload a valid image file"
//       );
//       toast({
//         title:
//           translations.admin?.categories?.form?.image?.invalidType ||
//           "Please upload a valid image file",
//         variant: "destructive",
//         className: "bg-red-900 text-red-400 border-red-600 rounded-lg p-3",
//         duration: 3000,
//       });
//       return;
//     }

//     // التحقق من حجم الصورة (5MB)
//     if (file.size > 5 * 1024 * 1024) {
//       setImageError(
//         translations.admin?.categories?.form?.image?.size ||
//           "Image size exceeds 5MB limit"
//       );
//       toast({
//         title:
//           translations.admin?.categories?.form?.image?.size ||
//           "Image size exceeds 5MB limit",
//         variant: "destructive",
//         className: "bg-red-900 text-red-400 border-red-600 rounded-lg p-3",
//         duration: 3000,
//       });
//       return;
//     }

//     setImageError(null);
//     setImageFile(file);
//     setSelectedImage(URL.createObjectURL(file));
//   };

//   return (
//     <div
//       className={clsx(
//         "group relative w-32 h-32 overflow-hidden rounded-full border-2 border-indigo-600 shadow-sm",
//         "hover:shadow-md transition-all",
//         disabled && "opacity-50 pointer-events-none"
//       )}
//     >
//       {selectedImage ? (
//         <Image
//           src={selectedImage}
//           alt={
//             translations.admin?.categories?.form?.image?.validation ||
//             "Category Image Preview"
//           }
//           width={128}
//           height={128}
//           className="rounded-full object-cover"
//         />
//       ) : (
//         <div className="w-full h-full bg-indigo-600 rounded-full flex items-center justify-center">
//           <CameraIcon className="w-8 h-8 text-indigo-100" />
//         </div>
//       )}
//       <div
//         className={clsx(
//           "absolute inset-0 bg-indigo-600/50 flex items-center justify-center transition-opacity duration-300",
//           selectedImage ? "group-hover:opacity-100 opacity-0" : "opacity-100"
//         )}
//       >
//         <input
//           type="file"
//           accept="image/*"
//           id="image-upload"
//           className="hidden"
//           onChange={handleImageChange}
//           disabled={disabled}
//         />
//         <label
//           htmlFor="image-upload"
//           className="w-full h-full flex items-center justify-center cursor-pointer"
//           aria-label={
//             translations.admin?.categories?.form?.image?.label ||
//             "Upload category image"
//           }
//         >
//           <CameraIcon className="w-6 h-6 text-indigo-100 drop-shadow-md" />
//         </label>
//       </div>
//     </div>
//   );
// };

// export default Form;
// export { UploadImage };



// components/CategoryForm.tsx
"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/Label";
import Loader from "@/components/ui/loader";
import { toast } from "@/hooks/use-toast";
import { Translations } from "@/types/translations";
import { useActionState, useEffect, useState, ChangeEvent } from "react";
import { addCategory } from "../_actions/category";
import clsx from "clsx";
import { CameraIcon } from "lucide-react";
import Image from "next/image";

type ValidationError = {
  categoryName?: string;
  image?: string;
};

type FormState = {
  message?: string;
  error?: ValidationError;
  status?: number | null;
};

const initialState: FormState = {
  message: "",
  error: {},
  status: null,
};

function Form({ translations }: { translations: Translations }) {
  const [state, formAction, isPending] = useActionState(addCategory, initialState);
  const [categoryName, setCategoryName] = useState("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);

  // Log form state changes (e.g., success, error)
  useEffect(() => {
    if (!state.status) return;

    if (process.env.NODE_ENV === "development") {
      console.log(`[${new Date().toISOString()}] Form Submission:`, {
        status: state.status,
        message: state.message,
        errors: state.error,
      });
    }

    toast({
      title: state.message || translations.messages.unexpectedError || "An error occurred",
      variant: state.status >= 400 ? "destructive" : "default",
      className: clsx(
        state.status >= 400
          ? "bg-red-900 text-red-400 border-red-600"
          : "bg-green-900 text-green-400 border-green-600",
        "rounded-lg p-3"
      ),
      duration: 3000,
    });

    if (state.status === 201) {
      setCategoryName("");
      setSelectedImage(null);
      setImageFile(null);
      setImageError(null);
    }
  }, [state.status, state.message, state.error, isPending, translations]);

  const handleSubmit = (formData: FormData) => {
    if (!categoryName.trim()) {
      toast({
        title:
          translations.admin?.categories?.form?.name?.validation?.required ||
          "Category name is required",
        variant: "destructive",
        className: "bg-red-900 text-red-400 border-red-600 rounded-lg p-3",
        duration: 3000,
      });
      return;
    }

    if (!imageFile) {
      setImageError(
        translations.admin?.categories?.form?.image?.validation?.required ||
          "Image is required"
      );
      toast({
        title:
          translations.admin?.categories?.form?.image?.validation?.required ||
          "Image is required",
        variant: "destructive",
        className: "bg-red-900 text-red-400 border-red-600 rounded-lg p-3",
        duration: 3000,
      });
      return;
    }

    // Enhanced logging
    if (process.env.NODE_ENV === "development") {
      console.log(`[${new Date().toISOString()}] Submitting Category Data:`, {
        categoryName,
        image: {
          name: imageFile.name,
          size: `${(imageFile.size / 1024).toFixed(2)} KB`,
          type: imageFile.type,
          lastModified: new Date(imageFile.lastModified).toISOString(),
        },
        formData: Object.fromEntries(formData.entries()), // Log formData contents
      });
    }

    formData.append("categoryName", categoryName);
    formData.append("image", imageFile);
    formAction(formData);
  };

  const handleNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    setCategoryName(e.target.value);
    if (process.env.NODE_ENV === "development") {
      console.log(`[${new Date().toISOString()}] Category Name Changed:`, e.target.value);
    }
  };

  return (
    <form
      action={handleSubmit}
      aria-labelledby="form-title"
      className="bg-black p-8 rounded-2xl shadow-lg border border-indigo-600 max-w-md mx-auto"
    >
      <h2 id="form-title" className="sr-only">
        {translations.admin?.categories?.form?.title || "Add New Category"}
      </h2>
      <div className="space-y-6">
        <div className="flex flex-col items-center">
          <UploadImage
            selectedImage={selectedImage}
            setSelectedImage={setSelectedImage}
            setImageFile={setImageFile}
            translations={translations}
            disabled={isPending}
            setImageError={setImageError}
          />
          {(state.error?.image || imageError) && (
            <p
              className="mt-2 text-sm text-indigo-700 flex items-center gap-1 bg-indigo-900/30 border border-indigo-600 rounded-lg p-2"
              aria-live="polite"
            >
              <span className="text-indigo-700">⚠</span> {state.error?.image || imageError}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="categoryName" className="text-indigo-100">
            {translations.admin?.categories?.form?.name?.label || "Category Name"}
          </Label>
          <Input
            id="categoryName"
            type="text"
            value={categoryName}
            onChange={handleNameChange}
            placeholder={
              translations.admin?.categories?.form?.name?.placeholder ||
              "Enter category name"
            }
            disabled={isPending}
            className={clsx(
              "bg-black border-indigo-600 text-indigo-100 placeholder-indigo-700/50",
              "focus:ring-2 focus:ring-indigo-400 focus:border-indigo-500",
              isPending && "opacity-50 cursor-not-allowed"
            )}
            aria-describedby={state.error?.categoryName ? "categoryName-error" : undefined}
            aria-label={translations.admin?.categories?.form?.name?.label || "Category Name"}
          />
          {state.error?.categoryName && (
            <p
              id="categoryName-error"
              className="text-sm text-indigo-700 flex items-center gap-1"
              aria-live="polite"
            >
              <span className="text-indigo-700">⚠</span> {state.error.categoryName}
            </p>
          )}
        </div>

        <Button
          type="submit"
          size="lg"
          disabled={isPending}
          className={clsx(
            "w-full bg-indigo-600 hover:bg-indigo-700 text-indigo-100",
            "focus:ring-2 focus:ring-indigo-400",
            isPending && "opacity-50 cursor-not-allowed"
          )}
          aria-label={
            isPending
              ? translations.submitting || "Submitting..."
              : translations.create || "Create Category"
          }
        >
          {isPending ? (
            <Loader className="w-6 h-6 text-indigo-100 animate-spin" />
          ) : (
            translations.create || "Create"
          )}
        </Button>
      </div>
    </form>
  );
}

const UploadImage = ({
  selectedImage,
  setSelectedImage,
  setImageFile,
  translations,
  disabled,
  setImageError,
}: {
  selectedImage: string | null;
  setSelectedImage: React.Dispatch<React.SetStateAction<string | null>>;
  setImageFile: React.Dispatch<React.SetStateAction<File | null>>;
  translations: Translations;
  disabled?: boolean;
  setImageError: React.Dispatch<React.SetStateAction<string | null>>;
}) => {
  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      setImageError(
        translations.admin?.categories?.form?.image?.validation?.required ||
          "Image is required"
      );
      return;
    }

    if (!file.type.startsWith("image/")) {
      setImageError(
        translations.admin?.categories?.form?.image?.invalidType ||
          "Please upload a valid image file"
      );
      toast({
        title:
          translations.admin?.categories?.form?.image?.invalidType ||
          "Please upload a valid image file",
        variant: "destructive",
        className: "bg-red-900 text-red-400 border-red-600 rounded-lg p-3",
        duration: 3000,
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setImageError(
        translations.admin?.categories?.form?.image?.size ||
          "Image size exceeds 5MB limit"
      );
      toast({
        title:
          translations.admin?.categories?.form?.image?.size ||
          "Image size exceeds 5MB limit",
        variant: "destructive",
        className: "bg-red-900 text-red-400 border-red-600 rounded-lg p-3",
        duration: 3000,
      });
      return;
    }

    setImageError(null);
    setImageFile(file);
    setSelectedImage(URL.createObjectURL(file));

    // Log image selection
    if (process.env.NODE_ENV === "development") {
      console.log(`[${new Date().toISOString()}] Image Selected:`, {
        name: file.name,
        size: `${(file.size / 1024).toFixed(2)} KB`,
        type: file.type,
        lastModified: new Date(file.lastModified).toISOString(),
      });
    }
  };

  return (
    <div
      className={clsx(
        "group relative w-32 h-32 overflow-hidden rounded-full border-2 border-indigo-600 shadow-sm",
        "hover:shadow-md transition-all",
        disabled && "opacity-50 pointer-events-none"
      )}
    >
      {selectedImage ? (
        <Image
          src={selectedImage}
          alt={
            translations.admin?.categories?.form?.image?.validation ||
            "Category Image Preview"
          }
          width={128}
          height={128}
          className="rounded-full object-cover"
        />
      ) : (
        <div className="w-full h-full bg-indigo-600 rounded-full flex items-center justify-center">
          <CameraIcon className="w-8 h-8 text-indigo-100" />
        </div>
      )}
      <div
        className={clsx(
          "absolute inset-0 bg-indigo-600/50 flex items-center justify-center transition-opacity duration-300",
          selectedImage ? "group-hover:opacity-100 opacity-0" : "opacity-100"
        )}
      >
        <input
          type="file"
          accept="image/*"
          id="image-upload"
          className="hidden"
          onChange={handleImageChange}
          disabled={disabled}
        />
        <label
          htmlFor="image-upload"
          className="w-full h-full flex items-center justify-center cursor-pointer"
          aria-label={
            translations.admin?.categories?.form?.image?.label ||
            "Upload category image"
          }
        >
          <CameraIcon className="w-6 h-6 text-indigo-100 drop-shadow-md" />
        </label>
      </div>
    </div>
  );
};

export default Form;
export { UploadImage };