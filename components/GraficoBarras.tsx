"use client";

import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { useProgresso } from "@/components/hooks/useProgresso";
import { DISCIPLINA_POR_ID } from "@/lib/constants";

export function GraficoBarras() {
  const { progresso, loading, error } = useProgresso();

  const dados = Object.entries(progresso?.desempenhoPorDisciplina ?? {}).map(([id, valor]) => ({
    nome: DISCIPLINA_POR_ID[id]?.nome ?? id,
    valor,
    cor: DISCIPLINA_POR_ID[id]?.cor ?? "#3B82F6",
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Conclusão por Disciplina</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p className="text-sm text-[var(--muted)]">Carregando...</p>
        ) : error ? (
          <p className="text-sm text-red-500">{error}</p>
        ) : dados.length === 0 ? (
          <p className="text-sm text-[var(--muted)]">Nenhum dado de desempenho por disciplina ainda.</p>
        ) : (
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dados} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
                <XAxis dataKey="nome" tick={{ fontSize: 12 }} interval={0} angle={-20} textAnchor="end" height={60} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
                <Tooltip formatter={(value: number) => [`${value}%`, "Conclusão"]} />
                <Bar dataKey="valor" radius={[4, 4, 0, 0]}>
                  {dados.map((item) => (
                    <Cell key={item.nome} fill={item.cor} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
