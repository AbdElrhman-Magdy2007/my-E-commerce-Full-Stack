import { InputTypes } from "@/constants/enums";
import { IFormField } from "@/types/app";
import Checkbox from "./checkbox";
import { ValidationError } from "@/validations/auth";
import TextField from "./TextField";
import PasswordField from "./PasswordField";

interface Props extends IFormField {
  error?: ValidationError | string;
  label?: string;
}

const FormFields = (props: Props) => {
  const { type, error, name } = props;

  // استخراج الخطأ الخاص بالحقل فقط إذا كان موجودًا
  const fieldError =
    error && typeof error === "object" && name ? error[name]?.[0] || "" : error;

  const renderField = (): React.ReactNode => {
    switch (type) {
      case InputTypes.EMAIL:
      case InputTypes.TEXT:
        return <TextField isArabic={false} {...props} error={fieldError} />;

      case InputTypes.PASSWORD:
        return <PasswordField {...props} error={fieldError} />;

      case InputTypes.CHECKBOX:
        return <Checkbox checked={false} {...props} label={props.label} error={fieldError}/>;

      default:
        console.warn(`Unsupported input type: ${type}`);
        return null;
    }
  };

  return <>{renderField()}</>;
};

export default FormFields;
