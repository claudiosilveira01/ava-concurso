import Link from "next/link";
import { Card, CardContent } from "@/components/ui/Card";
import { DisciplinaIcon } from "@/components/ui/DisciplinaIcon";
import { DISCIPLINA_POR_ID } from "@/lib/constants";
import type { Disciplina } from "@/lib/types";

const COR_FALLBACK = "#3B82F6";

export function DisciplinaCard({ disciplina }: { disciplina: Disciplina }) {
  const config = DISCIPLINA_POR_ID[disciplina.id];
  const nome = disciplina.nome || config?.nome || disciplina.id;
  const cor = disciplina.cor || config?.cor || COR_FALLBACK;

  return (
    <Link href={`/biblioteca?disciplina=${disciplina.id}`} className="block">
      <Card className="h-full transition-shadow hover:shadow-md">
        <CardContent className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <DisciplinaIcon disciplinaId={disciplina.id} className="h-6 w-6" style={{ color: cor }} />
            <h3 className="text-base font-bold">{nome}</h3>
          </div>

          <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
            <div
              className="h-full rounded-full transition-all"
              style={{ width: `${disciplina.progresso}%`, backgroundColor: cor }}
            />
          </div>

          <div className="flex items-center justify-between text-sm text-[var(--muted)]">
            <span>
              {disciplina.totalAulasConcluidas} de {disciplina.totalAulas} aulas concluídas
            </span>
            <span className="font-semibold" style={{ color: cor }}>
              {disciplina.progresso}%
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
