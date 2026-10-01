import Link from "next/link";
import { Library, BarChart3 } from "lucide-react";
import { AgendaHojeCard } from "@/components/AgendaHojeCard";
import { CardsMetricas } from "@/components/CardsMetricas";
import { Card, CardContent } from "@/components/ui/Card";

// Mostra a data e as aulas de HOJE: sem isso o Next.js prerenderia esta página uma
// vez no build e congelaria a data/hora daquele momento pra sempre (até o próximo deploy).
export const dynamic = "force-dynamic";

const ATALHOS = [
  { href: "/biblioteca", label: "Biblioteca", icon: Library },
  { href: "/progresso", label: "Ver Progresso", icon: BarChart3 },
];

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-6">
      <CardsMetricas />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <AgendaHojeCard />
        </div>
        <Card>
          <CardContent className="flex flex-col gap-2">
            {ATALHOS.map((a) => (
              <Link
                key={a.href}
                href={a.href}
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                <a.icon className="h-4 w-4" />
                {a.label}
              </Link>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
