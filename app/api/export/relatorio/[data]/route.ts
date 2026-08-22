import { NextResponse } from "next/server";
import { readPath } from "@/lib/store";
import type { Relatorio } from "@/lib/types";

export async function GET(request: Request, { params }: { params: { data: string } }) {
  try {
    const relatorio = await readPath<Relatorio>(`relatorios/${params.data}`);
    if (!relatorio) {
      return NextResponse.json({ error: "Relatório não encontrado" }, { status: 404 });
    }

    return NextResponse.json({ markdown: relatorio.markdown }, { status: 200 });
  } catch (error) {
    const mensagem = error instanceof Error ? error.message : "Erro desconhecido";
    return NextResponse.json({ error: mensagem }, { status: 500 });
  }
}
