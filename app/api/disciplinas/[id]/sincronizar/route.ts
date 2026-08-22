import { NextResponse } from "next/server";
import { readPath } from "@/lib/store";
import { DISCIPLINA_POR_ID } from "@/lib/constants";
import { sincronizarDrive, googleDriveConfigurado } from "@/lib/googleDrive";
import type { Disciplina } from "@/lib/types";

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    if (!DISCIPLINA_POR_ID[params.id]) {
      return NextResponse.json({ error: "Disciplina não encontrada" }, { status: 404 });
    }

    if (!googleDriveConfigurado) {
      return NextResponse.json(
        {
          mensagem: "Google Drive não configurado ainda — configure as variáveis de ambiente para sincronizar.",
          totalAulas: 0,
          adicionadas: 0,
        },
        { status: 200 }
      );
    }

    const resultado = await sincronizarDrive();
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
