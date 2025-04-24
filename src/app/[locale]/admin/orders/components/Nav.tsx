"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";

export interface NavLink {
  title: string;
  href: string;
}

export function Nav({ links }: { links: NavLink[] }) {
  return (
    <nav
      className={cn(
        "bg-primary text-primary-foreground",
        "flex justify-center items-center px-4 py-3",
        "shadow-md dark:shadow-gray-700/50",
        "border-b border-primary-foreground/10",
        "sticky top-0 "
      )}
    >
      <div className="flex space-x-2 lg:space-x-4">
        {links.map((link) => (
          <NavLink key={link.href} href={link.href}>
            {link.title}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}

export function NavLink({
  href,
  children,
}: { href: string; children: React.ReactNode }) {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      className={cn(
        "px-4 py-2 rounded-md transition-all duration-200",
        "hover:bg-secondary hover:text-secondary-foreground",
        isActive
          ? "bg-background text-foreground font-semibold"
          : "text-primary-foreground/90 hover:text-primary-foreground"
      )}
    >
      {children}
    </Link>
  );
}