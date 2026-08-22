import { ProximosEventos } from "@/components/ProximosEventos";

export default function CalendarioPage() {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold">Google Calendar</h1>
      <p className="text-sm text-[var(--muted)]">
        Sincronize o cronograma do dia com o Google Calendar e acompanhe os próximos
        eventos de estudo.
      </p>
      <div className="max-w-xl">
        <ProximosEventos />
      </div>
    </div>
  );
}
