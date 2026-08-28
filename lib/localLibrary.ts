// Biblioteca local: substitui a integração com Google Drive. Os PDFs das aulas já
// ficam sincronizados no PC do usuário (pasta do Google Drive Desktop montada como
// unidade local) — então basta ler o sistema de arquivos direto, sem OAuth nenhum.
import path from "path";
import { promises as fs } from "fs";
import { DISCIPLINAS_CONFIG } from "./constants";
import { readPath, updatePath, writePath } from "./store";
import { slugify } from "./utils";
import { extrairMetadadosPDF } from "./pdfParser";
import type { Aula, SyncResult } from "./types";

const CAMINHO_PADRAO = "H:\\Meu Drive\\Documentos\\POTENCIAL CONCURSOS";
const LEITURAS_PDF_EM_PARALELO = 6;

export function pastaAulasConfigurada(): string {
  return process.env.POTENCIAL_CONCURSOS_PATH || CAMINHO_PADRAO;
}

export async function pastaAulasExiste(): Promise<boolean> {
  try {
    const stat = await fs.stat(pastaAulasConfigurada());
    return stat.isDirectory();
  } catch {
    return false;
  }
}

/**
 * Extrai número e título a partir do padrão real dos arquivos (renomeados manualmente
 * pelo usuário): "Aula_<N>_<titulo> (<PASTA_DISCIPLINA>).pdf". Suporta sub-aulas com
 * número decimal ("Aula_01.2_..." -> numero 1.2, ordenado certinho entre 1 e 2). Arquivos
 * que não seguem o padrão "Aula_N" (ex: os que o próprio usuário prefixou com "MISFILED_"
 * ou "SEM_MATCH_" por não ter certeza de qual aula eram) ficam com numero null — continuam
 * aparecendo na Biblioteca, mas nunca são escolhidos como "próxima aula pendente".
 */
function extrairInfoNomeArquivo(nomeArquivo: string): { numero: number | null; tituloArquivo: string } {
  let base = nomeArquivo.replace(/\.pdf$/i, "");
  base = base.replace(/\s*\([A-Za-zÀ-ÿ0-9_]+\)\s*$/, "");

  const match = base.match(/^Aula[_\s]+(\d+(?:\.\d+)?)[_\s]*(.*)$/i);
  let numero: number | null = null;
  let resto = base;
  if (match) {
    numero = parseFloat(match[1]);
    resto = match[2];
  }

  const titulo = resto.replace(/[_-]+/g, " ").replace(/\s+/g, " ").trim();
  return { numero, tituloArquivo: titulo || base };
}

/** Roda `tarefa` sobre `itens` com no máximo `concorrencia` execuções simultâneas. */
async function mapComConcorrencia<T, R>(
  itens: T[],
  concorrencia: number,
  tarefa: (item: T) => Promise<R>
): Promise<R[]> {
  const resultados: R[] = new Array(itens.length);
  let proximo = 0;

  async function worker() {
    for (;;) {
      const indice = proximo++;
      if (indice >= itens.length) return;
      resultados[indice] = await tarefa(itens[indice]);
    }
  }

  const numWorkers = Math.min(concorrencia, itens.length);
  await Promise.all(Array.from({ length: numWorkers }, worker));
  return resultados;
}

interface ArquivoPendente {
  nomeArquivo: string;
  caminhoArquivo: string;
  id: string;
  tamanho: number;
  existente?: Aula;
}

/**
 * Varre a pasta local e atualiza o store: adiciona aulas novas, reprocessa (relê o PDF)
 * só quando o arquivo mudou de tamanho, e preserva "concluida"/"completadoEm" das que já
 * existiam. Ler o conteúdo de cada PDF é a parte cara — por isso só faz isso quando
 * necessário (arquivo novo ou de tamanho diferente) e várias leituras em paralelo por
 * disciplina, o que torna a primeira sincronização bem mais rápida e as seguintes quase
 * instantâneas.
 */
