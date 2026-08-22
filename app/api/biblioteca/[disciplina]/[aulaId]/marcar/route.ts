import { NextResponse } from "next/server";
import { readPath, updatePath } from "@/lib/store";
import { marcarAulaSchema } from "@/lib/validation";
import { calcularProgresso } from "@/lib/utils";
import type { Aula } from "@/lib/types";

export async function POST(
  request: Request,
  { params }: { params: { disciplina: string; aulaId: string } }
) {
  try {
    const body = await request.json();
    const parsed = marcarAulaSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Corpo inválido: esperado { concluida: boolean }" }, { status: 400 });
    }
    const { concluida } = parsed.data;

    const aulaPath = `aulas/${params.disciplina}/${params.aulaId}`;
    const aula = await readPath<Aula>(aulaPath);
    if (!aula) {
      return NextResponse.json({ error: "Aula não encontrada" }, { status: 404 });
    }

    const completadoEm = concluida ? new Date().toISOString() : null;
    await updatePath(aulaPath, { concluida, completadoEm });

    const todasAulas = await readPath<Record<string, Aula>>(`aulas/${params.disciplina}`);
    const lista = todasAulas ? Object.values(todasAulas) : [];
    const totalAulas = lista.length;
    const totalAulasConcluidas = lista.filter((a) => a.concluida).length;
    const progresso = calcularProgresso(totalAulasConcluidas, totalAulas);

    await updatePath(`disciplinas/${params.disciplina}`, {
      totalAulas,
      totalAulasConcluidas,
      progresso,
    });

    return NextResponse.json({ success: true, completadoEm, progresso });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
