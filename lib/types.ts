// Tipos centrais do AVA Concursos. Toda API route e componente importa daqui.

export type DiaSemana =
  | "segunda"
  | "terça"
  | "quarta"
  | "quinta"
  | "sexta"
  | "sábado"
  | "domingo";

export type Cronograma = Record<DiaSemana, string[]>;

export interface Disciplina {
  id: string;
  nome: string;
  cor: string;
  icone: string;
  totalAulas: number;
  totalAulasConcluidas: number;
  progresso: number; // 0-100
  criadoEm: string;
  sincronizadoEm?: string;
  proximaAula?: string;
}

export interface Aula {
  id: string;
  numero: number | null;
  titulo: string; // assunto extraído de dentro do PDF, com fallback pro nome do arquivo
  disciplina: string;
  data: string | null; // YYYY-MM-DD extraída de dentro do PDF (nem todo PDF traz)
  professor?: string;
  caminhoArquivo: string; // caminho absoluto do PDF na pasta local
  nomeArquivo: string;
  tamanho?: number;
  concluida: boolean;
  completadoEm: string | null;
  criadoEm: string;
}

export interface Relatorio {
  data: string; // YYYY-MM-DD
  diasEstudados: string[];
  disciplinasEstudadas: string[];
  conceitos: string;
  duvidas: string;
  erros: string;
  desempenho: Record<string, number>;
  desempenhoMedio: number;
  pontoPositivos: string;
  proximasAcoes: string;
  criadoEm: string;
  atualizadoEm: string;
  markdown: string;
}

export interface RelatorioFormData {
  data?: string;
  diasEstudados: string[];
  disciplinasEstudadas: string[];
  conceitos: string;
  duvidas: string;
  erros: string;
  desempenho: Record<string, number>;
  pontoPositivos: string;
  proximasAcoes: string;
}

export interface Progresso {
  totalAulasCompletadas: number;
  totalRelatorios: number;
  diasConsecutivos: number;
  desempenhoMedio: number;
  desempenhoPorDisciplina: Record<string, number>;
  ultimaAtualizacao: string;
}

export interface ProgressoSemanal {
  semana: string; // YYYY-MM-DD (segunda-feira da semana)
  totalAulasConcluidas: number;
  totalRelatorios: number;
  diasConsecutivos: number;
  desempenhoMedio: number;
  desempenhoPorDisciplina: Record<string, number>;
  atualizado: string;
}

/** Agenda inteligente do dia: para cada disciplina do cronograma de hoje, qual é a próxima aula pendente. */
export interface AgendaDia {
  disciplinaId: string;
  disciplinaNome: string;
  cor: string;
  icone: string;
  aulaId: string | null;
  numero: number | null;
  assunto: string | null;
  totalAulas: number;
  totalAulasConcluidas: number;
}

/** Item da lista de revisão de sábado: uma AgendaDia que ficou pendente, mais de qual dia/data. */
export interface ItemRevisao extends AgendaDia {
  diaOrigem: DiaSemana;
  dataOrigem: string; // YYYY-MM-DD
}

/** Resposta de GET /api/dashboard/hoje. revisaoSemana só vem preenchida quando o dia é sábado. */
export interface AgendaHojeResponse {
  agenda: AgendaDia[];
  revisaoSemana: ItemRevisao[];
}

/** Formato salvo em checklist/{data}/{chaveSlug}. */
export interface ChecklistItemArmazenado {
  nome: string;
  concluida: boolean;
  marcadoEm: string;
}

export interface SyncResult {
  adicionadas: number;
  atualizadas: number;
  removidas: number;
}

export interface UsuarioPerfil {
  nome: string;
  email: string;
  ultimoAcesso: string;
  preferencias: {
    modoEscuro: boolean;
    notificacoes: boolean;
    horarioEstudo: string; // HH:mm
  };
}

export interface ApiError {
  error: string;
}

/** Checklist diário do Dashboard: nome-da-disciplina -> concluída hoje. Path: checklist/{data}. */
export type ChecklistDia = Record<string, boolean>;
