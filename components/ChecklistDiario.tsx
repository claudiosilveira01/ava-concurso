"use client";

import { useCronograma } from "@/components/hooks/useCronograma";
import { useChecklist } from "@/components/hooks/useChecklist";
import { Checkbox } from "@/components/ui/Checkbox";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { DISCIPLINA_POR_ID, nomeDisciplinaParaId } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { ListChecks } from "lucide-react";

const COR_FALLBACK = "#3B82F6";

export function ChecklistDiario() {
  const { disciplinasHoje, loading: loadingCronograma } = useCronograma();
  const checklist = useChecklist();

  const loading = loadingCronograma || checklist.loading;
  const total = disciplinasHoje.length;
  const concluidas = disciplinasHoje.filter((nome) => checklist.checklist[nome]).length;
  const progresso = total ? Math.round((concluidas / total) * 100) : 0;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-2">
        <ListChecks className="h-5 w-5 text-[var(--muted)]" />
        <CardTitle>Checklist Diário</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {loading ? (
          <p className="text-sm text-[var(--muted)]">Carregando...</p>
        ) : total === 0 ? (
          <p className="text-sm text-[var(--muted)]">Nenhuma disciplina programada para hoje.</p>
        ) : (
          <>
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">
                  {concluidas} de {total} concluídas
                </span>
                <span className="text-[var(--muted)]">{progresso}%</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                <div
                  className="h-full rounded-full bg-green-500 transition-all duration-300"
                  style={{ width: `${progresso}%` }}
                />
              </div>
            </div>

            <ul className="flex flex-col gap-2">
              {disciplinasHoje.map((nome) => {
                const id = nomeDisciplinaParaId(nome);
                const cor = (id && DISCIPLINA_POR_ID[id]?.cor) || COR_FALLBACK;
                const concluida = Boolean(checklist.checklist[nome]);
                return (
                  <li
                    key={nome}
                    className={cn(
                      "flex items-center gap-3 rounded-lg border border-[var(--border)] p-3 transition-colors",
                      concluida && "bg-slate-50 dark:bg-slate-800/50"
                    )}
                  >
                    <Checkbox
                      checked={concluida}
                      onChange={(novoValor) => checklist.marcar(nome, novoValor)}
                      color={cor}
                    />
                    <span
                      className={cn(
                        "text-sm font-medium",
                        concluida && "text-[var(--muted)] line-through"
                      )}
                    >
                      {nome}
                    </span>
                  </li>
                );
              })}
            </ul>
          </>
        )}
      </CardContent>
    </Card>
  );
}
