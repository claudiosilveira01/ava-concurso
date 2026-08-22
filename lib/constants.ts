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
  sexta: ["Direito Penal/Processo Penal", "Ética/Arquivologia"],
  sábado: ["Redação", "Revisão Geral"],
  domingo: [],
};

export interface DisciplinaConfig {
  id: string;
  nome: string;
  cor: string;
  emoji: string;
  pastaGoogleDrive: string;
}

export const DISCIPLINAS_CONFIG: DisciplinaConfig[] = [
  { id: "portugues", nome: "Língua Portuguesa", cor: "#3B82F6", emoji: "📖", pastaGoogleDrive: "PORTUGUES" },
  { id: "raciocinio_logico", nome: "Raciocínio Lógico Matemático", cor: "#8B5CF6", emoji: "🧮", pastaGoogleDrive: "RACIOCINIO_LOGICO" },
  { id: "direito_administrativo", nome: "Direito Administrativo", cor: "#10B981", emoji: "⚖️", pastaGoogleDrive: "DIREITO_ADMINISTRATIVO" },
  { id: "direito_constitucional", nome: "Direito Constitucional", cor: "#EF4444", emoji: "📜", pastaGoogleDrive: "DIREITO_CONSTITUCIONAL" },
  { id: "informatica", nome: "Noções de Informática", cor: "#F59E0B", emoji: "💻", pastaGoogleDrive: "NOCOES_DE_INFORMATICA" },
  { id: "direito_previdenciario", nome: "Direito Previdenciário", cor: "#EC4899", emoji: "🏥", pastaGoogleDrive: "DIREITO_PREVIDENCIARIO_INSS" },
  { id: "administracao_publica", nome: "Administração Pública", cor: "#06B6D4", emoji: "🏛️", pastaGoogleDrive: "ADMINISTRACAO_PUBLICA" },
  { id: "legislacao", nome: "Legislação Especial", cor: "#F97316", emoji: "📋", pastaGoogleDrive: "LEGISLACAO" },
  { id: "direito_penal", nome: "Direito Penal", cor: "#6366F1", emoji: "🚔", pastaGoogleDrive: "DIREITO_PENAL_TJ" },
  { id: "processo_penal", nome: "Processo Penal", cor: "#FB7185", emoji: "📁", pastaGoogleDrive: "PROCESSO_PENAL_TJ" },
  { id: "etica", nome: "Ética no Serviço Público", cor: "#14B8A6", emoji: "🤝", pastaGoogleDrive: "ETICA_NO_SERVICO_PUBLICO" },
  { id: "arquivologia", nome: "Arquivologia", cor: "#64748B", emoji: "🗄️", pastaGoogleDrive: "ARQUIVOLOGIA" },
  { id: "redacao", nome: "Redação", cor: "#84CC16", emoji: "✍️", pastaGoogleDrive: "REDACAO_TJ" },
];

export const PASTA_PARA_DISCIPLINA: Record<string, string> = Object.fromEntries(
  DISCIPLINAS_CONFIG.map((d) => [d.pastaGoogleDrive, d.id])
);

export const DISCIPLINA_POR_ID: Record<string, DisciplinaConfig> = Object.fromEntries(
  DISCIPLINAS_CONFIG.map((d) => [d.id, d])
);

export function nomeDisciplinaParaId(nome: string): string | undefined {
  const match = DISCIPLINAS_CONFIG.find(
    (d) => d.nome.toLowerCase() === nome.toLowerCase() || nome.toLowerCase().includes(d.nome.toLowerCase().split(" ")[0])
  );
  return match?.id;
}

export const HORARIO_ESTUDO_DEFAULT = "09:00";
export const NOTIFICACAO_MINUTOS_DEFAULT = 30;

export const NAV_ITEMS = [
  { href: "/", label: "Dashboard", icon: "LayoutDashboard" },
  { href: "/cronograma", label: "Cronograma", icon: "Calendar" },
  { href: "/disciplinas", label: "Disciplinas", icon: "BookOpen" },
  { href: "/biblioteca", label: "Biblioteca", icon: "Library" },
  { href: "/relatorios", label: "Relatórios", icon: "FileText" },
  { href: "/calendario", label: "Google Calendar", icon: "CalendarClock" },
  { href: "/progresso", label: "Progresso", icon: "BarChart3" },
] as const;
