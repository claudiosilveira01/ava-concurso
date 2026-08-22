import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { DIAS_SEMANA } from "./constants";
import type { DiaSemana } from "./types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Retorna o dia da semana atual no formato usado pelo cronograma (segunda..domingo). */
export function diaSemanaAtual(date: Date = new Date()): DiaSemana {
  const idx = date.getDay(); // 0 = domingo
  const mapa: DiaSemana[] = ["domingo", "segunda", "terça", "quarta", "quinta", "sexta", "sábado"];
  return mapa[idx];
}

export function formatarDataISO(date: Date = new Date()): string {
  return date.toISOString().split("T")[0];
}

export function formatarDataBR(dataISO: string): string {
  const [ano, mes, dia] = dataISO.split("-");
  return `${dia}/${mes}/${ano}`;
}

/** Segunda-feira da semana que contém a data informada, em formato YYYY-MM-DD. */
export function inicioDaSemana(dataISO: string): string {
  const data = new Date(`${dataISO}T00:00:00`);
  const diaSemana = data.getDay(); // 0=domingo..6=sábado
  const offset = diaSemana === 0 ? -6 : 1 - diaSemana;
  data.setDate(data.getDate() + offset);
  return formatarDataISO(data);
}

export function calcularProgresso(concluidas: number, total: number): number {
  if (!total) return 0;
  return Math.round((concluidas / total) * 100);
}

/** Converte texto livre em uma chave segura para paths do Realtime Database (sem ".", "#", "$", "/", "[", "]"). */
export function slugify(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[.#$/[\]]/g, "-")
    .replace(/\s+/g, "_")
    .toLowerCase();
}

/** Dia da semana (segunda..domingo) a partir de uma data no formato YYYY-MM-DD. */
export function diaSemanaDeData(dataISO: string): DiaSemana {
  return diaSemanaAtual(new Date(`${dataISO}T00:00:00`));
}

export function isDiaValido(dia: string): dia is DiaSemana {
  return (DIAS_SEMANA as string[]).includes(dia);
}

export function calcularDiasConsecutivos(datasRelatorios: string[]): number {
  if (datasRelatorios.length === 0) return 0;
  const datasOrdenadas = [...new Set(datasRelatorios)].sort().reverse();
  let streak = 1;
  let atual = new Date(`${datasOrdenadas[0]}T00:00:00`);

  for (let i = 1; i < datasOrdenadas.length; i++) {
    const anterior = new Date(`${datasOrdenadas[i]}T00:00:00`);
    const diffDias = Math.round((atual.getTime() - anterior.getTime()) / 86400000);
    if (diffDias === 1) {
      streak++;
      atual = anterior;
    } else if (diffDias === 0) {
      continue;
    } else {
      break;
    }
  }
  return streak;
}

export function formatarBytes(bytes?: number): string {
  if (!bytes) return "—";
  const unidades = ["B", "KB", "MB", "GB"];
  let i = 0;
  let valor = bytes;
  while (valor >= 1024 && i < unidades.length - 1) {
    valor /= 1024;
    i++;
  }
  return `${valor.toFixed(1)} ${unidades[i]}`;
}
