import { GridDisciplinas } from "@/components/GridDisciplinas";

export default function DisciplinasPage() {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold">Disciplinas</h1>
      <GridDisciplinas />
    </div>
  );
}
