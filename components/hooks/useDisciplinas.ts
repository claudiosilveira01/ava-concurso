"use client";

import { useFetch } from "./useFetch";
import type { Disciplina } from "@/lib/types";

export function useDisciplinas() {
  const { data, loading, error, refetch } = useFetch<Disciplina[]>("/api/disciplinas");
  return { disciplinas: data ?? [], loading, error, refetch };
}
