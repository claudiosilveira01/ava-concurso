"use client";

import { BookCheck, Flame, TrendingUp, Trophy } from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import { useProgresso } from "@/components/hooks/useProgresso";

const METRICAS = [
  { chave: "totalAulasCompletadas", label: "Aulas Concluídas", icone: BookCheck, sufixo: "" },
  { chave: "progressoGeral", label: "Progresso Geral", icone: TrendingUp, sufixo: "%" },
  { chave: "diasConsecutivos", label: "Dias Consecutivos", icone: Flame, sufixo: "" },
  { chave: "disciplinasConcluidas", label: "Disciplinas Concluídas", icone: Trophy, sufixo: "" },
] as const;

export function CardsMetricas() {
  const { progresso, loading } = useProgresso();

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
      {METRICAS.map(({ chave, label, icone: Icone, sufixo }) => (
        <Card key={chave}>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-500/10">
              <Icone className="h-5 w-5 text-blue-500" />
            </div>
            <div className="min-w-0">
              {loading ? (
                <div className="h-7 w-14 animate-pulse rounded bg-[var(--border)]" />
              ) : (
                <p className="text-2xl font-bold leading-tight">
                  {progresso?.[chave] ?? 0}
                  {sufixo}
                </p>
              )}
              <p className="truncate text-xs text-[var(--muted)]">{label}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
