import { NextResponse } from "next/server";
import { readPath, writePath, removePath } from "@/lib/store";
import { relatorioFormSchema } from "@/lib/validation";
import { gerarMarkdownRelatorio } from "@/lib/markdown";
import { calcularDiasConsecutivos } from "@/lib/utils";
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

export async function GET(request: Request, { params }: { params: { data: string } }) {
  try {
    const relatorio = await readPath<Relatorio>(`relatorios/${params.data}`);
    if (!relatorio) {
      return NextResponse.json({ error: "Relatório não encontrado" }, { status: 404 });
    }

    return NextResponse.json(relatorio, { status: 200 });
  } catch (error) {
    const mensagem = error instanceof Error ? error.message : "Erro desconhecido";
    return NextResponse.json({ error: mensagem }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: { data: string } }) {
  try {
    const existente = await readPath<Relatorio>(`relatorios/${params.data}`);
    if (!existente) {
      return NextResponse.json({ error: "Relatório não encontrado" }, { status: 404 });
    }

    const body = await request.json();
    const resultado = relatorioFormSchema.safeParse(body);
    if (!resultado.success) {
      return NextResponse.json(
        { error: resultado.error.errors[0]?.message ?? "Dados inválidos" },
        { status: 400 }
      );
    }

    const dadosValidados = resultado.data;
    const data = params.data;

    // merge: campo novo sobrescreve apenas quando enviado no body (não quando preenchido pelo default do zod)
    const diasEstudados = body.diasEstudados !== undefined ? dadosValidados.diasEstudados : existente.diasEstudados;
    const disciplinasEstudadas =
      body.disciplinasEstudadas !== undefined ? dadosValidados.disciplinasEstudadas : existente.disciplinasEstudadas;
    const conceitos = body.conceitos !== undefined ? dadosValidados.conceitos : existente.conceitos;
    const duvidas = body.duvidas !== undefined ? dadosValidados.duvidas : existente.duvidas;
    const erros = body.erros !== undefined ? dadosValidados.erros : existente.erros;
    const desempenho = body.desempenho !== undefined ? dadosValidados.desempenho : existente.desempenho;
    const pontoPositivos = body.pontoPositivos !== undefined ? dadosValidados.pontoPositivos : existente.pontoPositivos;
    const proximasAcoes = body.proximasAcoes !== undefined ? dadosValidados.proximasAcoes : existente.proximasAcoes;

    const valoresDesempenho = Object.values(desempenho);
    const desempenhoMedio = valoresDesempenho.length
      ? Math.round(valoresDesempenho.reduce((acc, v) => acc + v, 0) / valoresDesempenho.length)
      : 0;

    const markdown = gerarMarkdownRelatorio({
      data,
      diasEstudados,
      disciplinasEstudadas,
      conceitos,
      duvidas,
      erros,
      desempenho,
      pontoPositivos,
      proximasAcoes,
    });

    const atualizado: Relatorio = {
      data,
      diasEstudados,
      disciplinasEstudadas,
      conceitos,
      duvidas,
      erros,
      desempenho,
      desempenhoMedio,
      pontoPositivos,
      proximasAcoes,
      criadoEm: existente.criadoEm,
      atualizadoEm: new Date().toISOString(),
      markdown,
    };

    await writePath(`relatorios/${data}`, atualizado);
    await recalcularProgresso();

    return NextResponse.json(atualizado, { status: 200 });
  } catch (error) {
    const mensagem = error instanceof Error ? error.message : "Erro desconhecido";
    return NextResponse.json({ error: mensagem }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { data: string } }) {
  try {
    const existente = await readPath<Relatorio>(`relatorios/${params.data}`);
    if (!existente) {
      return NextResponse.json({ error: "Relatório não encontrado" }, { status: 404 });
    }

    await removePath(`relatorios/${params.data}`);
    await recalcularProgresso();

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    const mensagem = error instanceof Error ? error.message : "Erro desconhecido";
    return NextResponse.json({ error: mensagem }, { status: 500 });
  }
}
