"use client";

import { useState } from "react";
import { RefreshCw } from "lucide-react";
import { DisciplinaCard } from "@/components/DisciplinaCard";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { useDisciplinas } from "@/components/hooks/useDisciplinas";
import { cn } from "@/lib/utils";
import type { SyncResult } from "@/lib/types";

export function GridDisciplinas() {
  const { disciplinas, loading, error, refetch } = useDisciplinas();
  const { toast } = useToast();
  const [sincronizando, setSincronizando] = useState(false);

  async function sincronizarTudo() {
    setSincronizando(true);
    try {
      const res = await fetch("/api/biblioteca/sincronizar", { method: "POST" });
      const resultado = (await res.json()) as SyncResult & { error?: string };
      if (!res.ok) throw new Error(resultado.error || "Erro ao sincronizar");
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

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-end">
        <Button variant="secondary" onClick={sincronizarTudo} disabled={sincronizando}>
          <RefreshCw className={cn("h-4 w-4", sincronizando && "animate-spin")} />
          {sincronizando ? "Sincronizando..." : "Sincronizar com Google Drive"}
        </Button>
      </div>

      {loading ? (
        <p className="text-sm text-[var(--muted)]">Carregando...</p>
      ) : error ? (
        <p className="text-sm text-red-500">{error}</p>
      ) : disciplinas.length === 0 ? (
        <p className="text-sm text-[var(--muted)]">Nenhuma disciplina cadastrada.</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {disciplinas.map((disciplina) => (
            <DisciplinaCard key={disciplina.id} disciplina={disciplina} />
          ))}
        </div>
      )}
    </div>
  );
}
