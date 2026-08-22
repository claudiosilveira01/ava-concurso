"use client";

import Link from "next/link";
import { useCronograma } from "@/components/hooks/useCronograma";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { DIAS_SEMANA, DIAS_SEMANA_LABEL, DISCIPLINA_POR_ID, nomeDisciplinaParaId } from "@/lib/constants";
import { cn } from "@/lib/utils";

const COR_FALLBACK = "#3B82F6";

export function CronogramaVisual() {
  const { cronograma, diaAtual, loading } = useCronograma();

  if (loading) {
    return <p className="text-sm text-[var(--muted)]">Carregando...</p>;
  }

  return (
    <div className="flex gap-4 overflow-x-auto pb-2 md:grid md:grid-cols-7 md:overflow-visible">
      {DIAS_SEMANA.map((dia) => {
        const disciplinas = cronograma?.[dia] ?? [];
        const isHoje = dia === diaAtual;

        return (
          <Card
            key={dia}
            className={cn(
              "min-w-[220px] flex-shrink-0 md:min-w-0",
              isHoje && "border-2 border-blue-500 ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-950/30"
            )}
          >
            <CardHeader className="pb-2">
              <CardTitle className={isHoje ? "text-blue-500" : undefined}>
                {DIAS_SEMANA_LABEL[dia]}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2 pt-0">
              {disciplinas.length === 0 ? (
                <p className="text-xs text-[var(--muted)]">Sem disciplinas.</p>
              ) : (
                disciplinas.map((nome) => {
                  const id = nomeDisciplinaParaId(nome);
                  const cor = (id && DISCIPLINA_POR_ID[id]?.cor) || COR_FALLBACK;
                  const chip = (
                    <Badge
                      key={nome}
                      className="w-fit cursor-pointer"
                      style={{ backgroundColor: cor, color: "#fff" }}
                    >
                      {nome}
                    </Badge>
                  );
                  if (!id) return chip;
                  return (
                    <Link key={nome} href={`/biblioteca?disciplina=${id}`}>
                      {chip}
                    </Link>
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
