import Link from "next/link";
import { Plus } from "lucide-react";
import { HistoricoRelatorios } from "@/components/HistoricoRelatorios";
import { Button } from "@/components/ui/Button";

export default function RelatoriosPage() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Relatórios</h1>
        <Link href="/relatorios/novo">
          <Button>
            <Plus className="h-4 w-4" />
            Novo Relatório
          </Button>
        </Link>
      </div>
      <HistoricoRelatorios />
    </div>
  );
}
