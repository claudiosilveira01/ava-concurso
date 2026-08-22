import { NextResponse } from "next/server";
import { readPath } from "@/lib/store";
import { gerarMarkdownSemana } from "@/lib/markdown";
import { formatarDataBR, formatarDataISO, inicioDaSemana } from "@/lib/utils";
import type { Relatorio } from "@/lib/types";

// sempre roda no request, nunca cacheia estático (os dados mudam a qualquer momento)
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const semanaParam = searchParams.get("semana");
    if (!semanaParam || !/^\d{4}-\d{2}-\d{2}$/.test(semanaParam)) {
      return NextResponse.json(
        { error: "Parâmetro 'semana' é obrigatório no formato YYYY-MM-DD" },
        { status: 400 }
      );
    }

    const inicio = inicioDaSemana(semanaParam);
    const dataFim = new Date(`${inicio}T00:00:00`);
    dataFim.setDate(dataFim.getDate() + 6);
    const fim = formatarDataISO(dataFim);

    const relatorios = (await readPath<Record<string, Relatorio>>("relatorios")) || {};
    const relatoriosDaSemana = Object.values(relatorios).filter(
      (r) => r.data >= inicio && r.data <= fim
    );

    const markdown = gerarMarkdownSemana(
      relatoriosDaSemana,
      `${formatarDataBR(inicio)} a ${formatarDataBR(fim)}`
    );

    return NextResponse.json({ markdown }, { status: 200 });
  } catch (error) {
    const mensagem = error instanceof Error ? error.message : "Erro desconhecido";
    return NextResponse.json({ error: mensagem }, { status: 500 });
  }
}
