"use client";

import { useFetch, apiPost } from "./useFetch";
import type { Aula } from "@/lib/types";

/** Todas as aulas de todas as disciplinas, agrupadas por id de disciplina. */
export function useBiblioteca() {
  const { data, loading, error, refetch } = useFetch<Record<string, Aula[]>>("/api/biblioteca");
  return { aulasPorDisciplina: data ?? {}, loading, error, refetch };
}

/** Aulas de uma única disciplina. Passe `null` para pular a requisição. */
export function useAulasPorDisciplina(disciplinaId: string | null) {
  const { data, loading, error, refetch } = useFetch<Aula[]>(
    disciplinaId ? `/api/biblioteca/${disciplinaId}` : null
  );
  return { aulas: data ?? [], loading, error, refetch };
}

export async function marcarAula(disciplinaId: string, aulaId: string, concluida: boolean) {
  return apiPost<{ success: boolean; completadoEm: string | null; progresso: number }>(
    `/api/biblioteca/${disciplinaId}/${aulaId}/marcar`,
    { concluida }
  );
}

export async function sincronizarBiblioteca() {
  return apiPost<{ adicionadas: number; atualizadas: number; removidas: number }>(
    "/api/biblioteca/sincronizar"
  );
}
