import { NextResponse } from "next/server";
import { readPath, removePath, updatePath } from "@/lib/store";
import { atualizarEvento, deletarEvento, googleCalendarConfigurado } from "@/lib/googleCalendar";
import type { EventoCalendario } from "@/lib/types";

/** Varre "calendario" inteiro procurando o id em qualquer data (o path é calendario/{data}/{id}). */
async function encontrarEventoPorId(id: string): Promise<{ data: string; evento: EventoCalendario } | null> {
  const calendario = (await readPath<Record<string, Record<string, EventoCalendario>>>("calendario")) || {};
  for (const [data, eventosDoDia] of Object.entries(calendario)) {
    const evento = eventosDoDia?.[id];
    if (evento) {
      return { data, evento };
    }
  }
  return null;
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const achado = await encontrarEventoPorId(params.id);
    if (!achado) {
      return NextResponse.json({ error: "Evento não encontrado" }, { status: 404 });
    }

    const dados = (await request.json()) as Partial<EventoCalendario>;
    if (!dados || typeof dados !== "object" || Object.keys(dados).length === 0) {
      return NextResponse.json({ error: "Nenhum campo enviado para atualização" }, { status: 400 });
    }

    if (googleCalendarConfigurado && achado.evento.googleEventId) {
      try {
        await atualizarEvento(achado.evento.googleEventId, dados);
      } catch {
        // falha ao atualizar no Google — segue para atualizar localmente mesmo assim
      }
    }

    await updatePath(`calendario/${achado.data}/${params.id}`, dados);
    const atualizado = await readPath<EventoCalendario>(`calendario/${achado.data}/${params.id}`);

    return NextResponse.json(atualizado, { status: 200 });
  } catch (error) {
    const mensagem = error instanceof Error ? error.message : "Erro desconhecido";
    return NextResponse.json({ error: mensagem }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const achado = await encontrarEventoPorId(params.id);
    if (!achado) {
      return NextResponse.json({ error: "Evento não encontrado" }, { status: 404 });
    }

    if (googleCalendarConfigurado && achado.evento.googleEventId) {
      try {
        await deletarEvento(achado.evento.googleEventId);
      } catch {
        // falha ao remover no Google — ignora e prossegue com a remoção local
      }
    }

    await removePath(`calendario/${achado.data}/${params.id}`);

    return NextResponse.json({ success: true, deletado: true }, { status: 200 });
  } catch (error) {
    const mensagem = error instanceof Error ? error.message : "Erro desconhecido";
    return NextResponse.json({ error: mensagem }, { status: 500 });
  }
}
