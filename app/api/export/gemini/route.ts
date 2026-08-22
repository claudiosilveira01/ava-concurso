import { NextResponse } from "next/server";
import { readPath } from "@/lib/store";
import { exportGeminiSchema } from "@/lib/validation";
import { gerarMarkdownGemini } from "@/lib/markdown";
import { formatarDataISO } from "@/lib/utils";
import type { Relatorio } from "@/lib/types";

// sempre roda no request, nunca cacheia estático (os dados mudam a qualquer momento)
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const resultado = exportGeminiSchema.safeParse(body);
    if (!resultado.success) {
      return NextResponse.json(
        { error: resultado.error.errors[0]?.message ?? "Dados inválidos" },
        { status: 400 }
      );
    }

    const { formato, periodo } = resultado.data;

    const relatorios = (await readPath<Record<string, Relatorio>>("relatorios")) || {};
    let relatoriosArray = Object.values(relatorios);

    if (periodo === "ultima_semana") {
      const limite = new Date();
      limite.setDate(limite.getDate() - 7);
      const dataLimite = formatarDataISO(limite);
      relatoriosArray = relatoriosArray.filter((r) => r.data >= dataLimite);
    }

    if (formato === "json") {
      return new Response(JSON.stringify(relatoriosArray, null, 2), {
        headers: {
          "Content-Type": "application/json",
          "Content-Disposition": 'attachment; filename="ava-relatorios.json"',
        },
      });
    }

    const markdown = gerarMarkdownGemini(relatoriosArray);
    return new Response(markdown, {
      headers: {
        "Content-Type": "text/markdown; charset=utf-8",
        "Content-Disposition": 'attachment; filename="ava-relatorios.md"',
      },
    });
  } catch (error) {
    const mensagem = error instanceof Error ? error.message : "Erro desconhecido";
    return NextResponse.json({ error: mensagem }, { status: 500 });
  }
}
