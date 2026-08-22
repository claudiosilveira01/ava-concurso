"use client";

import { useFetch, apiPost, apiPut, apiDelete } from "./useFetch";
import type { Relatorio, RelatorioFormData } from "@/lib/types";

export function useRelatorios(limit = 50, offset = 0) {
  const { data, loading, error, refetch } = useFetch<{ relatorios: Relatorio[]; total: number }>(
    `/api/relatorios?limit=${limit}&offset=${offset}`
  );
  return {
    relatorios: data?.relatorios ?? [],
    total: data?.total ?? 0,
    loading,
    error,
    refetch,
  };
}

export function useRelatorio(data: string | null) {
  const { data: relatorio, loading, error, refetch } = useFetch<Relatorio>(
    data ? `/api/relatorios/${data}` : null
  );
  return { relatorio, loading, error, refetch };
}

export async function criarRelatorio(dados: RelatorioFormData) {
  return apiPost<Relatorio>("/api/relatorios", dados);
}

export async function atualizarRelatorio(data: string, dados: RelatorioFormData) {
  return apiPut<Relatorio>(`/api/relatorios/${data}`, dados);
}

export async function deletarRelatorio(data: string) {
  return apiDelete<{ success: boolean }>(`/api/relatorios/${data}`);
}
