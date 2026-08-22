"use client";

import { useFetch, apiPost } from "./useFetch";
import { formatarDataISO } from "@/lib/utils";
import type { ChecklistDia } from "@/lib/types";

/** Checklist diário (marcar disciplina do cronograma como "estudei hoje"). */
export function useChecklist(data: string = formatarDataISO()) {
  const { data: checklist, loading, error, refetch } = useFetch<ChecklistDia>(
    `/api/checklist?data=${data}`
  );

  async function marcar(disciplina: string, concluida: boolean) {
    await apiPost<{ success: boolean }>("/api/checklist", { data, disciplina, concluida });
    refetch();
  }

  return { checklist: checklist ?? {}, loading, error, refetch, marcar };
}
