"use client";

import Link from "next/link";
import { CalendarDays, CheckCircle2, ExternalLink, History } from "lucide-react";
import { useAgendaHoje } from "@/components/hooks/useAgenda";
import { useChecklist } from "@/components/hooks/useChecklist";
import { Checkbox } from "@/components/ui/Checkbox";
import { Card, CardContent } from "@/components/ui/Card";
import { DisciplinaIcon } from "@/components/ui/DisciplinaIcon";
import { DIAS_SEMANA_LABEL } from "@/lib/constants";
import { cn, diaSemanaAtual, formatarDataBR, formatarDataISO, slugify } from "@/lib/utils";
import type { AgendaDia, ItemRevisao } from "@/lib/types";

/** Uma linha da agenda: ou tem checkbox (hoje, editável) ou não (revisão da semana, só informativa). */
function LinhaAgenda({
  item,
  concluida,
  onToggle,
  badge,
}: {
  item: AgendaDia;
  concluida?: boolean;
  onToggle?: (valor: boolean) => void;
  badge?: string;
}) {
  const temAulaPendente = Boolean(item.aulaId);

  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-lg border border-[var(--border)] p-3 transition-colors",
        concluida && "bg-slate-50 dark:bg-slate-800/50"
      )}
      style={{ borderLeftColor: item.cor, borderLeftWidth: 3 }}
    >
      {onToggle ? (
        <Checkbox checked={Boolean(concluida)} onChange={onToggle} color={item.cor} />
      ) : (
        <DisciplinaIcon icone={item.icone} className="h-5 w-5 shrink-0" style={{ color: item.cor }} />
      )}

      <Link href={`/biblioteca?disciplina=${item.disciplinaId}`} className="flex min-w-0 flex-1 flex-col">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={cn("text-sm font-semibold", concluida && "text-[var(--muted)] line-through")}
            style={{ color: concluida ? undefined : item.cor }}
          >
            {item.disciplinaNome}
          </span>
          {badge && (
            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700 dark:bg-amber-900/40 dark:text-amber-400">
              {badge}
            </span>
          )}
        </div>
        {item.assunto ? (
          <span className={cn("truncate text-sm", concluida && "text-[var(--muted)]")}>
            {item.numero != null ? `Aula ${item.numero} — ` : ""}
            {item.assunto}
          </span>
        ) : item.totalAulas > 0 ? (
          <span className="flex items-center gap-1 text-sm text-[var(--muted)]">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Todas as aulas concluídas
          </span>
        ) : (
          <span className="text-sm text-[var(--muted)]">Nenhuma aula sincronizada ainda</span>
        )}
      </Link>

      {temAulaPendente && (
        <a
          href={`/api/biblioteca/${item.disciplinaId}/${item.aulaId}/arquivo`}
          target="_blank"
          rel="noopener noreferrer"
          title="Abrir aula"
          className="shrink-0 rounded-md p-1.5 text-[var(--muted)] transition-colors hover:bg-slate-100 hover:text-blue-600 dark:hover:bg-slate-800"
        >
          <ExternalLink className="h-4 w-4" />
        </a>
      )}
    </div>
  );
}

/** Dashboard: aulas de hoje + checklist de estudo, num só cartão. */
export function AgendaHojeCard() {
  const { agenda, revisaoSemana, loading } = useAgendaHoje();
  const checklist = useChecklist();
  const diaAtual = diaSemanaAtual();
  const dataHoje = formatarDataBR(formatarDataISO());

  const total = agenda.length;
  const concluidas = agenda.filter((item) => checklist.checklist[slugify(item.disciplinaNome)]).length;
  const progresso = total ? Math.round((concluidas / total) * 100) : 0;

  return (
    <Card className="border-l-4" style={{ borderLeftColor: "#3B82F6" }}>
      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5 text-blue-500" />
            <div>
              <p className="text-base font-bold">{DIAS_SEMANA_LABEL[diaAtual]}</p>
              <p className="text-sm text-[var(--muted)]">{dataHoje}</p>
            </div>
          </div>
          {total > 0 && (
            <div className="flex items-center gap-2">
              <div className="h-2 w-24 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                <div
                  className="h-full rounded-full bg-green-500 transition-all duration-300"
                  style={{ width: `${progresso}%` }}
                />
              </div>
              <span className="shrink-0 text-xs font-medium text-[var(--muted)]">
                {concluidas}/{total}
              </span>
            </div>
          )}
        </div>

        {loading ? (
          <p className="text-sm text-[var(--muted)]">Carregando...</p>
        ) : total === 0 ? (
          <p className="text-sm text-[var(--muted)]">Nenhuma disciplina programada para hoje.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {agenda.map((item) => (
              <li key={item.disciplinaId}>
                <LinhaAgenda
                  item={item}
                  concluida={checklist.checklist[slugify(item.disciplinaNome)]}
                  onToggle={(valor) => checklist.marcar(item.disciplinaNome, valor)}
                />
              </li>
            ))}
          </ul>
        )}

        {!loading && diaAtual === "sábado" && revisaoSemana.length > 0 && (
          <div className="flex flex-col gap-2 border-t border-[var(--border)] pt-4">
            <div className="flex items-center gap-2">
              <History className="h-4 w-4 text-amber-500" />
              <p className="text-sm font-semibold">Revisão da Semana</p>
            </div>
            <ul className="flex flex-col gap-2">
              {revisaoSemana.map((item: ItemRevisao) => (
                <li key={`${item.disciplinaId}-${item.dataOrigem}`}>
                  <LinhaAgenda item={item} badge={`atrasada desde ${DIAS_SEMANA_LABEL[item.diaOrigem]}`} />
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
