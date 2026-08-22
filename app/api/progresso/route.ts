import { NextResponse } from "next/server";
import { readPath } from "@/lib/store";
import { calcularDiasConsecutivos } from "@/lib/utils";
import type { Disciplina, Progresso, Relatorio } from "@/lib/types";

export async function GET() {
  try {
    const progressoSalvo = await readPath<Progresso>("progresso");
    if (progressoSalvo) {
      return NextResponse.json(progressoSalvo, { status: 200 });
    }

    const relatoriosSalvos = (await readPath<Record<string, Relatorio>>("relatorios")) || {};
    const disciplinasSalvas = (await readPath<Record<string, Disciplina>>("disciplinas")) || {};
    const relatorios = Object.values(relatoriosSalvos);
    const disciplinas = Object.values(disciplinasSalvas);

    const totalRelatorios = relatorios.length;
    const diasConsecutivos = calcularDiasConsecutivos(relatorios.map((r) => r.data));
    const desempenhoMedio = totalRelatorios
      ? relatorios.reduce((soma, r) => soma + r.desempenhoMedio, 0) / totalRelatorios
      : 0;

    const somaPorDisciplina: Record<string, number> = {};
    const contagemPorDisciplina: Record<string, number> = {};
    for (const relatorio of relatorios) {
      for (const [disciplinaId, nota] of Object.entries(relatorio.desempenho)) {
        somaPorDisciplina[disciplinaId] = (somaPorDisciplina[disciplinaId] || 0) + nota;
        contagemPorDisciplina[disciplinaId] = (contagemPorDisciplina[disciplinaId] || 0) + 1;
      }
    }
    const desempenhoPorDisciplina: Record<string, number> = {};
    for (const disciplinaId of Object.keys(somaPorDisciplina)) {
      desempenhoPorDisciplina[disciplinaId] = somaPorDisciplina[disciplinaId] / contagemPorDisciplina[disciplinaId];
    }

    const totalAulasCompletadas = disciplinas.reduce((soma, d) => soma + d.totalAulasConcluidas, 0);

    const progresso: Progresso = {
      totalAulasCompletadas,
      totalRelatorios,
      diasConsecutivos,
      desempenhoMedio,
      desempenhoPorDisciplina,
      ultimaAtualizacao: new Date().toISOString(),
    };

    return NextResponse.json(progresso, { status: 200 });
  } catch (error) {
    const mensagem = error instanceof Error ? error.message : "Erro desconhecido";
    return NextResponse.json({ error: mensagem }, { status: 500 });
  }
}
