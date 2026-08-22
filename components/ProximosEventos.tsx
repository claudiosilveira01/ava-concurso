"use client";

import { useState } from "react";
import { CalendarSync, ExternalLink } from "lucide-react";
import { useProximosEventos, sincronizarCalendario } from "@/components/hooks/useCalendar";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useToast } from "@/components/ui/Toast";
import { DISCIPLINA_POR_ID, nomeDisciplinaParaId } from "@/lib/constants";
import { formatarDataBR } from "@/lib/utils";

const COR_FALLBACK = "#3B82F6";

export function ProximosEventos() {
  const { eventos, loading, error, refetch } = useProximosEventos();
  const { toast } = useToast();
  const [sincronizando, setSincronizando] = useState(false);

  async function handleSincronizar() {
    setSincronizando(true);
    try {
      const resultado = await sincronizarCalendario();
      toast(`${resultado.criadosGoogle} eventos criados`, "success");
      refetch();
    } catch (err) {
      const mensagem = err instanceof Error ? err.message : "Erro ao sincronizar";
      toast(mensagem, "error");
    } finally {
      setSincronizando(false);
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-2">
        <CardTitle>📅 Próximos Eventos</CardTitle>
        <Button
          variant="outline"
          size="sm"
          onClick={handleSincronizar}
          disabled={sincronizando}
        >
          <CalendarSync className="h-4 w-4" />
          {sincronizando ? "Sincronizando..." : "Sincronizar com Google Calendar"}
        </Button>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p className="text-sm text-[var(--muted)]">Carregando...</p>
        ) : error ? (
          <p className="text-sm text-red-500">{error}</p>
        ) : eventos.length === 0 ? (
          <p className="text-sm text-[var(--muted)]">
            Nenhum evento agendado — sincronize para criar os eventos de hoje
          </p>
        ) : (
          <ul className="flex flex-col gap-3">
            {eventos.slice(0, 5).map((evento) => {
              const id = nomeDisciplinaParaId(evento.disciplina);
              const cor = (id && DISCIPLINA_POR_ID[id]?.cor) || COR_FALLBACK;
              return (
                <li
                  key={evento.id}
                  className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--border)] pb-3 last:border-0 last:pb-0"
                >
                  <div className="flex flex-col gap-1">
                    <Badge style={{ backgroundColor: `${cor}1A`, color: cor }}>
                      {evento.disciplina}
                    </Badge>
                    <span className="text-sm text-[var(--muted)]">
                      {formatarDataBR(evento.data)} às {evento.horario}
                    </span>
                  </div>
                  {evento.url && (
                    <a
                      href={evento.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-sm text-blue-600 hover:underline dark:text-blue-400"
                    >
                      Ver no Calendar
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
