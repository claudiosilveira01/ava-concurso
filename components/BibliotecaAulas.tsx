"use client";

import { useMemo, useState } from "react";
import { ExternalLink, RefreshCw } from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import { Select } from "@/components/ui/Select";
import { Input } from "@/components/ui/Input";
import { Checkbox } from "@/components/ui/Checkbox";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import {
  useBiblioteca,
  useAulasPorDisciplina,
  marcarAula,
  sincronizarBiblioteca,
} from "@/components/hooks/useAulas";
import { DISCIPLINAS_CONFIG, DISCIPLINA_POR_ID } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { Aula } from "@/lib/types";

const COR_FALLBACK = "#3B82F6";

interface AulaComDisciplina extends Aula {
  disciplinaId: string;
}

export function BibliotecaAulas({ disciplinaInicial }: { disciplinaInicial?: string }) {
  const [disciplinaSelecionada, setDisciplinaSelecionada] = useState<string>(
    disciplinaInicial || "todas"
  );
  const [busca, setBusca] = useState("");
  const [sincronizando, setSincronizando] = useState(false);
  const { toast } = useToast();

  const todas = disciplinaSelecionada === "todas";
  const biblioteca = useBiblioteca();
  const porDisciplina = useAulasPorDisciplina(todas ? null : disciplinaSelecionada);

  const aulas: AulaComDisciplina[] = useMemo(() => {
    if (todas) {
      return Object.entries(biblioteca.aulasPorDisciplina).flatMap(([disciplinaId, lista]) =>
        lista.map((aula) => ({ ...aula, disciplinaId }))
      );
    }
    return porDisciplina.aulas.map((aula) => ({ ...aula, disciplinaId: aula.disciplina }));
  }, [todas, biblioteca.aulasPorDisciplina, porDisciplina.aulas]);

  const loading = todas ? biblioteca.loading : porDisciplina.loading;
  const error = todas ? biblioteca.error : porDisciplina.error;
  const refetch = todas ? biblioteca.refetch : porDisciplina.refetch;

  const aulasFiltradas = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    if (!termo) return aulas;
    return aulas.filter(
      (aula) => aula.titulo.toLowerCase().includes(termo) || String(aula.numero).includes(termo)
    );
  }, [aulas, busca]);

  async function sincronizar() {
    setSincronizando(true);
    try {
      const resultado = await sincronizarBiblioteca();
      toast(
        `${resultado.adicionadas} aulas adicionadas, ${resultado.atualizadas} atualizadas`,
        "success"
      );
      refetch();
    } catch (err) {
      toast(err instanceof Error ? err.message : "Erro ao sincronizar com o Google Drive", "error");
    } finally {
      setSincronizando(false);
    }
  }

  async function alternarConcluida(aula: AulaComDisciplina, novoValor: boolean) {
    try {
      await marcarAula(aula.disciplina, aula.id, novoValor);
      refetch();
    } catch (err) {
      toast(err instanceof Error ? err.message : "Erro ao atualizar aula", "error");
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-col gap-3 sm:flex-row">
          <Select
            value={disciplinaSelecionada}
            onChange={(e) => setDisciplinaSelecionada(e.target.value)}
            className="sm:max-w-xs"
          >
            <option value="todas">Todas as disciplinas</option>
            {DISCIPLINAS_CONFIG.map((disciplina) => (
              <option key={disciplina.id} value={disciplina.id}>
                {disciplina.emoji} {disciplina.nome}
              </option>
            ))}
          </Select>
          <Input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar por título ou número da aula..."
            className="sm:max-w-sm"
          />
        </div>
        <Button variant="secondary" onClick={sincronizar} disabled={sincronizando}>
          <RefreshCw className={cn("h-4 w-4", sincronizando && "animate-spin")} />
          {sincronizando ? "Sincronizando..." : "Sincronizar"}
        </Button>
      </div>

      {loading ? (
        <p className="text-sm text-[var(--muted)]">Carregando...</p>
      ) : error ? (
        <p className="text-sm text-red-500">{error}</p>
      ) : aulasFiltradas.length === 0 ? (
        <p className="text-sm text-[var(--muted)]">
          Nenhuma aula encontrada — sincronize com o Google Drive ou ajuste os filtros
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          {aulasFiltradas.map((aula) => {
            const config = DISCIPLINA_POR_ID[aula.disciplinaId];
            const cor = config?.cor || COR_FALLBACK;
            const nomeDisciplina = config?.nome || aula.disciplinaId;
            return (
              <Card key={`${aula.disciplinaId}-${aula.id}`}>
                <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3">
                    <Checkbox
                      checked={aula.concluida}
                      onChange={(novoValor) => alternarConcluida(aula, novoValor)}
                      color={cor}
                    />
                    <div className="flex flex-col">
                      <span
                        className={cn(
                          "text-sm font-semibold",
                          aula.concluida && "text-[var(--muted)] line-through"
                        )}
                      >
                        Aula {aula.numero} — {aula.titulo}
                      </span>
                      <span className="text-xs font-medium" style={{ color: cor }}>
                        {nomeDisciplina}
                      </span>
                    </div>
                  </div>
                  <a
                    href={aula.googleDriveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 self-start rounded-lg border border-[var(--border)] px-3 py-2 text-sm font-medium transition-colors hover:bg-slate-100 dark:hover:bg-slate-800 sm:self-auto"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Abrir
                  </a>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
