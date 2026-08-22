"use client";

import Link from "next/link";
import { CalendarDays } from "lucide-react";
import { useCronograma } from "@/components/hooks/useCronograma";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { DIAS_SEMANA_LABEL, DISCIPLINA_POR_ID, nomeDisciplinaParaId } from "@/lib/constants";
import { formatarDataBR, formatarDataISO } from "@/lib/utils";

const COR_FALLBACK = "#3B82F6";

export function CartaoDoDia() {
  const { disciplinasHoje, diaAtual, loading } = useCronograma();
  const dataHoje = formatarDataBR(formatarDataISO());

  return (
    <Card
      className="border-l-4"
      style={{ borderLeftColor: "#3B82F6" }}
    >
      <CardContent className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <CalendarDays className="h-5 w-5 text-blue-500" />
          <div>
            <p className="text-base font-bold">{DIAS_SEMANA_LABEL[diaAtual]}</p>
            <p className="text-sm text-[var(--muted)]">{dataHoje}</p>
          </div>
        </div>

        {loading ? (
          <p className="text-sm text-[var(--muted)]">Carregando...</p>
        ) : disciplinasHoje.length === 0 ? (
          <p className="text-sm text-[var(--muted)]">Nenhuma disciplina programada para hoje.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {disciplinasHoje.map((nome) => {
              const id = nomeDisciplinaParaId(nome);
              const cor = (id && DISCIPLINA_POR_ID[id]?.cor) || COR_FALLBACK;
              const badge = (
                <Badge
                  key={nome}
                  style={{ backgroundColor: `${cor}1A`, color: cor }}
                >
                  {nome}
                </Badge>
              );
              if (!id) return badge;
              return (
                <Link key={nome} href={`/biblioteca?disciplina=${id}`}>
                  {badge}
                </Link>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
