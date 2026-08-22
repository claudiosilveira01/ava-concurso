import { NextResponse } from "next/server";
import { readPath } from "@/lib/store";
import { DISCIPLINA_POR_ID } from "@/lib/constants";
import { sincronizarBibliotecaLocal, pastaAulasExiste, pastaAulasConfigurada } from "@/lib/localLibrary";
import type { Disciplina } from "@/lib/types";

// sempre roda no request, nunca cacheia estático (os dados mudam a qualquer momento)
export const dynamic = "force-dynamic";

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    if (!DISCIPLINA_POR_ID[params.id]) {
      return NextResponse.json({ error: "Disciplina não encontrada" }, { status: 404 });
    }

    if (!(await pastaAulasExiste())) {
      return NextResponse.json(
        {
          mensagem: `Pasta de aulas não encontrada em "${pastaAulasConfigurada()}" — confira se a unidade está conectada.`,
          totalAulas: 0,
          adicionadas: 0,
        },
        { status: 200 }
      );
    }

    const resultado = await sincronizarBibliotecaLocal();
    const disciplina = await readPath<Disciplina>(`disciplinas/${params.id}`);

    return NextResponse.json(
      {
        mensagem: "Sincronizado com sucesso",
        totalAulas: disciplina?.totalAulas || 0,
        adicionadas: resultado.adicionadas,
      },
      { status: 200 }
    );
  } catch (error) {
    const mensagem = error instanceof Error ? error.message : "Erro desconhecido";
    return NextResponse.json({ error: mensagem }, { status: 500 });
  }
}
