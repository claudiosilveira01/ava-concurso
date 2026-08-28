"use client";

import Link from "next/link";
import { CalendarDays, ExternalLink, CheckCircle2, History } from "lucide-react";
import { useCronograma } from "@/components/hooks/useCronograma";
import { useAgendaHoje } from "@/components/hooks/useAgenda";
import { Card, CardContent } from "@/components/ui/Card";
import { DisciplinaIcon } from "@/components/ui/DisciplinaIcon";
import { DIAS_SEMANA_LABEL } from "@/lib/constants";
import { formatarDataBR, formatarDataISO } from "@/lib/utils";
import type { AgendaDia, ItemRevisao } from "@/lib/types";

/** Card de uma disciplina (agenda normal ou item de revisão — ItemRevisao estende AgendaDia). */
function CardItemAgenda({ item, badge }: { item: AgendaDia; badge?: string }) {
  const conteudo = (
    <div
      className="flex items-center gap-3 rounded-lg border border-[var(--border)] p-3 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50"
      style={{ borderLeftColor: item.cor, borderLeftWidth: 3 }}
    >
      <DisciplinaIcon icone={item.icone} className="h-5 w-5 shrink-0" style={{ color: item.cor }} />
      <div className="flex flex-1 flex-col">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold" style={{ color: item.cor }}>
            {item.disciplinaNome}
          </span>
          {badge && (
            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700 dark:bg-amber-900/40 dark:text-amber-400">
              {badge}
            </span>
          )}
        </div>
        {item.assunto ? (
          <span className="text-sm">{item.assunto}</span>
        ) : item.totalAulas > 0 ? (
          <span className="flex items-center gap-1 text-sm text-[var(--muted)]">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Todas as aulas concluídas
          </span>
        ) : (
          <span className="text-sm text-[var(--muted)]">Nenhuma aula sincronizada ainda</span>
        )}
      </div>
      {item.assunto && <ExternalLink className="h-4 w-4 shrink-0 text-[var(--muted)]" />}
    </div>
  );

  if (item.aulaId) {
    return (
      <a href={`/api/biblioteca/${item.disciplinaId}/${item.aulaId}/arquivo`} target="_blank" rel="noopener noreferrer">
        {conteudo}
      </a>
    );
  }
  return <Link href={`/biblioteca?disciplina=${item.disciplinaId}`}>{conteudo}</Link>;
}

export function CartaoDoDia() {
  const { diaAtual, loading: carregandoCronograma } = useCronograma();
  const { agenda, revisaoSemana, loading: carregandoAgenda } = useAgendaHoje();
  const dataHoje = formatarDataBR(formatarDataISO());
  const loading = carregandoCronograma || carregandoAgenda;

  return (
    <Card className="border-l-4" style={{ borderLeftColor: "#3B82F6" }}>
      <CardContent className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <CalendarDays className="h-5 w-5 text-blue-500" />
          <div>
            <p className="text-base font-bold">{DIAS_SEMANA_LABEL[diaAtual]}</p>
            <p className="text-sm text-[var(--muted)]">{dataHoje}</p>
          </div>
        </div>

        {loading ? (
          <p className="text-sm text-[var(--muted)]">Carregando...</p>
        ) : agenda.length === 0 ? (
          <p className="text-sm text-[var(--muted)]">Nenhuma disciplina programada para hoje.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {agenda.map((item) => (
              <li key={item.disciplinaId}>
                <CardItemAgenda item={item} />
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
                  <CardItemAgenda item={item} badge={`atrasada desde ${DIAS_SEMANA_LABEL[item.diaOrigem]}`} />
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
