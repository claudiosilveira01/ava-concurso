import { NextResponse } from "next/server";
import { sincronizarDrive, googleDriveConfigurado } from "@/lib/googleDrive";

export async function POST() {
  try {
    if (!googleDriveConfigurado) {
      return NextResponse.json({ adicionadas: 0, atualizadas: 0, removidas: 0 });
    }
    const resultado = await sincronizarDrive();
    return NextResponse.json(resultado);
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
