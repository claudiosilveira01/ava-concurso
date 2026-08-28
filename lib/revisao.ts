// Lista de "revisão da semana": aulas de segunda a sexta que ficaram sem o checklist
// marcado, pra reaparecer no sábado. Só olha a semana atual (a que termina no sábado
// informado) — nada de acumular semanas antigas.
import { readPath } from "./store";
import { CRONOGRAMA_SEMANAL, nomeDisciplinaParaId } from "./constants";
import { calcularItemAgendaDisciplina } from "./agenda";
import { adicionarDias, formatarDataISO, inicioDaSemana, slugify } from "./utils";
import type { ChecklistItemArmazenado, DiaSemana, ItemRevisao } from "./types";

const DIAS_UTEIS_REVISAO: DiaSemana[] = ["segunda", "terça", "quarta", "quinta", "sexta"];

/**
 * Para a semana que contém `dataSabadoISO` (default: hoje), percorre segunda a sexta e
 * junta, pra cada disciplina real programada naquele dia, a aula pendente dela SE o
 * checklist daquele dia+disciplina não estiver marcado como concluído. Slots genéricos
 * do cronograma (sem disciplina real associada, ex: "Revisão Geral") são ignorados aqui
 * — não fazem sentido "revisar".
 */
export async function calcularRevisaoDaSemana(
  dataSabadoISO: string = formatarDataISO()
): Promise<ItemRevisao[]> {
  const segundaISO = inicioDaSemana(dataSabadoISO);
  const cronogramaSalvo = await readPath<Record<string, string[]>>("cronograma");
  const cronograma = cronogramaSalvo || CRONOGRAMA_SEMANAL;

  const resultado: ItemRevisao[] = [];

  for (let i = 0; i < DIAS_UTEIS_REVISAO.length; i++) {
    const dia = DIAS_UTEIS_REVISAO[i];
    const dataDia = adicionarDias(segundaISO, i);
    const nomesDisciplinas = cronograma[dia] || [];
    if (nomesDisciplinas.length === 0) continue;

    const checklistDia = (await readPath<Record<string, ChecklistItemArmazenado>>(`checklist/${dataDia}`)) || {};

    for (const nome of nomesDisciplinas) {
      const disciplinaId = nomeDisciplinaParaId(nome);
      if (!disciplinaId) continue; // ignora slots genéricos sem disciplina real

      const chave = slugify(nome);
      const marcado = checklistDia[chave]?.concluida === true;
      if (marcado) continue;

      const item = await calcularItemAgendaDisciplina(nome);
      resultado.push({ ...item, diaOrigem: dia, dataOrigem: dataDia });
    }
  }

  return resultado;
}
