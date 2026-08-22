import { CardsMetricas } from "@/components/CardsMetricas";
import { GraficoBarras } from "@/components/GraficoBarras";
import { GraficoLinhas } from "@/components/GraficoLinhas";

export default function ProgressoPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">Progresso</h1>
      <CardsMetricas />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <GraficoBarras />
        <GraficoLinhas />
      </div>
    </div>
  );
}
