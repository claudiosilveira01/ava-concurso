"use client";

import { useFetch } from "./useFetch";
import type { AgendaDia } from "@/lib/types";

/** Agenda inteligente: para cada disciplina do cronograma de hoje, a próxima aula pendente. */
export function useAgendaHoje() {
  const { data, loading, error, refetch } = useFetch<AgendaDia[]>("/api/dashboard/hoje");
  return { agenda: data ?? [], loading, error, refetch };
}
