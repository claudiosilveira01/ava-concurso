"use client";

import { useEffect, useState } from "react";
import { Moon, Sun, Menu } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Button } from "./Button";
import { MobileNav } from "./MobileNav";

function saudacaoPorHorario(): string {
  const hora = new Date().getHours();
  if (hora < 12) return "Bom dia";
  if (hora < 18) return "Boa tarde";
  return "Boa noite";
}

export function Header({ nomeUsuario = "Cláudio" }: { nomeUsuario?: string }) {
  const [modoEscuro, setModoEscuro] = useState(false);
  const [mobileNavAberto, setMobileNavAberto] = useState(false);

  useEffect(() => {
    const salvo = localStorage.getItem("ava-dark-mode");
    const escuro = salvo === "true";
    setModoEscuro(escuro);
    document.documentElement.classList.toggle("dark", escuro);
  }, []);

  function alternarDarkMode() {
    const novo = !modoEscuro;
    setModoEscuro(novo);
    document.documentElement.classList.toggle("dark", novo);
    localStorage.setItem("ava-dark-mode", String(novo));
  }

  return (
    <header className="flex items-center justify-between border-b border-[var(--border)] px-4 py-3 md:px-6">
      <div className="flex items-center gap-3">
        <button className="md:hidden" onClick={() => setMobileNavAberto(true)} aria-label="Abrir menu">
          <Menu className="h-6 w-6" />
        </button>
        <div>
          <p className="text-sm text-[var(--muted)] capitalize">
            {format(new Date(), "EEEE, d 'de' MMMM", { locale: ptBR })}
          </p>
          <h1 className="text-lg font-bold">
            {saudacaoPorHorario()}, {nomeUsuario}
          </h1>
        </div>
      </div>
      <Button variant="ghost" size="sm" onClick={alternarDarkMode} aria-label="Alternar modo escuro">
        {modoEscuro ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
      </Button>
      <MobileNav aberto={mobileNavAberto} onFechar={() => setMobileNavAberto(false)} />
    </header>
  );
}
