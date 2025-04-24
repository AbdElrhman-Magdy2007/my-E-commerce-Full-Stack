export interface IOption {
  label: string;
  value: string;
}

export interface IFormField {
  name: string;
  label?: string;
  type:
    | "text"
    | "email"
    | "password"
    | "number"
    | "date"
    | "time"
    | "datetime-local"
    | "checkbox"
    | "radio"
    | "select"
    | "textarea"
    | "hidden"
    | "tel"
    | "url"; // دعم لأنواع أخرى

  placeholder?: string;
  disabled?: boolean;
  autoFocus?: boolean;
  options?: IOption[]; // يتم التعامل معها كمصفوفة دائمًا
  id?: string;
  defaultValue?: string | number; // دعم الأرقام
  readonly?: boolean;
  required?: boolean; // إضافة خاصية التحقق من صحة الحقل
  className?: string; // السماح بتخصيص التنسيق عبر CSS
}

export interface IFormFieldsVariables {
  slug: string;
}
