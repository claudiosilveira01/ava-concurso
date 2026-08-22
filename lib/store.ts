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

const DB_FILE = path.join(process.cwd(), ".data", "db.json");

function seedInicial(): Record<string, unknown> {
  const disciplinas: Record<string, Disciplina> = {};
  for (const d of DISCIPLINAS_CONFIG) {
    disciplinas[d.id] = {
      id: d.id,
      nome: d.nome,
      cor: d.cor,
      emoji: d.emoji,
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
    relatorios: {},
    // "progresso" fica de fora do seed: rotas que fazem readPath("progresso") tratam
    // qualquer valor salvo como já calculado, então um {} aqui faria elas devolverem
    // vazio em vez de cair no cálculo de fallback a partir de relatorios/disciplinas.
    calendario: {},
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

export const usandoFirebaseReal = firebaseAdminConfigurado;

export async function readPath<T = unknown>(pathStr: string): Promise<T | null> {
  if (usandoFirebaseReal) {
    const snap = await getAdminDatabase().ref(pathStr).get();
    return (snap.exists() ? snap.val() : null) as T | null;
  }
  const data = await lerArquivoLocal();
  return getByPath(data, pathStr.split("/").filter(Boolean)) as T | null;
}

export async function writePath(pathStr: string, value: unknown): Promise<void> {
  if (usandoFirebaseReal) {
    await getAdminDatabase().ref(pathStr).set(value);
    return;
  }
  const data = await lerArquivoLocal();
  setByPath(data, pathStr.split("/").filter(Boolean), value);
  await escreverArquivoLocal(data);
}

export async function updatePath(pathStr: string, value: Record<string, unknown>): Promise<void> {
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
  if (usandoFirebaseReal) {
    await getAdminDatabase().ref(pathStr).remove();
    return;
  }
  const data = await lerArquivoLocal();
  setByPath(data, pathStr.split("/").filter(Boolean), null);
  await escreverArquivoLocal(data);
}
