import { NextResponse } from "next/server";
import { readPath } from "@/lib/store";
import { DISCIPLINA_POR_ID } from "@/lib/constants";
import type { Aula, Disciplina } from "@/lib/types";

// sempre roda no request, nunca cacheia estático (os dados mudam a qualquer momento)
export const dynamic = "force-dynamic";

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const config = DISCIPLINA_POR_ID[params.id];
    if (!config) {
      return NextResponse.json({ error: "Disciplina não encontrada" }, { status: 404 });
    }

    const disciplinaSalva = await readPath<Disciplina>(`disciplinas/${params.id}`);
    const aulasSalvas = (await readPath<Record<string, Aula>>(`aulas/${params.id}`)) || {};

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

    const aulas: Aula[] = Object.values(aulasSalvas).sort((a, b) => (a.numero ?? 999) - (b.numero ?? 999));

    return NextResponse.json({ ...disciplina, aulas }, { status: 200 });
  } catch (error) {
    const mensagem = error instanceof Error ? error.message : "Erro desconhecido";
    return NextResponse.json({ error: mensagem }, { status: 500 });
  }
}
