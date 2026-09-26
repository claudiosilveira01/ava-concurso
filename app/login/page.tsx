"use client";

import { useState } from "react";

export default function LoginPage() {
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  async function entrar(e: React.FormEvent) {
    e.preventDefault();
    setEnviando(true);
    setErro(null);
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ senha }),
      });
      if (res.ok) {
        window.location.href = "/";
        return;
      }
      const corpo = await res.json().catch(() => ({}));
      setErro(corpo.error || "Não foi possível entrar");
    } catch {
      setErro("Sem conexão. Tente de novo.");
    } finally {
      setEnviando(false);
    }
  }

  // "fixed inset-0" cobre o menu lateral: a tela de entrada aparece sozinha.
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--background)] p-4">
      <form
        onSubmit={entrar}
        className="flex w-full max-w-sm flex-col gap-4 rounded-xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm"
      >
        <div>
          <h1 className="text-xl font-bold">AVA Concursos</h1>
          <p className="text-sm text-[var(--muted)]">Digite a senha para entrar</p>
        </div>
        <input
          type="password"
          autoFocus
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          placeholder="Senha"
          className="rounded-lg border border-[var(--border)] bg-transparent px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
        />
        {erro && <p className="text-sm text-red-500">{erro}</p>}
        <button
          type="submit"
          disabled={enviando || !senha}
          className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white disabled:opacity-50"
        >
          {enviando ? "Entrando..." : "Entrar"}
        </button>
      </form>
    </div>
  );
}
