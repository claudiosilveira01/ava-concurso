import { z } from "zod";

export const relatorioFormSchema = z.object({
  data: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Data deve estar no formato YYYY-MM-DD")
    .optional(),
  diasEstudados: z.array(z.string()).default([]),
  disciplinasEstudadas: z.array(z.string()).min(1, "Selecione ao menos uma disciplina"),
  conceitos: z.string().default(""),
  duvidas: z.string().default(""),
  erros: z.string().default(""),
  desempenho: z.record(z.string(), z.number().min(0).max(100)).default({}),
  pontoPositivos: z.string().default(""),
  proximasAcoes: z.string().default(""),
});

export type RelatorioFormInput = z.infer<typeof relatorioFormSchema>;

export const marcarAulaSchema = z.object({
  concluida: z.boolean(),
});

export const sincronizarCalendarSchema = z.object({
  data: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
});

export const exportGeminiSchema = z.object({
  formato: z.enum(["json", "markdown"]).default("markdown"),
  periodo: z.enum(["todas", "ultima_semana"]).default("ultima_semana"),
});
