"use client";

import Link from "next/link";
import { useCronograma } from "@/components/hooks/useCronograma";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { DisciplinaIcon } from "@/components/ui/DisciplinaIcon";
import { DIAS_SEMANA, DIAS_SEMANA_LABEL, DISCIPLINA_POR_ID, nomeDisciplinaParaId } from "@/lib/constants";
import { cn } from "@/lib/utils";

const COR_FALLBACK = "#94A3B8";

export function CronogramaVisual() {
  const { cronograma, diaAtual, loading } = useCronograma();

  if (loading) {
    return (
      <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-4">
        {DIAS_SEMANA.map((dia) => (
          <div key={dia} className="h-40 animate-pulse rounded-lg bg-[var(--border)]/40" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-4">
      {DIAS_SEMANA.map((dia) => {
        const disciplinas = cronograma?.[dia] ?? [];
        const isHoje = dia === diaAtual;

        return (
          <Card
            key={dia}
            className={cn(
              "flex flex-col",
              isHoje && "border-blue-500 bg-blue-50 ring-2 ring-blue-500/40 dark:bg-blue-950/30"
            )}
          >
            <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
              <CardTitle className={cn("text-sm", isHoje && "text-blue-600 dark:text-blue-400")}>
                {DIAS_SEMANA_LABEL[dia]}
              </CardTitle>
              {isHoje && (
                <span className="shrink-0 rounded-full bg-blue-600 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
                  Hoje
                </span>
              )}
            </CardHeader>
            <CardContent className="flex flex-1 flex-col gap-2 pt-0">
              {disciplinas.length === 0 ? (
                <p className="text-xs text-[var(--muted)]">Dia livre, sem disciplinas.</p>
              ) : (
                disciplinas.map((nome) => {
                  const id = nomeDisciplinaParaId(nome);
                  const config = id ? DISCIPLINA_POR_ID[id] : undefined;
                  const cor = config?.cor || COR_FALLBACK;

                  const linha = (
                    <div
                      className="flex items-start gap-2 rounded-md border border-[var(--border)] p-2 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50"
                      style={{ borderLeftColor: cor, borderLeftWidth: 3 }}
                    >
                      <DisciplinaIcon icone={config?.icone} className="mt-0.5 h-4 w-4 shrink-0" style={{ color: cor }} />
                      <span className="break-words text-sm font-medium leading-snug" style={{ color: cor }}>
                        {nome}
                      </span>
                    </div>
                  );

                  return id ? (
                    <Link key={nome} href={`/biblioteca?disciplina=${id}`}>
                      {linha}
                    </Link>
                  ) : (
                    <div key={nome}>{linha}</div>
                  );
                })
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
