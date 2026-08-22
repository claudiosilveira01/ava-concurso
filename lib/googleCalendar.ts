import { google } from "googleapis";
import { getGoogleAuthClient, googleConfigurado } from "./googleAuth";
import { HORARIO_ESTUDO_DEFAULT, NOTIFICACAO_MINUTOS_DEFAULT } from "./constants";
import { readPath, writePath } from "./store";
import type { EventoCalendario } from "./types";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

function extrairDisciplinaDoTitulo(summary?: string | null): string {
  if (!summary) return "";
  return summary.replace(/^📚\s*/, "").replace(/\s*-\s*Estudo Concurso$/, "").trim();
}

/** Cria um evento no Google Calendar para uma disciplina em uma data, e espelha o registro localmente. */
export async function criarEventoCalendario(
  disciplina: string,
  data: string,
  horario: string = HORARIO_ESTUDO_DEFAULT,
  relatorioUrl?: string
): Promise<EventoCalendario> {
  const auth = getGoogleAuthClient();
  const calendar = google.calendar({ version: "v3", auth });
  const calendarId = process.env.GOOGLE_CALENDAR_ID || "primary";

  const startTime = new Date(`${data}T${horario}:00`);
  const endTime = new Date(startTime.getTime() + 60 * 60 * 1000);

  const titulo = `📚 ${disciplina} - Estudo Concurso`;
  const descricao = `Disciplina do cronograma de estudos.\n\nRelatório: ${relatorioUrl || `${APP_URL}/relatorios/${data}`}`;

  const evento = {
    summary: titulo,
    description: descricao,
    start: { dateTime: startTime.toISOString(), timeZone: "America/Sao_Paulo" },
    end: { dateTime: endTime.toISOString(), timeZone: "America/Sao_Paulo" },
    reminders: {
      useDefault: false,
      overrides: [{ method: "popup", minutes: NOTIFICACAO_MINUTOS_DEFAULT }],
    },
    visibility: "private" as const,
  };

  const criado = await calendar.events.insert({ calendarId, requestBody: evento });

  const eventoLocal: EventoCalendario = {
    id: `evento_${Date.now()}`,
    googleCalendarId: calendarId,
    googleEventId: criado.data.id || undefined,
    disciplina,
    data,
    horario,
    titulo,
    descricao,
    url: criado.data.htmlLink || "",
    notificacaoMinutos: NOTIFICACAO_MINUTOS_DEFAULT,
    criadoEm: new Date().toISOString(),
    sincronizadoEm: new Date().toISOString(),
  };

  await writePath(`calendario/${data}/${eventoLocal.id}`, eventoLocal);
  return eventoLocal;
}

export async function getProximosEventos(limite: number = 5): Promise<EventoCalendario[]> {
  const auth = getGoogleAuthClient();
  const calendar = google.calendar({ version: "v3", auth });
  const calendarId = process.env.GOOGLE_CALENDAR_ID || "primary";

  const eventos = await calendar.events.list({
    calendarId,
    timeMin: new Date().toISOString(),
    maxResults: limite,
    singleEvents: true,
    orderBy: "startTime",
  });

  return (eventos.data.items || []).map((event) => ({
    id: event.id || "",
    googleCalendarId: calendarId,
    googleEventId: event.id || undefined,
    disciplina: extrairDisciplinaDoTitulo(event.summary),
    data: event.start?.dateTime ? event.start.dateTime.split("T")[0] : "",
    horario: event.start?.dateTime ? event.start.dateTime.split("T")[1].substring(0, 5) : "",
    titulo: event.summary || "",
    descricao: event.description || "",
    url: event.htmlLink || "",
    notificacaoMinutos: event.reminders?.overrides?.[0]?.minutes ?? NOTIFICACAO_MINUTOS_DEFAULT,
    criadoEm: event.created || new Date().toISOString(),
    sincronizadoEm: new Date().toISOString(),
  }));
}

export async function atualizarEvento(eventId: string, dados: Partial<EventoCalendario>): Promise<void> {
  const auth = getGoogleAuthClient();
  const calendar = google.calendar({ version: "v3", auth });
  const calendarId = process.env.GOOGLE_CALENDAR_ID || "primary";

  if (dados.titulo || dados.descricao || (dados.data && dados.horario)) {
    const requestBody: Record<string, unknown> = {};
    if (dados.titulo) requestBody.summary = dados.titulo;
    if (dados.descricao) requestBody.description = dados.descricao;
    if (dados.data && dados.horario) {
      const start = new Date(`${dados.data}T${dados.horario}:00`);
      const end = new Date(start.getTime() + 60 * 60 * 1000);
      requestBody.start = { dateTime: start.toISOString(), timeZone: "America/Sao_Paulo" };
      requestBody.end = { dateTime: end.toISOString(), timeZone: "America/Sao_Paulo" };
    }
    await calendar.events.patch({ calendarId, eventId, requestBody });
  }
}

export async function deletarEvento(eventId: string, data?: string, localId?: string): Promise<void> {
  const auth = getGoogleAuthClient();
  const calendar = google.calendar({ version: "v3", auth });
  const calendarId = process.env.GOOGLE_CALENDAR_ID || "primary";
  await calendar.events.delete({ calendarId, eventId });

  if (data && localId) {
    const { removePath } = await import("./store");
    await removePath(`calendario/${data}/${localId}`);
  }
}

export { googleConfigurado as googleCalendarConfigurado };
