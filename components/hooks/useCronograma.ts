"use client";

import { useFetch } from "./useFetch";
import { diaSemanaAtual } from "@/lib/utils";
import type { Cronograma } from "@/lib/types";

export function useCronograma() {
  const { data, loading, error, refetch } = useFetch<Cronograma>("/api/cronograma");
  const diaAtual = diaSemanaAtual();
  const disciplinasHoje = data?.[diaAtual] ?? [];

  return { cronograma: data, disciplinasHoje, diaAtual, loading, error, refetch };
}
