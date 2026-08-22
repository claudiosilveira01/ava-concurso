import { NextRequest, NextResponse } from "next/server";
import { sincronizarDrive, googleDriveConfigurado } from "@/lib/googleDrive";

function autorizado(request: NextRequest): boolean {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) return true;
  return request.headers.get("authorization") === `Bearer ${cronSecret}`;
}

async function executarSync(request: NextRequest) {
  if (!autorizado(request)) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  try {
    if (!googleDriveConfigurado) {
      return NextResponse.json({ mensagem: "Google Drive não configurado" });
    }
    const resultado = await sincronizarDrive();
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
