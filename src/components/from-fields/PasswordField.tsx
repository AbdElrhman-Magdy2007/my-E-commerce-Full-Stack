import { IFormField } from "@/types/app";
import { useState } from "react";
import { Input } from "../ui/input";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import { ValidationError } from "@/validations/auth";
import { useParams } from "next/navigation";
import { Languages } from "@/constants/enums";
import { Label } from "../ui/Label";
import clsx from "clsx";

interface Props extends IFormField {
  error?: ValidationError | string;
}

const PasswordField = ({
  label,
  name,
  placeholder,
  disabled,
  autoFocus,
  error,
  defaultValue,
}: Props) => {
  const [showPassword, setShowPassword] = useState(false);
  const params = useParams();
  const locale = (params?.locale as Languages) || Languages.ENGLISH; // تأكد من وجود قيمة افتراضية

  const togglePasswordVisibility = () => setShowPassword((prev) => !prev);

  // استخراج الخطأ إذا كان `error` كائنًا يحتوي على أخطاء متعددة
  const fieldError =
    error && typeof error === "object" && name ? error[name]?.[0] || "" : error;

  return (
    <div className="space-y-2">
      {label && (
        <Label htmlFor={name} className="capitalize text-indigo-700 ">
          {label}
        </Label>
      )}

      <div className="relative flex items-center text-indigo-700">
        <Input
          type={showPassword ? "text" : "password"}
          placeholder={placeholder}
          disabled={disabled}
          autoFocus={autoFocus}
          autoComplete="off"
          name={name}
          id={name}
          defaultValue={defaultValue}
          aria-invalid={!!fieldError}
          aria-describedby={fieldError ? `${name}-error` : undefined}
        />

        <button
          type="button"
          onClick={togglePasswordVisibility}
          className={clsx("absolute", {
            "left-3": locale === Languages.ARABIC,
            "right-3": locale !== Languages.ARABIC,
          })}
        >
          {showPassword ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
        </button>
      </div>

      {fieldError && (
        <p id={`${name}-error`} className="text-sm font-medium text-destructive text-red-600 mt-2">
          {typeof fieldError === "string" ? fieldError : ""}
        </p>
      )}
    </div>
  );
};

export default PasswordField;
