import { NextRequest, NextResponse } from "next/server";
import { sincronizarBibliotecaLocal, pastaAulasExiste, pastaAulasConfigurada } from "@/lib/localLibrary";

// sempre roda no request, nunca cacheia estático (os dados mudam a qualquer momento)
export const dynamic = "force-dynamic";

function autorizado(request: NextRequest): boolean {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) return true;
  return request.headers.get("authorization") === `Bearer ${cronSecret}`;
}

// Disparo manual/externo da sincronização da biblioteca local. A sincronização
// automática semanal roda sozinha dentro do próprio servidor (ver instrumentation.ts)
// — este endpoint existe só como um gatilho extra, se algum dia for útil.
async function executarSync(request: NextRequest) {
  if (!autorizado(request)) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  try {
    if (!(await pastaAulasExiste())) {
      return NextResponse.json({ mensagem: `Pasta de aulas não encontrada em "${pastaAulasConfigurada()}"` });
    }
    const resultado = await sincronizarBibliotecaLocal();
    return NextResponse.json(resultado);
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  return executarSync(request);
}

export async function POST(request: NextRequest) {
  return executarSync(request);
}
