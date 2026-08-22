"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { X, GraduationCap } from "lucide-react";
import { NAV_ITEMS } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function MobileNav({ aberto, onFechar }: { aberto: boolean; onFechar: () => void }) {
  const pathname = usePathname();

  if (!aberto) return null;

  return (
    <div className="fixed inset-0 z-50 md:hidden">
      <div className="absolute inset-0 bg-black/50" onClick={onFechar} />
      <nav className="absolute left-0 top-0 h-full w-64 bg-[var(--background)] p-4 shadow-xl">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-6 w-6 text-blue-600" />
            <span className="font-bold">AVA Concursos</span>
          </div>
          <button onClick={onFechar} aria-label="Fechar menu">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="flex flex-col gap-1">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={onFechar}
              className={cn(
                "rounded-lg px-3 py-2 text-sm font-medium",
                pathname === item.href
                  ? "bg-blue-600 text-white"
                  : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
              )}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}
