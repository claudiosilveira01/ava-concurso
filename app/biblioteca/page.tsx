import { BibliotecaAulas } from "@/components/BibliotecaAulas";

export default function BibliotecaPage({
  searchParams,
}: {
  searchParams: { disciplina?: string };
}) {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold">Biblioteca</h1>
      <BibliotecaAulas disciplinaInicial={searchParams.disciplina} />
    </div>
  );
}
