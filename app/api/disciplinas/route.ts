import { NextResponse } from "next/server";
import { readPath } from "@/lib/store";
import { DISCIPLINAS_CONFIG } from "@/lib/constants";
import { calcularProgresso } from "@/lib/utils";
import type { Disciplina } from "@/lib/types";

// sempre roda no request, nunca cacheia estático (os dados mudam a qualquer momento)
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const disciplinas = (await readPath<Record<string, Disciplina>>("disciplinas")) || {};

    const lista: Disciplina[] = DISCIPLINAS_CONFIG.map((config) => {
      const disciplina = disciplinas[config.id];
      if (!disciplina) {
        return {
          id: config.id,
          nome: config.nome,
          cor: config.cor,
          icone: config.icone,
          totalAulas: 0,
          totalAulasConcluidas: 0,
          progresso: 0,
          criadoEm: new Date(0).toISOString(),
        };
      }
      return {
        ...disciplina,
        progresso: calcularProgresso(disciplina.totalAulasConcluidas, disciplina.totalAulas),
      };
    });

    return NextResponse.json(lista, { status: 200 });
  } catch (error) {
    const mensagem = error instanceof Error ? error.message : "Erro desconhecido";
    return NextResponse.json({ error: mensagem }, { status: 500 });
  }
}
