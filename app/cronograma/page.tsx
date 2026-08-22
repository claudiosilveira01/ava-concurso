import { CronogramaVisual } from "@/components/CronogramaVisual";

export default function CronogramaPage() {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold">Cronograma Semanal</h1>
      <CronogramaVisual />
    </div>
  );
}
