// Publica o AVA na nuvem (Supabase): sobe os PDFs e copia seus dados atuais.
// Uso (uma vez):  node scripts/publicar-nuvem.mjs "<pasta dos PDFs>"
// Precisa das variáveis SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY no ambiente.
// Pode rodar de novo sem medo: só atualiza; não apaga nada e não duplica.
import { promises as fs } from "fs";
import path from "path";

const URL_BASE = (process.env.SUPABASE_URL || "").replace(/\/$/, "");
const CHAVE = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const PASTA_PDFS = process.argv[2];
const SO_TESTAR = process.argv.includes("--simular");
if (!URL_BASE || !CHAVE || !PASTA_PDFS) {
  console.error('Faltam SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY ou a pasta dos PDFs.');
  process.exit(1);
}
const H = { apikey: CHAVE, Authorization: `Bearer ${CHAVE}` };

const DISCIPLINAS = {
  PORTUGUES: "portugues", RACIOCINIO_LOGICO: "raciocinio_logico", DIREITO_ADMINISTRATIVO: "direito_administrativo",
  DIREITO_CONSTITUCIONAL: "direito_constitucional", NOCOES_DE_INFORMATICA: "informatica",
  DIREITO_PREVIDENCIARIO_INSS: "direito_previdenciario", ADMINISTRACAO_PUBLICA: "administracao_publica",
  LEGISLACAO: "legislacao", DIREITO_PENAL_TJ: "direito_penal", PROCESSO_PENAL_TJ: "processo_penal",
  ETICA_NO_SERVICO_PUBLICO: "etica", ARQUIVOLOGIA: "arquivologia", REDACAO_TJ: "redacao",
};
const EXTRAS = {
  LEGISLACAO_ALEPA: "extra_legislacao_alepa", MARATONA_GABARITANDO: "extra_maratona_gabaritando",
  MINICURSO: "extra_minicurso", SIMULADOS: "extra_simulados", MENTORIA: "extra_mentoria",
};

// mesma regra do sistema (lib/utils.ts → slugify)
const slugify = (t) =>
  t.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[.#$/\[\]]/g, "-").replace(/\s+/g, "_").toLowerCase();
// chave segura para o armazenamento (sem acento, espaço ou parênteses)
const chaveArquivo = (pasta, nome) =>
  `${pasta}/${nome.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^A-Za-z0-9._-]+/g, "_")}`;

function infoDoNome(nomeArquivo) {
  let base = nomeArquivo.replace(/\.pdf$/i, "").replace(/\s*\([A-Za-zÀ-ÿ0-9_]+\)\s*$/, "");
  const m = base.match(/^Aula[_\s]+(\d+(?:\.\d+)?)[_\s]*(.*)$/i);
  const numero = m ? parseFloat(m[1]) : null;
  const titulo = (m ? m[2] : base).replace(/[_-]+/g, " ").replace(/\s+/g, " ").trim() || base;
  return { numero, titulo };
}

async function http(url, opts, ctx) {
  const res = await fetch(url, opts);
  if (!res.ok) throw new Error(`${ctx}: ${res.status} ${(await res.text()).slice(0, 200)}`);
  return res;
}
async function gravarBloco(chave, valor) {
  if (SO_TESTAR) return;
  await http(`${URL_BASE}/rest/v1/ava_dados?on_conflict=chave`, {
    method: "POST",
    headers: { ...H, "Content-Type": "application/json", Prefer: "resolution=merge-duplicates" },
    body: JSON.stringify({ chave, valor, atualizado_em: new Date().toISOString() }),
  }, `gravar ${chave}`);
}
async function subirPdf(chave, buffer) {
  if (SO_TESTAR) return;
  const caminho = chave.split("/").map(encodeURIComponent).join("/");
  await http(`${URL_BASE}/storage/v1/object/aulas-pdf/${caminho}`, {
    method: "POST",
    headers: { ...H, "Content-Type": "application/pdf", "x-upsert": "true" },
    body: buffer,
  }, `enviar ${chave}`);
}

const db = JSON.parse(await fs.readFile(path.join(process.cwd(), ".data", "db.json"), "utf-8"));
const aulasPorDisc = {}; // id -> { aulaId: aula }
let enviados = 0, bytes = 0, novasAulas = 0;

const todasPastas = [...Object.entries(DISCIPLINAS), ...Object.entries(EXTRAS)];
for (const [pasta, discId] of todasPastas) {
  let nomes;
  try { nomes = (await fs.readdir(path.join(PASTA_PDFS, pasta))).filter((f) => /\.pdf$/i.test(f)); }
  catch { console.log(`(pasta ${pasta} não encontrada, pulando)`); continue; }

  const existentes = db.aulas?.[discId] || {};
  const porNome = Object.fromEntries(Object.values(existentes).map((a) => [a.nomeArquivo, a]));
  aulasPorDisc[discId] = {};

  for (const nome of nomes) {
    const buffer = await fs.readFile(path.join(PASTA_PDFS, pasta, nome));
    const chave = chaveArquivo(pasta, nome);
    await subirPdf(chave, buffer);
    enviados++; bytes += buffer.length;

    const antiga = porNome[nome];
    let aula;
    if (antiga) {
      aula = { ...antiga, arquivoChave: chave, tamanho: buffer.length };
    } else {
      const { numero, titulo } = infoDoNome(nome);
      aula = {
        id: `aula_${slugify(nome.replace(/\.pdf$/i, ""))}`, numero, titulo, disciplina: discId, data: null,
        caminhoArquivo: "", nomeArquivo: nome, tamanho: buffer.length, concluida: false, completadoEm: null,
        criadoEm: new Date().toISOString(), arquivoChave: chave,
      };
      novasAulas++;
    }
    aulasPorDisc[discId][aula.id] = aula;
  }
  console.log(`${pasta}: ${nomes.length} PDFs`);
}

// blocos de dados
await gravarBloco("cronograma", db.cronograma);
await gravarBloco("usuarios/default", db.usuarios.default);
for (const [id, d] of Object.entries(db.disciplinas)) {
  const aulas = Object.values(aulasPorDisc[id] || {});
  const concl = aulas.filter((a) => a.concluida).length;
  await gravarBloco(`disciplinas/${id}`, {
    ...d, totalAulas: aulas.length, totalAulasConcluidas: concl,
    progresso: aulas.length ? Math.round((concl / aulas.length) * 100) : 0,
  });
}
for (const [id, aulas] of Object.entries(aulasPorDisc)) await gravarBloco(`aulas/${id}`, aulas);
for (const [data, itens] of Object.entries(db.checklist || {})) await gravarBloco(`checklist/${data}`, itens);
for (const [data, rel] of Object.entries(db.relatorios || {})) await gravarBloco(`relatorios/${data}`, rel);

console.log(`\n${SO_TESTAR ? "[SIMULAÇÃO] " : ""}PDFs: ${enviados} (${(bytes / 1048576).toFixed(1)} MB) | aulas novas no cadastro: ${novasAulas}`);
