
"use client";

import { InputTypes, Routes } from "@/constants/enums";
import useFormFields from "@/hooks/useFormFields";
import { IFormField } from "@/types/app";
import { Translations } from "@/types/translations";
import { Session } from "next-auth";
import Image from "next/image";
import { Button } from "../ui/button";
import { UserRole } from "@prisma/client";
import { useActionState, useEffect, useState, useCallback, startTransition } from "react";
import { ValidationError } from "@/validations/auth";
import { updateProfile } from "./_actions/profile";
import Loader from "../ui/loader";
import { CameraIcon } from "lucide-react";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import FormFields from "../from-fields/from-fieds";
import { Checkbox } from "@radix-ui/react-checkbox";
import { motion } from "framer-motion";
import clsx from "clsx";

// Type for form state management
interface FormState {
  message?: string;
  error?: ValidationError;
  status?: number | null;
  formData?: FormData;
}

function EditUserForm({
  translations,
  user,
}: {
  translations: Translations;
  user: Session["user"];
}) {
  const { data: session, update } = useSession();
  const [selectedImage, setSelectedImage] = useState(user.image ?? "");
  const [isAdmin, setIsAdmin] = useState(user.role === UserRole.ADMIN);
  const [lastToastMessage, setLastToastMessage] = useState<string | null>(null); // Track last toast message

  const formData = useCallback(() => {
    const data = new FormData();
    Object.entries(user).forEach(([key, value]) => {
      if (value !== null && value !== undefined && key !== "image") {
        data.append(key, value.toString());
      }
    });
    return data;
  }, [user]);

  const initialState: FormState = {
    message: "",
    error: {} as ValidationError,
    status: null,
    formData: formData(),
  };

  const [state, action, pending] = useActionState(
    updateProfile.bind(null, isAdmin),
    initialState
  );
  const { getFormFields } = useFormFields({
    slug: Routes.PROFILE,
    translations,
  });

  // Handle toast and session updates
  useEffect(() => {
    if (state.message && typeof state.status === "number" && !pending && state.message !== lastToastMessage) {
      toast.dismiss("profile-update-loading"); // Dismiss loading toast
      const isSuccess = state.status === 200;
      toast[isSuccess ? "success" : "error"](state.message, {
        style: {
          color: isSuccess ? "#34c759" : "#ef4444",
          backgroundColor: isSuccess ? "#f0fdf4" : "#fef2f2",
          border: `1px solid ${isSuccess ? "#dcfce7" : "#fee2e2"}`,
          borderRadius: "8px",
          padding: "12px",
        },
        duration: 3000,
      });
      setLastToastMessage(state.message);
      if (isSuccess) {
        update({
          ...session,
          user: {
            ...session?.user,
            role: isAdmin ? UserRole.ADMIN : UserRole.USER,
            image: selectedImage,
          },
        });
      }
    }
  }, [pending, state.message, state.status, session, update, isAdmin, selectedImage, lastToastMessage]);

  useEffect(() => {
    setSelectedImage(user.image ?? "");
  }, [user.image]);

  // Submit handler with instant toast on click
  const handleSubmit = useCallback((e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const savingMessage = translations.profile?.saving || "Saving...";
    if (savingMessage !== lastToastMessage) { // Prevent duplicate "Saving..." message
      toast.loading(savingMessage, {
        id: "profile-update-loading", // Use constant ID for updates
        style: {
          borderRadius: "8px",
          padding: "12px",
          backgroundColor: "#f3f4f6",
          color: "#374151",
          border: "1px solid #e5e7eb",
        },
      });
      setLastToastMessage(savingMessage);
    }
    startTransition(() => {
      action(new FormData(e.currentTarget));
    });
  }, [action, translations, lastToastMessage]);

  return (
    <motion.form
      onSubmit={handleSubmit}
      className="flex flex-col md:flex-row gap-10 p-6 bg-black shadow-lg rounded-lg"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* User Image Section */}
      <motion.div
        className="group relative w-[200px] h-[200px] overflow-hidden rounded-full mx-auto border-2 border-indigo-700"
        whileHover={{ scale: 1.05 }}
      >
        {selectedImage ? (
          <Image
            src={selectedImage}
            alt={user.name ?? translations.profile?.avatarAlt ?? "User Avatar"}
            width={200}
            height={200}
            className="rounded-full object-cover"
          />
        ) : (
          <Image
            src="https://i.postimg.cc/kg2xytVs/610e8961bbb935274c005c6106a78a38.jpg" // صورة قطة احترافية
            alt="Default Cat Avatar"
            width={200}
            height={200}
            className="rounded-full object-cover"
          />
        )}
        <div 
          className={clsx(
            "absolute top-0 left-0 w-full h-full flex items-center justify-center  rounded-full transition-opacity duration-200",
            selectedImage && "group-hover:opacity-100 opacity-0 transition-opacity duration-200"
          )}
        >
          <UploadImage setSelectedImage={setSelectedImage} />
        </div>
      </motion.div>

      {/* Form Fields Section */}
      <motion.div
        className="flex-1"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        {getFormFields().map((field: IFormField) => {
          const fieldValue =
            state?.formData?.get(field.name) ?? formData().get(field.name);
          return (
            <motion.div
              key={field.name}
              className="mb-4"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <FormFields
                {...field}
                defaultValue={fieldValue as string}
                error={state?.error?.[field.name]}
                readOnly={field.type === InputTypes.EMAIL}
                disabled={pending}
              />
            </motion.div>
          );
        })}

        {/* Admin Checkbox */}
        {session?.user.role === UserRole.ADMIN && (
          <motion.div
            className="flex items-center gap-2 my-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <Checkbox
              id="admin"
              name="admin"
              checked={isAdmin}
              onCheckedChange={(checked) => setIsAdmin(checked as boolean)}
              className={clsx(
                "w-5 h-5 border-2 rounded-md transition-all",
                isAdmin
                  ? "bg-indigo-700 border-indigo-700"
                  : "bg-black border-black"
              )}
            />
            <label
              htmlFor="admin"
              className="text-indigo-700 font-medium cursor-pointer"
            >
              {translations.profile?.adminLabel || "Admin"}
            </label>
          </motion.div>
        )}

        {/* Save Button */}
        <motion.div
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <Button
            type="submit"
            disabled={pending}
            className={clsx(
              "w-full bg-indigo-700 hover:bg-indigo-700 text-black font-bold py-2 px-4 rounded-lg transition-all",
              pending && "opacity-50 cursor-not-allowed flex items-center justify-center gap-2"
            )}
          >
            {pending ? (
              <>
                <Loader className="w-5 h-5" />
                <span>{translations.profile?.saving || "Saving..."}</span>
              </>
            ) : (
              translations.save || "Save"
            )}
          </Button>
        </motion.div>
      </motion.div>
    </motion.form>
  );
}

export default EditUserForm;

// Image Upload Component
const UploadImage = ({
  setSelectedImage,
}: {
  setSelectedImage: React.Dispatch<React.SetStateAction<string>>;
}) => {
  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setSelectedImage(url);
    }
  };

  return (
    <>
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
        className="flex justify-center items-center w-full h-full cursor-pointer ml-1 rounded-full hover:bg-indigo-700/700 transition-all"
      >
        <CameraIcon className="w-10 h-10 text-indigo-700" />
      </label>
    </>
  );
};
