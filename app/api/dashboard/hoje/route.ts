import { NextResponse } from "next/server";
import { calcularAgendaDoDia } from "@/lib/agenda";
import { isDiaValido } from "@/lib/utils";
import type { DiaSemana } from "@/lib/types";

// sempre roda no request, nunca cacheia estático (os dados mudam a qualquer momento)
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const diaParam = searchParams.get("dia");

    if (diaParam && !isDiaValido(diaParam)) {
      return NextResponse.json({ error: "Dia inválido" }, { status: 400 });
    }

    const agenda = await calcularAgendaDoDia((diaParam ?? undefined) as DiaSemana | undefined);
    return NextResponse.json(agenda, { status: 200 });
  } catch (error) {
    const mensagem = error instanceof Error ? error.message : "Erro desconhecido";
    return NextResponse.json({ error: mensagem }, { status: 500 });
  }
}
