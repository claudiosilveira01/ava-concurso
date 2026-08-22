import { NextRequest, NextResponse } from "next/server";
import { readPath } from "@/lib/store";
import { DISCIPLINA_POR_ID } from "@/lib/constants";
import type { Aula } from "@/lib/types";

// sempre roda no request, nunca cacheia estático (os dados mudam a qualquer momento)
export const dynamic = "force-dynamic";

function ordenarPorNumero(aulas: Record<string, Aula>): Aula[] {
  return Object.values(aulas).sort((a, b) => (a.numero ?? 999) - (b.numero ?? 999));
}

export async function GET(request: NextRequest) {
  try {
    const disciplina = request.nextUrl.searchParams.get("disciplina");

    if (disciplina) {
      if (!DISCIPLINA_POR_ID[disciplina]) {
        return NextResponse.json({ error: "Disciplina não encontrada" }, { status: 404 });
      }
      const aulas = await readPath<Record<string, Aula>>(`aulas/${disciplina}`);
      return NextResponse.json(aulas ? ordenarPorNumero(aulas) : []);
    }

    const todasAulas = await readPath<Record<string, Record<string, Aula>>>("aulas");
    if (!todasAulas) {
      return NextResponse.json({});
    }

    const resultado: Record<string, Aula[]> = {};
    for (const [disciplinaId, aulas] of Object.entries(todasAulas)) {
      resultado[disciplinaId] = ordenarPorNumero(aulas);
    }
    return NextResponse.json(resultado);
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
