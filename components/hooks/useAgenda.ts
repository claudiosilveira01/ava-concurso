"use client";

import { useFetch } from "./useFetch";
import type { AgendaHojeResponse } from "@/lib/types";

/** Agenda inteligente: a próxima aula pendente de cada disciplina de hoje, mais a
 * lista de revisão da semana (só vem preenchida quando hoje é sábado). */
export function useAgendaHoje() {
  const { data, loading, error, refetch } = useFetch<AgendaHojeResponse>("/api/dashboard/hoje");
  return {
    agenda: data?.agenda ?? [],
    revisaoSemana: data?.revisaoSemana ?? [],
    loading,
    error,
    refetch,
  };
}
