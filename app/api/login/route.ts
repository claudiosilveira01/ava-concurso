import { NextResponse } from "next/server";
import { createHash, timingSafeEqual } from "crypto";

export const dynamic = "force-dynamic";

function sha(texto: string): Buffer {
  return createHash("sha256").update(texto).digest();
}

export async function POST(request: Request) {
  const senhaCorreta = process.env.AVA_SENHA;
  if (!senhaCorreta) return NextResponse.json({ ok: true });

  const { senha } = (await request.json().catch(() => ({}))) as { senha?: string };
  const confere = typeof senha === "string" && timingSafeEqual(sha(senha), sha(senhaCorreta));

  if (!confere) {
    // pequena espera para dificultar tentativas em sequência
    await new Promise((r) => setTimeout(r, 800));
    return NextResponse.json({ error: "Senha incorreta" }, { status: 401 });
  }

  const cookie = createHash("sha256").update(`${senhaCorreta}|ava-sessao-v1`).digest("hex");
  const res = NextResponse.json({ ok: true });
  res.cookies.set("ava_sessao", cookie, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 dias
  });
  return res;
}
