import { NextResponse } from "next/server";
import { readPath } from "@/lib/store";
import { DISCIPLINAS_CONFIG } from "@/lib/constants";
import { calcularProgresso } from "@/lib/utils";
import type { Disciplina } from "@/lib/types";

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
          emoji: config.emoji,
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
