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
  emoji: string;
  totalAulas: number;
  totalAulasConcluidas: number;
  progresso: number; // 0-100
  criadoEm: string;
  sincronizadoEm?: string;
  proximaAula?: string;
}

export interface Aula {
  id: string;
  numero: number;
  titulo: string;
  disciplina: string;
  data: string; // YYYY-MM-DD
  googleDriveId?: string;
  googleDriveUrl: string;
  nomeArquivo?: string;
  tamanho?: number;
  tipo?: string;
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

export interface EventoCalendario {
  id: string;
  googleCalendarId: string;
  googleEventId?: string;
  disciplina: string;
  data: string; // YYYY-MM-DD
  horario: string; // HH:mm
  titulo: string;
  descricao: string;
  url: string;
  notificacaoMinutos: number;
  criadoEm: string;
  sincronizadoEm: string;
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
