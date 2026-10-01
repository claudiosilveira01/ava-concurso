"use client";

import { useFetch } from "./useFetch";
import type { Progresso } from "@/lib/types";

export function useProgresso() {
  const { data, loading, error, refetch } = useFetch<Progresso>("/api/progresso");
  return { progresso: data, loading, error, refetch };
}
