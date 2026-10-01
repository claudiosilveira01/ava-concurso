"use client";

import { DisciplinaCard } from "@/components/DisciplinaCard";
import { useDisciplinas } from "@/components/hooks/useDisciplinas";

export function GridDisciplinas() {
  const { disciplinas, loading, error } = useDisciplinas();

  if (loading) return <p className="text-sm text-[var(--muted)]">Carregando disciplinas...</p>;
  if (error) return <p className="text-sm text-red-500">{error}</p>;
  if (disciplinas.length === 0) {
    return <p className="text-sm text-[var(--muted)]">Nenhuma disciplina cadastrada.</p>;
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {disciplinas.map((disciplina) => (
        <DisciplinaCard key={disciplina.id} disciplina={disciplina} />
      ))}
    </div>
  );
}
