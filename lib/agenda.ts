// Grade curricular inteligente: para cada disciplina do cronograma de um dia,
// descobre qual é a próxima aula ainda não concluída (fila em ordem de "numero"
// extraído do nome do arquivo) e usa o título dela como "o que estudar hoje".
import { readPath } from "./store";
import { CRONOGRAMA_SEMANAL, DISCIPLINA_POR_ID, nomeDisciplinaParaId } from "./constants";
import { diaSemanaAtual, slugify } from "./utils";
import type { Aula, AgendaDia, DiaSemana } from "./types";

/** Próxima aula pendente de uma disciplina (pelo nome cru do cronograma, ex: "Língua Portuguesa"). */
export async function calcularItemAgendaDisciplina(nome: string): Promise<AgendaDia> {
  const disciplinaId = nomeDisciplinaParaId(nome);
  const config = disciplinaId ? DISCIPLINA_POR_ID[disciplinaId] : undefined;

  if (!disciplinaId || !config) {
    // Slot genérico do cronograma sem PDFs associados (ex.: "Revisão Geral").
    return {
      disciplinaId: slugify(nome),
      disciplinaNome: nome,
      cor: "#94A3B8",
      icone: "BookOpen",
      aulaId: null,
      assunto: null,
      totalAulas: 0,
      totalAulasConcluidas: 0,
    };
  }

  const aulasDaDisciplina = (await readPath<Record<string, Aula>>(`aulas/${disciplinaId}`)) || {};
  const aulas = Object.values(aulasDaDisciplina).sort((a, b) => (a.numero ?? 999) - (b.numero ?? 999));
  const proxima = aulas.find((a) => !a.concluida);

  return {
    disciplinaId,
    disciplinaNome: config.nome,
    cor: config.cor,
    icone: config.icone,
    aulaId: proxima?.id ?? null,
    assunto: proxima?.titulo ?? null,
    totalAulas: aulas.length,
    totalAulasConcluidas: aulas.filter((a) => a.concluida).length,
  };
}

export async function calcularAgendaDoDia(dia: DiaSemana = diaSemanaAtual()): Promise<AgendaDia[]> {
  const cronogramaSalvo = await readPath<Record<string, string[]>>("cronograma");
  const nomesDisciplinasDia = (cronogramaSalvo || CRONOGRAMA_SEMANAL)[dia] || [];
  return Promise.all(nomesDisciplinasDia.map(calcularItemAgendaDisciplina));
}
