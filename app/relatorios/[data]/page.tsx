import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Pencil } from "lucide-react";
import { readPath } from "@/lib/store";
import { Card, CardContent } from "@/components/ui/Card";
import type { Relatorio } from "@/lib/types";

export default async function RelatorioDetalhePage({
  params,
}: {
  params: { data: string };
}) {
  const relatorio = await readPath<Relatorio>(`relatorios/${params.data}`);

  if (!relatorio) {
    notFound();
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <Link
          href="/relatorios"
          className="flex items-center gap-1 text-sm text-[var(--muted)] hover:text-[var(--foreground)]"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Link>
        <Link
          href={`/relatorios/novo?data=${params.data}`}
          className="flex items-center gap-1 text-sm font-medium text-blue-600 hover:underline"
        >
          <Pencil className="h-4 w-4" />
          Editar
        </Link>
      </div>
      <Card>
        <CardContent>
          <pre className="whitespace-pre-wrap font-mono text-sm leading-relaxed">
            {relatorio.markdown}
          </pre>
        </CardContent>
      </Card>
    </div>
  );
}
