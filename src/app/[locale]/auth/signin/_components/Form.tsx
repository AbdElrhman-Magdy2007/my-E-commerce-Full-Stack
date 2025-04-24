/* eslint-disable react-hooks/rules-of-hooks */
"use client";

import { useState, useRef, useCallback } from "react";
import { toast } from "sonner";
import { Pages, Routes } from "@/constants/enums";
import useFormFields from "@/hooks/useFormFields";
import { IFormField } from "@/types/app";
import { signIn } from "next-auth/react";
import { Translations } from "@/types/translations";
import { Button } from "@/components/ui/button";
import { useParams, useRouter } from "next/navigation";
import FormFields from "@/components/from-fields/from-fieds"; // تأكد من المسار الصحيح
import Loader from "@/components/ui/loader"; // لتحسين تجربة التحميل
import clsx from "clsx";

/**
 * مكون Form لتسجيل الدخول باستخدام NextAuth مع دعم الترجمة والتحقق من الصحة.
 * @param translations - كائن الترجمات المستخدم في النموذج
 */
function LoginForm({ translations }: { translations: Translations }) {
  const { locale } = useParams();
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [errors, setErrors] = useState<{ [key: string]: string[] }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [lastToastMessage, setLastToastMessage] = useState<string | null>(null); // لمنع تكرار الـ toast
  const isArabic = locale === "ar"; // تحديد اللغة ديناميكيًا

  // التحقق من وجود الترجمات
  if (!translations?.buttons?.login) {
    console.error("⚠️ Missing translations object:", translations);
    return (
      <div className="text-red-500 text-center p-4">
        {translations.messages?.unexpectedError || "Error: Missing translations"}
      </div>
    );
  }

  const { getFormFields } = useFormFields({
    slug: Pages.LOGIN,
    translations,
  });

  const formFields = getFormFields();

  // دالة الإرسال مع التحقق من الصحة وتسجيل الدخول
  const onSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (!formRef.current) return;

      const formData = new FormData(formRef.current);
      const data: Record<string, string> = {};
      formData.forEach((value, key) => {
        data[key] = value.toString();
      });
      console.log("Login FormData:", data);

      // التحقق من الحقول الفارغة
      const newErrors: { [key: string]: string[] } = {};
      if (!data.email) newErrors.email = [translations.validation.requiredEmail];
      if (!data.password) newErrors.password = [translations.validation.requiredPassword];

      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        console.log("Client-side Validation Errors:", newErrors);
        return;
      }

      try {
        setIsLoading(true);
        setErrors({});

        const res = await signIn("credentials", {
          email: data.email,
          password: data.password,
          redirect: false,
        });

        console.log("SignIn Response:", res);

        if (res?.error) {
          console.error("❌ Login Error:", res.error);
          try {
            const parsedError = JSON.parse(res.error);
            const validationErrors = parsedError.validationError || {};

            setErrors((prevErrors) => ({
              ...prevErrors,
              ...validationErrors,
            }));

            if (parsedError.responseError && parsedError.responseError !== lastToastMessage) {
              toast.error(parsedError.responseError, {
                style: {
                  color: "#ef4444",
                  backgroundColor: "#fef2f2",
                  border: "1px solid #fee2e2",
                  borderRadius: "8px",
                  padding: "12px",
                },
                duration: 3000,
              });
              setLastToastMessage(parsedError.responseError);
            }
          } catch (parseError) {
            console.error("❌ JSON Parse Error:", parseError);
            if (translations.messages.unexpectedError !== lastToastMessage) {
              toast.error(translations.messages.unexpectedError, {
                style: {
                  color: "#ef4444",
                  backgroundColor: "#fef2f2",
                  border: "1px solid #fee2e2",
                  borderRadius: "8px",
                  padding: "12px",
                },
                duration: 3000,
              });
              setLastToastMessage(translations.messages.unexpectedError);
            }
          }
        }

        if (res?.ok) {
          if (translations.messages.loginSuccess !== lastToastMessage) {
            toast.success(translations.messages.loginSuccess, {
              style: {
                color: "#34c759",
                backgroundColor: "#f0fdf4",
                border: "1px solid #dcfce7",
                borderRadius: "8px",
                padding: "12px",
              },
              duration: 3000,
            });
            setLastToastMessage(translations.messages.loginSuccess);
          }
          router.replace(`/${locale}/${Routes.PROFILE}`);
        }
      } catch (error) {
        console.error("❌ Unexpected Error:", error);
        if (translations.messages.unexpectedError !== lastToastMessage) {
          toast.error(translations.messages.unexpectedError, {
            style: {
              color: "#ef4444",
              backgroundColor: "#fef2f2",
              border: "1px solid #fee2e2",
              borderRadius: "8px",
              padding: "12px",
            },
            duration: 3000,
          });
          setLastToastMessage(translations.messages.unexpectedError);
        }
      } finally {
        setIsLoading(false);
      }
    },
    [translations, router, locale, lastToastMessage]
  );

  return (
    <form
      className={clsx(
        "space-y-6 w-full max-w-md mx-auto p-6 shadow-indigo-700/50",
        "bg-blue dark:bg-indigo-700 rounded-lg shadow-lg",
        isArabic ? "text-right" : "text-left"
      )}
      onSubmit={onSubmit}
      ref={formRef}
    >
      {formFields.map((field: IFormField, index: number) => (
        <div key={field.name || index} className="space-y-2">
          <FormFields
            isArabic={isArabic}
            {...field}
            error={errors[field.name]?.[0]} // تمرير أول رسالة خطأ فقط
            disabled={isLoading}
          />
        </div>
      ))}
      <Button
        type="submit"
        className={clsx(
          "w-full font-semibold rounded-lg transition-all duration-200",
          "bg-indigo-700 hover:bg-indigo-700 text-black",
          "dark:bg-blue-500 dark:hover:bg-blue-600",
          isLoading && "opacity-50 cursor-not-allowed"
        )}
        disabled={isLoading}
      >
        {isLoading ? (
          <Loader className="w-5 h-5" />
        ) : (
          translations.buttons.login.submit || "Login"
        )}
      </Button>
    </form>
  );
}

export default LoginForm;