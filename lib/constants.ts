import type { Cronograma, DiaSemana } from "./types";

export const DIAS_SEMANA: DiaSemana[] = [
  "segunda",
  "terça",
  "quarta",
  "quinta",
  "sexta",
  "sábado",
  "domingo",
];

export const DIAS_SEMANA_LABEL: Record<DiaSemana, string> = {
  segunda: "Segunda-feira",
  terça: "Terça-feira",
  quarta: "Quarta-feira",
  quinta: "Quinta-feira",
  sexta: "Sexta-feira",
  sábado: "Sábado",
  domingo: "Domingo",
};

export const CRONOGRAMA_SEMANAL: Cronograma = {
  segunda: ["Língua Portuguesa", "Direito Administrativo"],
  terça: ["Raciocínio Lógico Matemático", "Direito Constitucional"],
  quarta: ["Noções de Informática", "Direito Previdenciário"],
  quinta: ["Administração Pública", "Legislação Especial"],
  sexta: ["Direito Penal", "Processo Penal", "Ética no Serviço Público", "Arquivologia"],
  sábado: ["Redação", "Revisão Geral"],
  domingo: [],
};

export interface DisciplinaConfig {
  id: string;
  nome: string;
  cor: string;
  /** Nome de um ícone de components/ui/DisciplinaIcon.tsx (não emoji). */
  icone: string;
  /** Nome da subpasta dentro da pasta local de aulas (ver POTENCIAL_CONCURSOS_PATH em lib/localLibrary.ts). */
  pastaLocal: string;
}

export const DISCIPLINAS_CONFIG: DisciplinaConfig[] = [
  { id: "portugues", nome: "Língua Portuguesa", cor: "#3B82F6", icone: "BookOpen", pastaLocal: "PORTUGUES" },
  { id: "raciocinio_logico", nome: "Raciocínio Lógico Matemático", cor: "#8B5CF6", icone: "Calculator", pastaLocal: "RACIOCINIO_LOGICO" },
  { id: "direito_administrativo", nome: "Direito Administrativo", cor: "#10B981", icone: "Landmark", pastaLocal: "DIREITO_ADMINISTRATIVO" },
  { id: "direito_constitucional", nome: "Direito Constitucional", cor: "#EF4444", icone: "Scale", pastaLocal: "DIREITO_CONSTITUCIONAL" },
  { id: "informatica", nome: "Noções de Informática", cor: "#F59E0B", icone: "Monitor", pastaLocal: "NOCOES_DE_INFORMATICA" },
  { id: "direito_previdenciario", nome: "Direito Previdenciário", cor: "#EC4899", icone: "HeartPulse", pastaLocal: "DIREITO_PREVIDENCIARIO_INSS" },
  { id: "administracao_publica", nome: "Administração Pública", cor: "#06B6D4", icone: "Building2", pastaLocal: "ADMINISTRACAO_PUBLICA" },
  { id: "legislacao", nome: "Legislação Especial", cor: "#F97316", icone: "Gavel", pastaLocal: "LEGISLACAO" },
  { id: "direito_penal", nome: "Direito Penal", cor: "#6366F1", icone: "ShieldAlert", pastaLocal: "DIREITO_PENAL_TJ" },
  { id: "processo_penal", nome: "Processo Penal", cor: "#FB7185", icone: "FolderOpen", pastaLocal: "PROCESSO_PENAL_TJ" },
  { id: "etica", nome: "Ética no Serviço Público", cor: "#14B8A6", icone: "Handshake", pastaLocal: "ETICA_NO_SERVICO_PUBLICO" },
  { id: "arquivologia", nome: "Arquivologia", cor: "#64748B", icone: "Archive", pastaLocal: "ARQUIVOLOGIA" },
  { id: "redacao", nome: "Redação", cor: "#84CC16", icone: "PenLine", pastaLocal: "REDACAO_TJ" },
];

/**
 * Material extra: pastas de PDFs que NÃO fazem parte do cronograma semanal. Aparecem só
 * na Biblioteca, num grupo à parte. O id sempre começa com "extra_" (é assim que o sistema
 * sabe que não entra na conta de progresso das disciplinas).
 */
export interface ExtraConfig {
  id: string;
  nome: string;
  cor: string;
  pastaLocal: string;
}

export const EXTRAS_CONFIG: ExtraConfig[] = [
  { id: "extra_legislacao_alepa", nome: "Legislação ALEPA", cor: "#F97316", pastaLocal: "LEGISLACAO_ALEPA" },
  { id: "extra_maratona_gabaritando", nome: "Maratona Gabaritando", cor: "#EF4444", pastaLocal: "MARATONA_GABARITANDO" },
  { id: "extra_minicurso", nome: "Minicurso", cor: "#8B5CF6", pastaLocal: "MINICURSO" },
  { id: "extra_simulados", nome: "Simulados", cor: "#06B6D4", pastaLocal: "SIMULADOS" },
  { id: "extra_mentoria", nome: "Mentoria", cor: "#10B981", pastaLocal: "MENTORIA" },
];

export const EXTRA_POR_ID: Record<string, ExtraConfig> = Object.fromEntries(EXTRAS_CONFIG.map((e) => [e.id, e]));

export function ehExtra(id: string): boolean {
  return id.startsWith("extra_");
}

export const PASTA_PARA_DISCIPLINA: Record<string, string> = Object.fromEntries(
  DISCIPLINAS_CONFIG.map((d) => [d.pastaLocal, d.id])
);

export const DISCIPLINA_POR_ID: Record<string, DisciplinaConfig> = Object.fromEntries(
  DISCIPLINAS_CONFIG.map((d) => [d.id, d])
);

/**
 * Casa um nome de disciplina (como os do cronograma) com o id correspondente.
 * Só compara nome completo (case-insensitive) — CUIDADO: uma versão anterior comparava
 * só a primeira palavra do nome, o que fazia "Direito Constitucional", "Direito
 * Previdenciário" e "Direito Penal" caírem todos errado em "direito_administrativo"
 * (primeiro "Direito ..." da lista). Os nomes usados em CRONOGRAMA_SEMANAL já batem
 * exatamente com DISCIPLINAS_CONFIG, então match exato é suficiente.
 */
export function nomeDisciplinaParaId(nome: string): string | undefined {
  const alvo = nome.trim().toLowerCase();
  return DISCIPLINAS_CONFIG.find((d) => d.nome.toLowerCase() === alvo)?.id;
}

export const NAV_ITEMS = [
  { href: "/", label: "Dashboard", icon: "LayoutDashboard" },
  { href: "/cronograma", label: "Cronograma", icon: "CalendarDays" },
  { href: "/biblioteca", label: "Biblioteca", icon: "Library" },
  { href: "/progresso", label: "Progresso", icon: "BarChart3" },
] as const;
