import { NextResponse } from "next/server";
import { calcularAgendaDoDia } from "@/lib/agenda";
import { calcularRevisaoDaSemana } from "@/lib/revisao";
import { diaSemanaAtual, isDiaValido } from "@/lib/utils";
import type { AgendaHojeResponse, DiaSemana } from "@/lib/types";

// sempre roda no request, nunca cacheia estático (os dados mudam a qualquer momento)
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const diaParam = searchParams.get("dia");

    if (diaParam && !isDiaValido(diaParam)) {
      return NextResponse.json({ error: "Dia inválido" }, { status: 400 });
    }

    const dia = (diaParam ?? diaSemanaAtual()) as DiaSemana;

    const agenda = await calcularAgendaDoDia(dia);
    // "Revisão da semana" só faz sentido no sábado — nos outros dias vem sempre vazia.
    const revisaoSemana = dia === "sábado" ? await calcularRevisaoDaSemana() : [];

    const resposta: AgendaHojeResponse = { agenda, revisaoSemana };
    return NextResponse.json(resposta, { status: 200 });
  } catch (error) {
    const mensagem = error instanceof Error ? error.message : "Erro desconhecido";
    return NextResponse.json({ error: mensagem }, { status: 500 });
  }
}
