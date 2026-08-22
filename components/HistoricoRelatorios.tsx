"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Eye, Pencil, Download, Trash2, FileText, TrendingUp } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { useRelatorios, deletarRelatorio } from "@/components/hooks/useRelatorios";
import { DISCIPLINA_POR_ID } from "@/lib/constants";
import { formatarDataBR } from "@/lib/utils";
import type { Relatorio } from "@/lib/types";

function nomesDisciplinas(ids: string[]): string {
  return ids.map((id) => DISCIPLINA_POR_ID[id]?.nome ?? id).join(", ") || "—";
}

export function HistoricoRelatorios() {
  const { relatorios, total, loading, error, refetch } = useRelatorios();
  const { toast } = useToast();
  const [exportando, setExportando] = useState<string | null>(null);
  const [deletando, setDeletando] = useState<string | null>(null);

  const desempenhoMedioGeral = useMemo(() => {
    if (relatorios.length === 0) return 0;
    return Math.round(
      relatorios.reduce((acc, r) => acc + r.desempenhoMedio, 0) / relatorios.length
    );
  }, [relatorios]);

  async function handleExportar(data: string) {
    setExportando(data);
    try {
      const res = await fetch(`/api/export/relatorio/${data}`);
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error || `Erro ${res.status}`);

      const blob = new Blob([body.markdown ?? ""], { type: "text/markdown" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `relatorio-${data}.md`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast("Relatório exportado com sucesso", "success");
    } catch (err) {
      toast(err instanceof Error ? err.message : "Erro ao exportar relatório", "error");
    } finally {
      setExportando(null);
    }
  }

  async function handleDeletar(data: string) {
    const confirmado = window.confirm(
      `Deletar o relatório de ${formatarDataBR(data)}? Essa ação não pode ser desfeita.`
    );
    if (!confirmado) return;

    setDeletando(data);
    try {
      await deletarRelatorio(data);
      toast("Relatório deletado", "success");
      refetch();
    } catch (err) {
      toast(err instanceof Error ? err.message : "Erro ao deletar relatório", "error");
    } finally {
      setDeletando(null);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="rounded-lg bg-blue-100 p-2 dark:bg-blue-900/40">
              <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-medium text-[var(--muted)]">Total de relatórios</span>
              <span className="text-xl font-bold">{total}</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="rounded-lg bg-green-100 p-2 dark:bg-green-900/40">
              <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-medium text-[var(--muted)]">Desempenho médio geral</span>
              <span className="text-xl font-bold">{desempenhoMedioGeral}%</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {loading ? (
        <p className="text-sm text-[var(--muted)]">Carregando...</p>
      ) : error ? (
        <p className="text-sm text-red-500">{error}</p>
      ) : relatorios.length === 0 ? (
        <p className="text-sm text-[var(--muted)]">
          Nenhum relatório ainda — crie o primeiro em{" "}
          <Link href="/relatorios/novo" className="font-medium text-blue-600 hover:underline dark:text-blue-400">
            /relatorios/novo
          </Link>
        </p>
      ) : (
        <>
          <Card className="hidden overflow-x-auto md:block">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-left text-xs font-medium text-[var(--muted)]">
                  <th className="p-4">Data</th>
                  <th className="p-4">Disciplinas</th>
                  <th className="p-4">Desempenho médio</th>
                  <th className="p-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody>
                {relatorios.map((relatorio: Relatorio) => (
                  <tr key={relatorio.data} className="border-b border-[var(--border)] last:border-0">
                    <td className="p-4 font-medium">{formatarDataBR(relatorio.data)}</td>
                    <td className="max-w-xs p-4">
                      <span
                        className="block truncate"
                        title={nomesDisciplinas(relatorio.disciplinasEstudadas)}
                      >
                        {nomesDisciplinas(relatorio.disciplinasEstudadas)}
                      </span>
                    </td>
                    <td className="p-4">{relatorio.desempenhoMedio}%</td>
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/relatorios/${relatorio.data}`}
                          className="inline-flex items-center gap-1 rounded-lg border border-[var(--border)] px-2.5 py-1.5 text-xs font-medium transition-colors hover:bg-slate-100 dark:hover:bg-slate-800"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          Ver
                        </Link>
                        <Link
                          href={`/relatorios/novo?data=${relatorio.data}`}
                          className="inline-flex items-center gap-1 rounded-lg border border-[var(--border)] px-2.5 py-1.5 text-xs font-medium transition-colors hover:bg-slate-100 dark:hover:bg-slate-800"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                          Editar
                        </Link>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-auto px-2.5 py-1.5 text-xs"
                          onClick={() => handleExportar(relatorio.data)}
                          disabled={exportando === relatorio.data}
                        >
                          <Download className="h-3.5 w-3.5" />
                          {exportando === relatorio.data ? "Exportando..." : "Exportar"}
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          className="h-auto px-2.5 py-1.5 text-xs"
                          onClick={() => handleDeletar(relatorio.data)}
                          disabled={deletando === relatorio.data}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          {deletando === relatorio.data ? "Deletando..." : "Deletar"}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>

          <div className="flex flex-col gap-3 md:hidden">
            {relatorios.map((relatorio: Relatorio) => (
              <Card key={relatorio.data}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle>{formatarDataBR(relatorio.data)}</CardTitle>
                    <span className="text-sm font-bold">{relatorio.desempenhoMedio}%</span>
                  </div>
                </CardHeader>
                <CardContent className="flex flex-col gap-3 pt-0">
                  <span
                    className="block truncate text-sm text-[var(--muted)]"
                    title={nomesDisciplinas(relatorio.disciplinasEstudadas)}
                  >
                    {nomesDisciplinas(relatorio.disciplinasEstudadas)}
                  </span>
                  <div className="flex flex-wrap items-center gap-2">
                    <Link
                      href={`/relatorios/${relatorio.data}`}
                      className="inline-flex items-center gap-1 rounded-lg border border-[var(--border)] px-2.5 py-1.5 text-xs font-medium transition-colors hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      Ver
                    </Link>
                    <Link
                      href={`/relatorios/novo?data=${relatorio.data}`}
                      className="inline-flex items-center gap-1 rounded-lg border border-[var(--border)] px-2.5 py-1.5 text-xs font-medium transition-colors hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      Editar
                    </Link>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-auto px-2.5 py-1.5 text-xs"
                      onClick={() => handleExportar(relatorio.data)}
                      disabled={exportando === relatorio.data}
                    >
                      <Download className="h-3.5 w-3.5" />
                      {exportando === relatorio.data ? "Exportando..." : "Exportar"}
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      className="h-auto px-2.5 py-1.5 text-xs"
                      onClick={() => handleDeletar(relatorio.data)}
                      disabled={deletando === relatorio.data}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      {deletando === relatorio.data ? "Deletando..." : "Deletar"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
