import { NextResponse } from "next/server";
import { readPath } from "@/lib/store";
import type { Relatorio } from "@/lib/types";

// sempre roda no request, nunca cacheia estático (os dados mudam a qualquer momento)
export const dynamic = "force-dynamic";

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
