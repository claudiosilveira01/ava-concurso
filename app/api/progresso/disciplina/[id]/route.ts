import { NextResponse } from "next/server";
import { readPath } from "@/lib/store";
import { DISCIPLINA_POR_ID } from "@/lib/constants";
import type { Aula, Disciplina, Relatorio } from "@/lib/types";

// sempre roda no request, nunca cacheia estático (os dados mudam a qualquer momento)
export const dynamic = "force-dynamic";

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const config = DISCIPLINA_POR_ID[params.id];
    if (!config) {
      return NextResponse.json({ error: "Disciplina não encontrada" }, { status: 404 });
    }

    const disciplinaSalva = await readPath<Disciplina>(`disciplinas/${params.id}`);
    const disciplina: Disciplina = disciplinaSalva || {
      id: config.id,
      nome: config.nome,
      cor: config.cor,
      icone: config.icone,
      totalAulas: 0,
      totalAulasConcluidas: 0,
      progresso: 0,
      criadoEm: new Date(0).toISOString(),
    };

    const aulasSalvas = (await readPath<Record<string, Aula>>(`aulas/${params.id}`)) || {};
    const aulas = Object.values(aulasSalvas);

    const relatoriosSalvos = (await readPath<Record<string, Relatorio>>("relatorios")) || {};
    const relatoriosComDisciplina = Object.values(relatoriosSalvos).filter(
      (r) => params.id in r.desempenho
    );
    const desempenhoMedio = relatoriosComDisciplina.length
      ? relatoriosComDisciplina.reduce((soma, r) => soma + r.desempenho[params.id], 0) / relatoriosComDisciplina.length
      : 0;

    const ultimasAulas = [...aulas]
      .sort((a, b) => (b.data ?? "").localeCompare(a.data ?? ""))
      .slice(0, 5);

    return NextResponse.json(
      {
        id: disciplina.id,
        nome: disciplina.nome,
        totalAulas: disciplina.totalAulas,
        totalAulasConcluidas: disciplina.totalAulasConcluidas,
        progresso: disciplina.progresso,
        desempenhoMedio,
        ultimasAulas,
      },
      { status: 200 }
    );
  } catch (error) {
    const mensagem = error instanceof Error ? error.message : "Erro desconhecido";
    return NextResponse.json({ error: mensagem }, { status: 500 });
  }
}