export async function sincronizarBibliotecaLocal(): Promise<SyncResult> {
  const raiz = pastaAulasConfigurada();
  let adicionadas = 0;
  let atualizadas = 0;

  for (const config of DISCIPLINAS_CONFIG) {
    const pastaDisciplina = path.join(raiz, config.pastaLocal);

    let nomesArquivos: string[];
    try {
      nomesArquivos = (await fs.readdir(pastaDisciplina)).filter((f) => f.toLowerCase().endsWith(".pdf"));
    } catch {
      continue; // pasta da disciplina ainda não existe localmente
    }

    const aulasExistentes = (await readPath<Record<string, Aula>>(`aulas/${config.id}`)) || {};

    // Passo 1 (rápido, só stat): descobre quais arquivos são novos ou mudaram de tamanho.
    const candidatos = await Promise.all(
      nomesArquivos.map(async (nomeArquivo): Promise<ArquivoPendente | null> => {
        const caminhoArquivo = path.join(pastaDisciplina, nomeArquivo);
        const id = `aula_${slugify(nomeArquivo.replace(/\.pdf$/i, ""))}`;
        const stat = await fs.stat(caminhoArquivo);
        const existente = aulasExistentes[id];
        if (existente && existente.tamanho === stat.size) return null; // sem mudança
        return { nomeArquivo, caminhoArquivo, id, tamanho: stat.size, existente };
      })
    );
    const pendentes = candidatos.filter((c): c is ArquivoPendente => c !== null);

    // Passo 2 (caro): abre e lê o conteúdo de cada PDF pendente, várias por vez.
    const processados = await mapComConcorrencia(pendentes, LEITURAS_PDF_EM_PARALELO, async (item) => {
      const { numero, tituloArquivo } = extrairInfoNomeArquivo(item.nomeArquivo);
      let metadados = { data: null as string | null, assunto: null as string | null, professor: null as string | null };
      try {
        metadados = await extrairMetadadosPDF(item.caminhoArquivo);
      } catch (erro) {
        // PDF protegido/corrompido — segue só com o que dá pra tirar do nome do arquivo
        console.error(`[AVA] falha ao ler PDF "${item.nomeArquivo}":`, erro);
      }

      const aula: Aula = {
        id: item.id,
        numero,
        // Nome do arquivo primeiro: o usuário renomeou tudo manualmente com títulos
        // confiáveis. O assunto lido de dentro do PDF só entra como reserva.
        titulo: tituloArquivo || metadados.assunto || item.nomeArquivo,
        disciplina: config.id,
        data: metadados.data,
        professor: metadados.professor || undefined,
        caminhoArquivo: item.caminhoArquivo,
        nomeArquivo: item.nomeArquivo,
        tamanho: item.tamanho,
        concluida: item.existente?.concluida ?? false,
        completadoEm: item.existente?.completadoEm ?? null,
        criadoEm: item.existente?.criadoEm ?? new Date().toISOString(),
      };
      return { aula, eraNova: !item.existente };
    });

    // Passo 3 (sequencial de propósito): grava no store um de cada vez — o backend local
    // (.data/db.json) lê e reescreve o arquivo inteiro a cada chamada, então gravar em
    // paralelo arriscaria uma escrita sobrescrever a outra.
    for (const { aula, eraNova } of processados) {
      await writePath(`aulas/${config.id}/${aula.id}`, aula);
      if (eraNova) adicionadas++;
      else atualizadas++;
    }

    const aulasAtualizadas = (await readPath<Record<string, Aula>>(`aulas/${config.id}`)) || {};
    const totalAulas = Object.keys(aulasAtualizadas).length;
    const totalAulasConcluidas = Object.values(aulasAtualizadas).filter((a) => a.concluida).length;

    await updatePath(`disciplinas/${config.id}`, {
      totalAulas,
      totalAulasConcluidas,
      progresso: totalAulas ? Math.round((totalAulasConcluidas / totalAulas) * 100) : 0,
      sincronizadoEm: new Date().toISOString(),
    });
  }

  return { adicionadas, atualizadas, removidas: 0 };
}
