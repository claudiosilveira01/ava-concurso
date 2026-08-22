import { NextResponse } from "next/server";
import { readPath } from "@/lib/store";
import { formatarDataISO } from "@/lib/utils";
import { getProximosEventos, googleCalendarConfigurado } from "@/lib/googleCalendar";
import type { EventoCalendario } from "@/lib/types";

export async function GET() {
  try {
    if (googleCalendarConfigurado) {
      try {
        const eventos = await getProximosEventos(5);
        return NextResponse.json(eventos, { status: 200 });
      } catch {
        // Google Calendar falhou — segue para o fallback local abaixo
      }
    }

    const calendario = (await readPath<Record<string, Record<string, EventoCalendario>>>("calendario")) || {};
    const hoje = formatarDataISO();

    const todosEventos = Object.values(calendario)
      .flatMap((eventosDoDia) => Object.values(eventosDoDia))
      .filter((evento) => evento.data >= hoje)
      .sort((a, b) => `${a.data}${a.horario}`.localeCompare(`${b.data}${b.horario}`));

    return NextResponse.json(todosEventos.slice(0, 5), { status: 200 });
  } catch (error) {
    const mensagem = error instanceof Error ? error.message : "Erro desconhecido";
    return NextResponse.json({ error: mensagem }, { status: 500 });
  }
}
