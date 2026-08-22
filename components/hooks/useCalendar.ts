"use client";

import { useFetch, apiPost } from "./useFetch";
import type { EventoCalendario } from "@/lib/types";

export function useProximosEventos() {
  const { data, loading, error, refetch } = useFetch<EventoCalendario[]>("/api/calendar/proximos");
  return { eventos: data ?? [], loading, error, refetch };
}

export async function sincronizarCalendario(data?: string) {
  return apiPost<{ criadosGoogle: number; salvoSLocalmente: boolean; eventos: EventoCalendario[] }>(
    "/api/calendar/sincronizar",
    data ? { data } : undefined
  );
}
