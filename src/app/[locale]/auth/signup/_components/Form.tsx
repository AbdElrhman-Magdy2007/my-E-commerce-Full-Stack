"use client";

import FormFields from "@/components/from-fields/from-fieds"; // تأكد من المسار الصحيح
import { Button } from "@/components/ui/button";
import { Pages, Routes } from "@/constants/enums";
import useFormFields from "@/hooks/useFormFields";
import { signup } from "@/server/_actions/auth";
import { IFormField } from "@/types/app";
import { Translations } from "@/types/translations";
import { ValidationError } from "@/validations/auth";
import { useParams, useRouter } from "next/navigation";
import { useActionState, useEffect, useState } from "react";
import { toast } from "sonner";
import clsx from "clsx";
import Loader from "@/components/ui/loader"; // لتحسين تجربة التحميل

// تعريف نوع الحالة
interface FormState {
  message?: string;
  error?: ValidationError; // Explicitly define the error type
  status?: number | null;
  formData?: FormData | null;
}

const initialState: FormState = {
  message: "",
  error: {},
  status: null,
  formData: null,
};

/**
 * مكون Form لتسجيل مستخدم جديد مع دعم الترجمة والتحقق من الصحة.
 * @param translations - كائن الترجمات المستخدم في النموذج
 */
function RegisterForm({ translations }: { translations: Translations }) {
  const { locale } = useParams();
  const router = useRouter();
  const [state, action, pending] = useActionState(signup, initialState);
  const [lastToastMessage, setLastToastMessage] = useState<string | null>(null); // لمنع تكرار الـ toast
  const isArabic = locale === "ar"; // تحديد اللغة ديناميكيًا

  const { getFormFields } = useFormFields({
    slug: Pages.Register, // تصحيح الثابت إلى REGISTER (كبير)
    translations,
  });

  // إدارة الإشعارات وإعادة التوجيه
  useEffect(() => {
    if (
      state.status &&
      state.message &&
      state.message !== lastToastMessage // منع تكرار الـ toast
    ) {
      const isSuccess = state.status === 201;
      toast[isSuccess ? "success" : "error"](state.message, {
        style: {
          color: isSuccess ? "#34c759" : "#ef4444",
          backgroundColor: isSuccess ? "#f0fdf4" : "#fef2f2",
          border: `1px solid ${isSuccess ? "#dcfce7" : "#fee2e2"}`,
          borderRadius: "8px",
          padding: "12px",
          fontSize: "14px",
          fontWeight: "500",
        },
        duration: 3000,
        position: "top-right",
      });
      setLastToastMessage(state.message); // تحديث آخر رسالة تم عرضها

      if (isSuccess) {
        router.replace(`/${locale}/${Routes.AUTH}/${Pages.LOGIN}`);
      }
    }
  }, [locale, router, state.message, state.status, lastToastMessage]);

  return (
    <form
      action={action}
      className={clsx(
        "space-y-6 w-full max-w-md mx-auto p-4 shadow-indigo-900",
        "bg-black dark:bg-gray-900 rounded-lg shadow-md",
        isArabic ? "text-right" : "text-left"
      )}
    >
      {getFormFields().map((field: IFormField) => {
        const fieldValue = state.formData?.get(field.name);
        return (
          <div className="mb-4" key={field.name}>
            <FormFields
              isArabic={isArabic}
              {...field}
              error={
                state.error && typeof state.error === "object"
                  ? Array.isArray(state.error[field.name])
                    ? state.error[field.name].join(", ")
                    : state.error[field.name]
                  : undefined
              } // Ensure error is a string or ValidationError
              defaultValue={fieldValue as string | undefined}
              disabled={pending}
            />
          </div>
        );
      })}
      <Button
        type="submit"
        disabled={pending}
        className={clsx(
          "w-full font-semibold rounded-lg transition-all duration-200",
          "bg-indigo-700 hover:bg-indigo-700 text-black",
          "dark:bg-indigo-700 dark:hover:bg-indigo-900",
          pending && "opacity-50 cursor-not-allowed flex items-center justify-center gap-2"
        )}
      >
        {pending ? (
          <>
            <Loader className="w-5 h-5" />
            <span>{translations.auth?.register?.loading || "Registering..."}</span>
          </>
        ) : (
          translations.auth?.register?.submit || "Register"
        )}
      </Button>
    </form>
  );
}

export default RegisterForm;

