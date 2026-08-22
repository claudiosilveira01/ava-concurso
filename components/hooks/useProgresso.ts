"use client";

import { useFetch } from "./useFetch";
import type { Progresso, ProgressoSemanal } from "@/lib/types";

export function useProgresso() {
  const { data, loading, error, refetch } = useFetch<Progresso>("/api/progresso");
  return { progresso: data, loading, error, refetch };
}

export function useProgressoSemanal(semana: string | null) {
  const { data, loading, error, refetch } = useFetch<ProgressoSemanal>(
    semana ? `/api/progresso/semanal?semana=${semana}` : null
  );
  return { progressoSemanal: data, loading, error, refetch };
}
