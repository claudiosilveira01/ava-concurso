import { NextRequest, NextResponse } from "next/server";
import { readPath } from "@/lib/store";
import { formatarDataISO, inicioDaSemana } from "@/lib/utils";
import type { Aula } from "@/lib/types";

// sempre roda no request, nunca cacheia estático (os dados mudam a qualquer momento)
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const semanasParam = request.nextUrl.searchParams.get("semanas");
    const totalSemanasPedidas = semanasParam ? parseInt(semanasParam, 10) : 4;
    const totalSemanas = Number.isFinite(totalSemanasPedidas) && totalSemanasPedidas > 0 ? totalSemanasPedidas : 4;

    const todasAulas = (await readPath<Record<string, Record<string, Aula>>>("aulas")) || {};
    const datasConclusao: string[] = [];
    for (const aulasDaDisciplina of Object.values(todasAulas)) {
      for (const aula of Object.values(aulasDaDisciplina)) {
        if (aula.completadoEm) datasConclusao.push(aula.completadoEm.slice(0, 10));
      }
    }

    const segundaAtual = inicioDaSemana(formatarDataISO());
    const semanas: { segunda: string; domingo: string }[] = [];
    for (let i = totalSemanas - 1; i >= 0; i--) {
      const dataSegunda = new Date(`${segundaAtual}T00:00:00`);
      dataSegunda.setDate(dataSegunda.getDate() - i * 7);
      const segunda = formatarDataISO(dataSegunda);

      const dataDomingo = new Date(`${segunda}T00:00:00`);
      dataDomingo.setDate(dataDomingo.getDate() + 6);
      const domingo = formatarDataISO(dataDomingo);

      semanas.push({ segunda, domingo });
    }

    const historico = semanas.map(({ segunda, domingo }) => ({
      semana: segunda,
      aulasConcluidas: datasConclusao.filter((d) => d >= segunda && d <= domingo).length,
    }));

    return NextResponse.json(historico, { status: 200 });
  } catch (error) {
    const mensagem = error instanceof Error ? error.message : "Erro desconhecido";
    return NextResponse.json({ error: mensagem }, { status: 500 });
  }
}
