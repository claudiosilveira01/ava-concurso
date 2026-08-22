import { FormularioRelatorio } from "@/components/FormularioRelatorio";

export default function NovoRelatorioPage({
  searchParams,
}: {
  searchParams: { data?: string };
}) {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold">
        {searchParams.data ? "Editar Relatório" : "Novo Relatório de Aprendizagem"}
      </h1>
      <FormularioRelatorio dataParaEditar={searchParams.data} />
    </div>
  );
}
