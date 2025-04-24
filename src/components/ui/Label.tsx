"use client";

import * as React from "react";
import * as LabelPrimitive from "@radix-ui/react-label";
import { cva, type VariantProps } from "class-variance-authority";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const labelVariants = cva(
  "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
);

const Label = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root> &
    VariantProps<typeof labelVariants>
>(({ className, ...props }, ref) => {
  const pathname = usePathname();
  const isArabic = pathname.startsWith("/ar");

  return (
    <LabelPrimitive.Root
      ref={ref}
      className={cn(
        labelVariants(),
        {
          "text-left": isArabic, // العربية: يسار
          "text-right": !isArabic, // الإنجليزية: يمين
        },
        className
      )}
      dir={isArabic ? "rtl" : "ltr"}
      {...props}
    />
  );
});

Label.displayName = LabelPrimitive.Root.displayName;

export { Label };