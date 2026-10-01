import { GridDisciplinas } from "@/components/GridDisciplinas";
import { BibliotecaAulas } from "@/components/BibliotecaAulas";

export default function BibliotecaPage({
  searchParams,
}: {
  searchParams: { disciplina?: string };
}) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">Biblioteca</h1>
        <p className="text-sm text-[var(--muted)]">
          Suas disciplinas e todas as aulas, com busca e filtro num só lugar.
        </p>
      </div>
      <GridDisciplinas />
      <BibliotecaAulas disciplinaInicial={searchParams.disciplina} />
    </div>
  );
}
