"use client";

import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { useFetch } from "@/components/hooks/useFetch";
import { formatarDataBR } from "@/lib/utils";

interface HistoricoSemana {
  semana: string;
  aulasConcluidas: number;
}

export function GraficoLinhas() {
  const { data, loading, error } = useFetch<HistoricoSemana[]>("/api/progresso/historico?semanas=4");
  const semDados = !data || data.every((s) => s.aulasConcluidas === 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Aulas Concluídas — Últimas 4 Semanas</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p className="text-sm text-[var(--muted)]">Carregando...</p>
        ) : error ? (
          <p className="text-sm text-red-500">{error}</p>
        ) : semDados ? (
          <p className="text-sm text-[var(--muted)]">Nenhuma aula concluída nesse período ainda.</p>
        ) : (
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
                <XAxis dataKey="semana" tickFormatter={formatarDataBR} tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                <Tooltip
                  labelFormatter={(value: string) => formatarDataBR(value)}
                  formatter={(value: number) => [`${value}`, "Aulas concluídas"]}
                />
                <Line type="monotone" dataKey="aulasConcluidas" stroke="#3B82F6" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
