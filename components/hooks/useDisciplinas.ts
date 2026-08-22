"use client";

import { useFetch, apiPost } from "./useFetch";
import type { Disciplina } from "@/lib/types";

export function useDisciplinas() {
  const { data, loading, error, refetch } = useFetch<Disciplina[]>("/api/disciplinas");

  async function sincronizar(id: string) {
    const resultado = await apiPost<{ mensagem: string; totalAulas: number }>(
      `/api/disciplinas/${id}/sincronizar`
    );
    refetch();
    return resultado;
  }

  return { disciplinas: data ?? [], loading, error, refetch, sincronizar };
}
