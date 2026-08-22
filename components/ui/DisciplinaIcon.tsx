import {
  BookOpen,
  Calculator,
  Landmark,
  Scale,
  Monitor,
  HeartPulse,
  Building2,
  Gavel,
  ShieldAlert,
  FolderOpen,
  Handshake,
  Archive,
  PenLine,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { DISCIPLINA_POR_ID } from "@/lib/constants";

const ICONES: Record<string, LucideIcon> = {
  BookOpen,
  Calculator,
  Landmark,
  Scale,
  Monitor,
  HeartPulse,
  Building2,
  Gavel,
  ShieldAlert,
  FolderOpen,
  Handshake,
  Archive,
  PenLine,
};

export interface DisciplinaIconProps {
  /** Id da disciplina (ex: "portugues") ou o nome do ícone diretamente (ex: "BookOpen"). */
  disciplinaId?: string;
  icone?: string;
  className?: string;
  style?: React.CSSProperties;
}

export function DisciplinaIcon({ disciplinaId, icone, className, style }: DisciplinaIconProps) {
  const nomeIcone = icone ?? (disciplinaId ? DISCIPLINA_POR_ID[disciplinaId]?.icone : undefined);
  const Icon = (nomeIcone && ICONES[nomeIcone]) || BookOpen;
  return <Icon className={cn("h-5 w-5", className)} style={style} />;
}
