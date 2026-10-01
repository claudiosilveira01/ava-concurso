// Camada de dados única usada por todas as API routes.
//
// Por que existe: o Firebase Realtime Database do projeto ainda não foi criado
// (depende de setup manual via Firebase Console — ver ROTEIRO_IMPLEMENTACAO_HOJE.md,
// Bloco 7). Para o app já rodar e ser testável hoje, este módulo espelha a API de
// caminhos do RTDB (get/set/update/push/remove por path tipo "relatorios/2026-08-21")
// sobre um arquivo JSON local em .data/db.json. Assim que FIREBASE_ADMIN_SDK_KEY e
// NEXT_PUBLIC_FIREBASE_DATABASE_URL forem configurados em .env.local, o store troca
// automaticamente para o Firebase Admin real — nenhuma API route precisa mudar.
import { promises as fs } from "fs";
import path from "path";
import { firebaseAdminConfigurado, getAdminDatabase } from "./firebaseAdmin";
import { CRONOGRAMA_SEMANAL, DISCIPLINAS_CONFIG } from "./constants";
import type { Disciplina } from "./types";
import { supabaseConfigurado, sbLerBlocos, sbGravarBloco, sbRemoverBlocos } from "./supabase";

const DB_FILE = path.join(process.cwd(), ".data", "db.json");

function seedInicial(): Record<string, unknown> {
  const disciplinas: Record<string, Disciplina> = {};
  for (const d of DISCIPLINAS_CONFIG) {
    disciplinas[d.id] = {
      id: d.id,
      nome: d.nome,
      cor: d.cor,
      icone: d.icone,
      totalAulas: 0,
      totalAulasConcluidas: 0,
      progresso: 0,
      criadoEm: new Date(0).toISOString(),
    };
  }
  return {
    usuarios: {
      default: {
        perfil: {
          nome: "Cláudio",
          email: "webapps.silveira.gg@gmail.com",
          ultimoAcesso: new Date(0).toISOString(),
          preferencias: { modoEscuro: false, notificacoes: true, horarioEstudo: "09:00" },
        },
      },
    },
    cronograma: CRONOGRAMA_SEMANAL,
    disciplinas,
    aulas: {},
  };
}

async function lerArquivoLocal(): Promise<Record<string, unknown>> {
  try {
    const raw = await fs.readFile(DB_FILE, "utf-8");
    return JSON.parse(raw);
  } catch {
    const seed = seedInicial();
    await escreverArquivoLocal(seed);
    return seed;
  }
}

async function escreverArquivoLocal(data: Record<string, unknown>): Promise<void> {
  await fs.mkdir(path.dirname(DB_FILE), { recursive: true });
  await fs.writeFile(DB_FILE, JSON.stringify(data, null, 2), "utf-8");
}

function getByPath(obj: unknown, segments: string[]): unknown {
  let atual: unknown = obj;
  for (const seg of segments) {
    if (atual == null || typeof atual !== "object") return null;
    atual = (atual as Record<string, unknown>)[seg];
  }
  return atual ?? null;
}

function setByPath(obj: Record<string, unknown>, segments: string[], value: unknown): void {
  let atual = obj;
  for (let i = 0; i < segments.length - 1; i++) {
    const seg = segments[i];
    if (typeof atual[seg] !== "object" || atual[seg] === null) {
      atual[seg] = {};
    }
    atual = atual[seg] as Record<string, unknown>;
  }
  const ultimo = segments[segments.length - 1];
  if (value === null) {
    delete atual[ultimo];
  } else {
    atual[ultimo] = value;
  }
}

function pushId(): string {
  return `-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 9)}`;
}

// ─── Backend Supabase (versão online) ───────────────────────────────
// Os dados são guardados em "blocos": cada linha da tabela ava_dados é um pedaço da
// árvore (ex.: "aulas/portugues", "relatorios/2026-09-25", "cronograma"). O bloco é
// formado pelos 2 primeiros segmentos do caminho (ou pelo único, se só houver 1).
function chaveDoBloco(segs: string[]): string {
  return segs.slice(0, 2).join("/");
}

