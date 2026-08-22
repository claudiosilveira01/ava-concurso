import { NextResponse } from "next/server";
import { readPath, writePath } from "@/lib/store";
import { sincronizarCalendarSchema } from "@/lib/validation";
import { diaSemanaDeData, formatarDataISO, slugify } from "@/lib/utils";
import { CRONOGRAMA_SEMANAL, HORARIO_ESTUDO_DEFAULT, NOTIFICACAO_MINUTOS_DEFAULT } from "@/lib/constants";
import { criarEventoCalendario, googleCalendarConfigurado } from "@/lib/googleCalendar";
import type { Cronograma, EventoCalendario } from "@/lib/types";

export async function POST(request: Request) {
  try {
    let bodyBruto: unknown = {};
    try {
      bodyBruto = await request.json();
    } catch {
      bodyBruto = {};
    }

    const resultado = sincronizarCalendarSchema.safeParse(bodyBruto);
    if (!resultado.success) {
      return NextResponse.json(
        { error: resultado.error.errors[0]?.message ?? "Dados inválidos" },
        { status: 400 }
      );
    }

    const data = resultado.data.data || formatarDataISO();
    const dia = diaSemanaDeData(data);
    const cronograma = (await readPath<Cronograma>("cronograma")) || CRONOGRAMA_SEMANAL;
    const disciplinasDoDia = cronograma[dia] || [];

    const eventosExistentes = (await readPath<Record<string, EventoCalendario>>(`calendario/${data}`)) || {};
    const disciplinasComEvento = new Set(Object.values(eventosExistentes).map((evento) => evento.disciplina));

    let criadosGoogle = 0;
    for (const disciplina of disciplinasDoDia) {
      if (disciplinasComEvento.has(disciplina)) continue;

      if (googleCalendarConfigurado) {
        try {
          await criarEventoCalendario(disciplina, data);
          criadosGoogle++;
        } catch {
          // falha ao criar essa disciplina específica no Google — continua com as demais
        }
      } else {
        const id = `evento_${Date.now()}_${slugify(disciplina)}`;
        const eventoLocal: EventoCalendario = {
          id,
          googleCalendarId: "",
          googleEventId: undefined,
          disciplina,
          data,
          horario: HORARIO_ESTUDO_DEFAULT,
          titulo: `📚 ${disciplina} - Estudo Concurso`,
          descricao: "Disciplina do cronograma de estudos.",
          url: "",
          notificacaoMinutos: NOTIFICACAO_MINUTOS_DEFAULT,
          criadoEm: new Date().toISOString(),
          sincronizadoEm: new Date().toISOString(),
        };
        await writePath(`calendario/${data}/${id}`, eventoLocal);
      }
    }

    const eventosFinal = (await readPath<Record<string, EventoCalendario>>(`calendario/${data}`)) || {};

    return NextResponse.json(
      {
        criadosGoogle,
        salvoSLocalmente: true,
        eventos: Object.values(eventosFinal),
      },
      { status: 200 }
    );
  } catch (error) {
    const mensagem = error instanceof Error ? error.message : "Erro desconhecido";
    return NextResponse.json({ error: mensagem }, { status: 500 });
  }
}
