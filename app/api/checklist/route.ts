import { NextRequest, NextResponse } from "next/server";
import { readPath, writePath } from "@/lib/store";
import { slugify } from "@/lib/utils";
import type { ChecklistDia, ChecklistItemArmazenado } from "@/lib/types";

// sempre roda no request, nunca cacheia estático (os dados mudam a qualquer momento)
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const data = request.nextUrl.searchParams.get("data");
    if (!data) {
      return NextResponse.json({ error: "Parâmetro 'data' é obrigatório" }, { status: 400 });
    }

    const checklist = await readPath<Record<string, ChecklistItemArmazenado>>(`checklist/${data}`);
    if (!checklist) {
      return NextResponse.json({}, { status: 200 });
    }

    const resultado: ChecklistDia = {};
    for (const [chave, item] of Object.entries(checklist)) {
      resultado[chave] = item.concluida;
    }
    return NextResponse.json(resultado, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Erro ao buscar checklist" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { data, disciplina, concluida } = body ?? {};

    if (typeof data !== "string" || !data.trim() || typeof disciplina !== "string" || !disciplina.trim()) {
      return NextResponse.json({ error: "Parâmetros 'data' e 'disciplina' são obrigatórios" }, { status: 400 });
    }

    const chaveSlug = slugify(disciplina);
    const item: ChecklistItemArmazenado = {
      nome: disciplina,
      concluida: Boolean(concluida),
      marcadoEm: new Date().toISOString(),
    };

    await writePath(`checklist/${data}/${chaveSlug}`, item);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Erro ao salvar checklist" }, { status: 500 });
  }
}
