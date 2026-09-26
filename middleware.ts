import { NextRequest, NextResponse } from "next/server";

// Portão de entrada do AVA online. Só liga quando existir a variável AVA_SENHA.
// Sem ela (uso local no seu PC), tudo continua aberto como sempre foi.
export const config = {
  matcher: ["/((?!_next/static|_next/image|icon.svg|favicon.ico|login|api/login).*)"],
};

async function assinatura(senha: string): Promise<string> {
  const dados = new TextEncoder().encode(`${senha}|ava-sessao-v1`);
  const hash = await crypto.subtle.digest("SHA-256", dados);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function middleware(request: NextRequest) {
  const senha = process.env.AVA_SENHA;
  if (!senha) return NextResponse.next();

  const cookie = request.cookies.get("ava_sessao")?.value;
  if (cookie && cookie === (await assinatura(senha))) return NextResponse.next();

  if (request.nextUrl.pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
  const destino = request.nextUrl.clone();
  destino.pathname = "/login";
  destino.search = "";
  return NextResponse.redirect(destino);
}
