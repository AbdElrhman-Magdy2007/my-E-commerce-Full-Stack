// components/link.tsx
import NextLink from "next/link";
import { ReactNode } from "react";

interface LinkProps {
  href: string;
  children: ReactNode;
  [key: string]: any;
}

function Link({ href, children, ...props }: LinkProps) {
  return (
    <NextLink href={href} {...props}>
      {children}
    </NextLink>
  );
}

export default Link;