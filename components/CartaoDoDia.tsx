"use client";

import Link from "next/link";
import { CalendarDays, ExternalLink, CheckCircle2 } from "lucide-react";
import { useCronograma } from "@/components/hooks/useCronograma";
import { useAgendaHoje } from "@/components/hooks/useAgenda";
import { Card, CardContent } from "@/components/ui/Card";
import { DisciplinaIcon } from "@/components/ui/DisciplinaIcon";
import { DIAS_SEMANA_LABEL } from "@/lib/constants";
import { formatarDataBR, formatarDataISO } from "@/lib/utils";

export function CartaoDoDia() {
  const { diaAtual, loading: carregandoCronograma } = useCronograma();
  const { agenda, loading: carregandoAgenda } = useAgendaHoje();
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
            {agenda.map((item) => {
              const conteudo = (
                <div
                  className="flex items-center gap-3 rounded-lg border border-[var(--border)] p-3 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50"
                  style={{ borderLeftColor: item.cor, borderLeftWidth: 3 }}
                >
                  <DisciplinaIcon icone={item.icone} className="h-5 w-5 shrink-0" style={{ color: item.cor }} />
                  <div className="flex flex-1 flex-col">
                    <span className="text-sm font-semibold" style={{ color: item.cor }}>
                      {item.disciplinaNome}
                    </span>
                    {item.assunto ? (
                      <span className="text-sm">{item.assunto}</span>
                    ) : item.totalAulas > 0 ? (
                      <span className="flex items-center gap-1 text-sm text-[var(--muted)]">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Todas as aulas concluídas
                      </span>
                    ) : (
                      <span className="text-sm text-[var(--muted)]">
                        Nenhuma aula sincronizada ainda
                      </span>
                    )}
                  </div>
                  {item.assunto && <ExternalLink className="h-4 w-4 shrink-0 text-[var(--muted)]" />}
                </div>
              );

              if (item.aulaId) {
                return (
                  <li key={item.disciplinaId}>
                    <a
                      href={`/api/biblioteca/${item.disciplinaId}/${item.aulaId}/arquivo`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {conteudo}
                    </a>
                  </li>
                );
              }
              return (
                <li key={item.disciplinaId}>
                  <Link href={`/biblioteca?disciplina=${item.disciplinaId}`}>{conteudo}</Link>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