async function sbLer(segs: string[]): Promise<unknown> {
  if (segs.length === 0) return null;
  const bloco = chaveDoBloco(segs);
  if (segs.length === 1) {
    // raiz de uma coleção: junta o bloco próprio (se existir) com os sub-blocos "raiz/x"
    const linhas = await sbLerBlocos(bloco);
    if (linhas.length === 0) return null;
    let base: Record<string, unknown> = {};
    for (const l of linhas) {
      if (l.chave === bloco) base = { ...(l.valor as Record<string, unknown>) };
    }
    for (const l of linhas) {
      if (l.chave !== bloco) base[l.chave.slice(bloco.length + 1)] = l.valor;
    }
    return base;
  }
  const linhas = await sbLerBlocos(bloco);
  const linha = linhas.find((l) => l.chave === bloco);
  if (!linha) return null;
  return getByPath(linha.valor, segs.slice(2));
}

async function sbEscrever(segs: string[], value: unknown): Promise<void> {
  if (segs.length === 0) return;
  const bloco = chaveDoBloco(segs);
  if (segs.length <= 2) {
    if (value === null) await sbRemoverBlocos(bloco);
    else await sbGravarBloco(bloco, value);
    return;
  }
  const linhas = await sbLerBlocos(bloco);
  const atual = linhas.find((l) => l.chave === bloco)?.valor;
  const raiz: Record<string, unknown> = atual && typeof atual === "object" ? { ...(atual as Record<string, unknown>) } : {};
  setByPath(raiz, segs.slice(2), value);
  await sbGravarBloco(bloco, raiz);
}

export const usandoFirebaseReal = firebaseAdminConfigurado;

export async function readPath<T = unknown>(pathStr: string): Promise<T | null> {
  if (supabaseConfigurado) {
    return ((await sbLer(pathStr.split("/").filter(Boolean))) ?? null) as T | null;
  }
  if (usandoFirebaseReal) {
    const snap = await getAdminDatabase().ref(pathStr).get();
    return (snap.exists() ? snap.val() : null) as T | null;
  }
  const data = await lerArquivoLocal();
  return getByPath(data, pathStr.split("/").filter(Boolean)) as T | null;
}

export async function writePath(pathStr: string, value: unknown): Promise<void> {
  if (supabaseConfigurado) {
    await sbEscrever(pathStr.split("/").filter(Boolean), value);
    return;
  }
  if (usandoFirebaseReal) {
    await getAdminDatabase().ref(pathStr).set(value);
    return;
  }
  const data = await lerArquivoLocal();
  setByPath(data, pathStr.split("/").filter(Boolean), value);
  await escreverArquivoLocal(data);
}

export async function updatePath(pathStr: string, value: Record<string, unknown>): Promise<void> {
  if (supabaseConfigurado) {
    const segs = pathStr.split("/").filter(Boolean);
    const atual = ((await sbLer(segs)) as Record<string, unknown>) || {};
    await sbEscrever(segs, { ...atual, ...value });
    return;
  }
  if (usandoFirebaseReal) {
    await getAdminDatabase().ref(pathStr).update(value);
    return;
  }
  const data = await lerArquivoLocal();
  const atual = (getByPath(data, pathStr.split("/").filter(Boolean)) as Record<string, unknown>) || {};
  setByPath(data, pathStr.split("/").filter(Boolean), { ...atual, ...value });
  await escreverArquivoLocal(data);
}

export async function pushPath(pathStr: string, value: unknown): Promise<string> {
  const id = pushId();
  await writePath(`${pathStr}/${id}`, value);
  return id;
}

export async function removePath(pathStr: string): Promise<void> {
  if (supabaseConfigurado) {
    await sbEscrever(pathStr.split("/").filter(Boolean), null);
    return;
  }
  if (usandoFirebaseReal) {
    await getAdminDatabase().ref(pathStr).remove();
    return;
  }
  const data = await lerArquivoLocal();
  setByPath(data, pathStr.split("/").filter(Boolean), null);
  await escreverArquivoLocal(data);
}
