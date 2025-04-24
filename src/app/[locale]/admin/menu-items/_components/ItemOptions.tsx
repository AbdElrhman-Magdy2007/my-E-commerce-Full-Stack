"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/Label";
import { Translations } from "@/types/translations";
import { Extra, ExtraIngredients, ProductSize, Size } from "@prisma/client";
import { Plus, Trash2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useParams } from "next/navigation";
import { Languages } from "@/constants/enums";
import clsx from "clsx";

export enum ItemOptionsKeys {
  SIZES,
  EXTRAS,
}

const sizesNames = [ProductSize.SMALL, ProductSize.MEDIUM, ProductSize.LARGE];
const extrasNames = [
  ExtraIngredients.CHEESE,
  ExtraIngredients.BACON,
  ExtraIngredients.ONION,
  ExtraIngredients.PEPPER,
  ExtraIngredients.TOMATO,
];

// دالة عامة لمعالجة الخيارات
function handleOptions<T extends Partial<Size> | Partial<Extra>>(
  setState: React.Dispatch<React.SetStateAction<T[]>>
) {
  const addOption = () => {
    setState((prev) => [...prev, { name: "", price: 0 } as unknown as T]);
  };

  const onChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number,
    fieldName: keyof T
  ) => {
    const newValue = e.target.value;
    setState((prev) => {
      const newItems = [...prev];
      newItems[index] = { ...newItems[index], [fieldName]: newValue };
      return newItems;
    });
  };

  const removeOption = (indexToRemove: number) => {
    setState((prev) => prev.filter((_, index) => index !== indexToRemove));
  };

  return { addOption, onChange, removeOption };
}

interface ItemOptionsProps<T> {
  state: T[];
  setState: React.Dispatch<React.SetStateAction<T[]>>;
  translations: Translations;
  optionKey: ItemOptionsKeys;
}

function ItemOptions<T extends Partial<Size> | Partial<Extra>>({
  state,
  setState,
  translations,
  optionKey,
}: ItemOptionsProps<T>) {
  const { addOption, onChange, removeOption } = handleOptions<T>(setState);

  const isThereAvailableOptions = () => {
    switch (optionKey) {
      case ItemOptionsKeys.SIZES:
        return sizesNames.length > state.length;
      case ItemOptionsKeys.EXTRAS:
        return extrasNames.length > state.length;
    }
  };

  return (
    <div className="space-y-4">
      {state.length > 0 && (
        <ul className="space-y-4">
          {state.map((item, index) => (
            <li
              key={index}
              className={clsx(
                "flex items-end gap-3 p-4 rounded-lg shadow-sm transition-shadow",
                "bg-indigo-950 dark:bg-indigo-900 border border-indigo-900 hover:shadow-md"
              )}
            >
              <div className="flex-1 space-y-1">
                <Label className="text-sm font-medium text-indigo-200">
                  {translations.name || "Name"}
                </Label>
                <SelectName
                  item={item}
                  onChange={onChange}
                  index={index}
                  currentState={state}
                  optionKey={optionKey}
                />
              </div>
              <div className="flex-1 space-y-1">
                <Label className="text-sm font-medium text-indigo-200">
                  {translations.extraPrice || "Extra Price"}
                </Label>
                <Input
                  type="number"
                  placeholder="0"
                  min={0}
                  name="price"
                  value={item.price ?? 0}
                  onChange={(e) => onChange(e, index, "price")}
                  className={clsx(
                    "w-full p-2 rounded-md transition-all",
                    "bg-indigo-800 text-indigo-100 border-indigo-700",
                    "focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500",
                    "hover:bg-indigo-700"
                  )}
                />
              </div>
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => removeOption(index)}
                className={clsx(
                  "flex-shrink-0 transition-colors",
                  "border-red-500 text-red-500 hover:bg-red-600 hover:text-white hover:border-red-600"
                )}
              >
                <Trash2 className="w-5 h-5" />
              </Button>
            </li>
          ))}
        </ul>
      )}
      {isThereAvailableOptions() && (
        <Button
          type="button"
          variant="outline"
          className={clsx(
            "w-full py-2 rounded-md shadow-sm transition-all",
            "bg-indigo-900 text-indigo-100 border-indigo-700",
            "hover:bg-indigo-800 hover:border-indigo-600 hover:text-indigo-50",
            "flex items-center justify-center gap-2"
          )}
          onClick={addOption}
        >
          <Plus className="w-5 h-5" />
          <span>
            {optionKey === ItemOptionsKeys.SIZES
              ? translations.admin?.["menu-items"]?.addItemSize ?? "Add Item Size"
              : translations.admin?.["menu-items"]?.addExtraItem ?? "Add Extra Item"}
          </span>
        </Button>
      )}
    </div>
  );
}

interface SelectNameProps<T> {
  index: number;
  item: T;
  currentState: T[];
  optionKey: ItemOptionsKeys;
  onChange: (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number,
    fieldName: keyof T
  ) => void;
}

function SelectName<T extends Partial<Size> | Partial<Extra>>({
  onChange,
  index,
  item,
  currentState,
  optionKey,
}: SelectNameProps<T>) {
  const { locale } = useParams();

  const getNames = () => {
    switch (optionKey) {
      case ItemOptionsKeys.SIZES:
        return sizesNames.filter(
          (size) => !currentState.some((s) => s.name === size)
        );
      case ItemOptionsKeys.EXTRAS:
        return extrasNames.filter(
          (extra) => !currentState.some((e) => e.name === extra)
        );
    }
  };

  const names = getNames() || [];

  return (
    <Select
      onValueChange={(value) =>
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onChange({ target: { value } } as any, index, "name")
      }
      defaultValue={item.name || "select..."}
    >
      <SelectTrigger
        className={clsx(
          "w-full p-2 rounded-md transition-all",
          "bg-indigo-800 text-indigo-100 border-indigo-700",
          "focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500",
          locale === Languages.ARABIC ? "flex-row-reverse" : "flex-row"
        )}
      >
        <SelectValue placeholder="Select...">
          {item.name || "Select..."}
        </SelectValue>
      </SelectTrigger>
      <SelectContent
        className={clsx(
          "rounded-md shadow-lg z-50",
          "bg-indigo-900 border-indigo-700 text-indigo-100"
        )}
      >
        <SelectGroup>
          {names.map((name, idx) => (
            <SelectItem
              key={idx}
              value={name}
              className={clsx(
                "text-indigo-100 hover:bg-indigo-800 hover:text-indigo-50",
                "transition-colors cursor-pointer"
              )}
            >
              {name}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}

export default ItemOptions;