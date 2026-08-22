import { NextRequest, NextResponse } from "next/server";
import { readPath } from "@/lib/store";
import { calcularDiasConsecutivos, formatarDataISO, inicioDaSemana } from "@/lib/utils";
import type { ProgressoSemanal, Relatorio } from "@/lib/types";

// sempre roda no request, nunca cacheia estático (os dados mudam a qualquer momento)
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const semanaParam = request.nextUrl.searchParams.get("semana");
    if (!semanaParam) {
      return NextResponse.json({ error: "Parâmetro 'semana' é obrigatório" }, { status: 400 });
    }

    const segunda = inicioDaSemana(semanaParam);
    const domingoData = new Date(`${segunda}T00:00:00`);
    domingoData.setDate(domingoData.getDate() + 6);
    const domingo = formatarDataISO(domingoData);

    const relatoriosSalvos = (await readPath<Record<string, Relatorio>>("relatorios")) || {};
    const relatoriosDaSemana = Object.values(relatoriosSalvos).filter(
      (r) => r.data >= segunda && r.data <= domingo
    );

    if (relatoriosDaSemana.length === 0) {
      return NextResponse.json({ error: "Nenhum relatório encontrado para essa semana" }, { status: 404 });
    }

    const totalRelatorios = relatoriosDaSemana.length;
    const diasConsecutivos = calcularDiasConsecutivos(relatoriosDaSemana.map((r) => r.data));
    const desempenhoMedio =
      relatoriosDaSemana.reduce((soma, r) => soma + r.desempenhoMedio, 0) / totalRelatorios;

    const somaPorDisciplina: Record<string, number> = {};
    const contagemPorDisciplina: Record<string, number> = {};
    for (const relatorio of relatoriosDaSemana) {
      for (const [disciplinaId, nota] of Object.entries(relatorio.desempenho)) {
        somaPorDisciplina[disciplinaId] = (somaPorDisciplina[disciplinaId] || 0) + nota;
        contagemPorDisciplina[disciplinaId] = (contagemPorDisciplina[disciplinaId] || 0) + 1;
      }
    }
    const desempenhoPorDisciplina: Record<string, number> = {};
    for (const disciplinaId of Object.keys(somaPorDisciplina)) {
      desempenhoPorDisciplina[disciplinaId] = somaPorDisciplina[disciplinaId] / contagemPorDisciplina[disciplinaId];
    }

    // MVP: o app ainda não rastreia aulas concluídas por data, então cada relatório diário é usado como proxy de uma aula concluída.
    const progressoSemanal: ProgressoSemanal = {
      semana: segunda,
      totalAulasConcluidas: totalRelatorios,
      totalRelatorios,
      diasConsecutivos,
      desempenhoMedio,
      desempenhoPorDisciplina,
      atualizado: new Date().toISOString(),
    };

    return NextResponse.json(progressoSemanal, { status: 200 });
  } catch (error) {
    const mensagem = error instanceof Error ? error.message : "Erro desconhecido";
    return NextResponse.json({ error: mensagem }, { status: 500 });
  }
}
