import { NextResponse } from "next/server";
import { sincronizarBibliotecaLocal, pastaAulasExiste, pastaAulasConfigurada } from "@/lib/localLibrary";

// sempre roda no request, nunca cacheia estático (os dados mudam a qualquer momento)
export const dynamic = "force-dynamic";

export async function POST() {
  try {
    if (!(await pastaAulasExiste())) {
      return NextResponse.json({
        adicionadas: 0,
        atualizadas: 0,
        removidas: 0,
        aviso: `Pasta de aulas não encontrada em "${pastaAulasConfigurada()}"`,
      });
    }
    const resultado = await sincronizarBibliotecaLocal();
    return NextResponse.json(resultado);
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
