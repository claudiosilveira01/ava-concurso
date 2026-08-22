import { NextResponse } from "next/server";
import { readPath, writePath } from "@/lib/store";
import { relatorioFormSchema } from "@/lib/validation";
import { gerarMarkdownRelatorio } from "@/lib/markdown";
import { calcularDiasConsecutivos, formatarDataISO } from "@/lib/utils";
import type { Disciplina, Progresso, Relatorio } from "@/lib/types";

// sempre roda no request, nunca cacheia estático (os dados mudam a qualquer momento)
export const dynamic = "force-dynamic";

/** Recalcula e grava "progresso" a partir do estado atual de "relatorios" e "disciplinas". */
async function recalcularProgresso(): Promise<void> {
  const relatorios = (await readPath<Record<string, Relatorio>>("relatorios")) || {};
  const listaRelatorios = Object.values(relatorios);
  const totalRelatorios = listaRelatorios.length;

  const desempenhoMedio = totalRelatorios
    ? Math.round(listaRelatorios.reduce((acc, r) => acc + r.desempenhoMedio, 0) / totalRelatorios)
    : 0;

  const somaPorDisciplina: Record<string, { soma: number; quantidade: number }> = {};
  for (const relatorio of listaRelatorios) {
    for (const [disciplina, valor] of Object.entries(relatorio.desempenho)) {
      const acumulado = somaPorDisciplina[disciplina] || { soma: 0, quantidade: 0 };
      acumulado.soma += valor;
      acumulado.quantidade += 1;
      somaPorDisciplina[disciplina] = acumulado;
    }
  }
  const desempenhoPorDisciplina: Record<string, number> = {};
  for (const [disciplina, { soma, quantidade }] of Object.entries(somaPorDisciplina)) {
    desempenhoPorDisciplina[disciplina] = Math.round(soma / quantidade);
  }

  const disciplinas = (await readPath<Record<string, Disciplina>>("disciplinas")) || {};
  const totalAulasCompletadas = Object.values(disciplinas).reduce(
    (acc, d) => acc + d.totalAulasConcluidas,
    0
  );

  const progresso: Progresso = {
    totalAulasCompletadas,
    totalRelatorios,
    diasConsecutivos: calcularDiasConsecutivos(Object.keys(relatorios)),
    desempenhoMedio,
    desempenhoPorDisciplina,
    ultimaAtualizacao: new Date().toISOString(),
  };

  await writePath("progresso", progresso);
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = Number(searchParams.get("limit")) || 10;
    const offset = Number(searchParams.get("offset")) || 0;

    const relatorios = (await readPath<Record<string, Relatorio>>("relatorios")) || {};
    const chavesDecrescentes = Object.keys(relatorios).sort().reverse();
    const total = chavesDecrescentes.length;
    const pagina = chavesDecrescentes.slice(offset, offset + limit).map((data) => relatorios[data]);

    return NextResponse.json({ relatorios: pagina, total }, { status: 200 });
  } catch (error) {
    const mensagem = error instanceof Error ? error.message : "Erro desconhecido";
    return NextResponse.json({ error: mensagem }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const resultado = relatorioFormSchema.safeParse(body);
    if (!resultado.success) {
      return NextResponse.json(
        { error: resultado.error.errors[0]?.message ?? "Dados inválidos" },
        { status: 400 }
      );
    }

    const dadosValidados = resultado.data;
    const data = dadosValidados.data || formatarDataISO();

    const valoresDesempenho = Object.values(dadosValidados.desempenho);
    const desempenhoMedio = valoresDesempenho.length
      ? Math.round(valoresDesempenho.reduce((acc, v) => acc + v, 0) / valoresDesempenho.length)
      : 0;

    const markdown = gerarMarkdownRelatorio({ ...dadosValidados, data });

    const agora = new Date().toISOString();
    const relatorio: Relatorio = {
      data,
      diasEstudados: dadosValidados.diasEstudados,
      disciplinasEstudadas: dadosValidados.disciplinasEstudadas,
      conceitos: dadosValidados.conceitos,
      duvidas: dadosValidados.duvidas,
      erros: dadosValidados.erros,
      desempenho: dadosValidados.desempenho,
      desempenhoMedio,
      pontoPositivos: dadosValidados.pontoPositivos,
      proximasAcoes: dadosValidados.proximasAcoes,
      criadoEm: agora,
      atualizadoEm: agora,
      markdown,
    };

    await writePath(`relatorios/${data}`, relatorio);
    await recalcularProgresso();

    return NextResponse.json(relatorio, { status: 201 });
  } catch (error) {
    const mensagem = error instanceof Error ? error.message : "Erro desconhecido";
    return NextResponse.json({ error: mensagem }, { status: 500 });
  }
}
