import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import { readPath } from "@/lib/store";
import type { Aula } from "@/lib/types";

// sempre roda no request, nunca cacheia estático (os dados mudam a qualquer momento)
export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: { disciplina: string; aulaId: string } }
) {
  try {
    const aula = await readPath<Aula>(`aulas/${params.disciplina}/${params.aulaId}`);
    if (!aula) {
      return NextResponse.json({ error: "Aula não encontrada" }, { status: 404 });
    }

    const buffer = await fs.readFile(aula.caminhoArquivo);
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="${encodeURIComponent(aula.nomeArquivo)}"`,
        "Cache-Control": "private, max-age=3600",
      },
    });
  } catch (error) {
    const mensagem = error instanceof Error ? error.message : "Erro desconhecido";
    return NextResponse.json({ error: `Não foi possível abrir o PDF: ${mensagem}` }, { status: 500 });
  }
}
