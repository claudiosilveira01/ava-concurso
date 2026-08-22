import { NextResponse } from "next/server";
import { readPath } from "@/lib/store";
import { DISCIPLINA_POR_ID } from "@/lib/constants";
import type { Aula } from "@/lib/types";

export async function GET(_request: Request, { params }: { params: { disciplina: string } }) {
  try {
    if (!DISCIPLINA_POR_ID[params.disciplina]) {
      return NextResponse.json({ error: "Disciplina não encontrada" }, { status: 404 });
    }

    const aulas = await readPath<Record<string, Aula>>(`aulas/${params.disciplina}`);
    const lista = aulas ? Object.values(aulas).sort((a, b) => a.numero - b.numero) : [];
    return NextResponse.json(lista);
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
