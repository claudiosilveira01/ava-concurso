import { NextRequest, NextResponse } from "next/server";
import { readPath } from "@/lib/store";
import { CRONOGRAMA_SEMANAL } from "@/lib/constants";
import { isDiaValido } from "@/lib/utils";
import type { Cronograma } from "@/lib/types";

export async function GET(request: NextRequest) {
  try {
    const dia = request.nextUrl.searchParams.get("dia");

    if (dia !== null) {
      if (!isDiaValido(dia)) {
        return NextResponse.json({ error: "Dia inválido" }, { status: 400 });
      }
      const cronograma = (await readPath<Cronograma>("cronograma")) ?? CRONOGRAMA_SEMANAL;
      return NextResponse.json(cronograma[dia], { status: 200 });
    }

    const cronograma = (await readPath<Cronograma>("cronograma")) ?? CRONOGRAMA_SEMANAL;
    return NextResponse.json(cronograma, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Erro ao buscar cronograma" }, { status: 500 });
  }
}
