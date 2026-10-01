import { NextResponse } from "next/server";
import { readPath } from "@/lib/store";
import { calcularDiasConsecutivos } from "@/lib/utils";
import type { Aula, Disciplina, Progresso } from "@/lib/types";

// sempre roda no request, nunca cacheia estático (os dados mudam a qualquer momento)
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const disciplinasSalvas = (await readPath<Record<string, Disciplina>>("disciplinas")) || {};
    const disciplinas = Object.values(disciplinasSalvas);

    // "Dias consecutivos" agora vem direto das aulas marcadas como concluídas
    // (campo completadoEm), sem depender de relatórios diários.
    const todasAulas = (await readPath<Record<string, Record<string, Aula>>>("aulas")) || {};
    const datasConclusao: string[] = [];
    for (const aulasDaDisciplina of Object.values(todasAulas)) {
      for (const aula of Object.values(aulasDaDisciplina)) {
        if (aula.completadoEm) datasConclusao.push(aula.completadoEm.slice(0, 10));
      }
    }

    const totalAulasCompletadas = disciplinas.reduce((soma, d) => soma + d.totalAulasConcluidas, 0);
    const totalAulasGeral = disciplinas.reduce((soma, d) => soma + d.totalAulas, 0);
    const progressoGeral = totalAulasGeral ? Math.round((totalAulasCompletadas / totalAulasGeral) * 100) : 0;
    const disciplinasConcluidas = disciplinas.filter(
      (d) => d.totalAulas > 0 && d.totalAulasConcluidas === d.totalAulas
    ).length;

    const progresso: Progresso = {
      totalAulasCompletadas,
      totalAulasGeral,
      progressoGeral,
      diasConsecutivos: calcularDiasConsecutivos(datasConclusao),
      disciplinasConcluidas,
      ultimaAtualizacao: new Date().toISOString(),
    };

    return NextResponse.json(progresso, { status: 200 });
  } catch (error) {
    const mensagem = error instanceof Error ? error.message : "Erro desconhecido";
    return NextResponse.json({ error: mensagem }, { status: 500 });
  }
}
