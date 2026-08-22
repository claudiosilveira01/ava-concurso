import { formatarDataBR } from "./utils";
import { DISCIPLINA_POR_ID } from "./constants";
import type { Relatorio, RelatorioFormData } from "./types";

/** Disciplinas são salvas por id (mesma chave usada em "desempenho"); aqui só exibimos o nome legível. */
function nomeDisciplina(idOuNome: string): string {
  return DISCIPLINA_POR_ID[idOuNome]?.nome ?? idOuNome;
}

function linhasParaLista(texto: string): string {
  if (!texto.trim()) return "- _nenhum registro_";
  return texto
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .map((l) => (l.startsWith("-") ? l : `- ${l}`))
    .join("\n");
}

/** Gera o Markdown de um relatório diário no formato pronto para consumo pelo Gemini Notebook. */
export function gerarMarkdownRelatorio(dados: RelatorioFormData & { data: string }): string {
  const disciplinas =
    dados.disciplinasEstudadas.map((d) => `- [x] ${nomeDisciplina(d)}`).join("\n") || "- _nenhuma_";

  const linhasDesempenho = Object.entries(dados.desempenho);
  const desempenhoMedio = linhasDesempenho.length
    ? Math.round(linhasDesempenho.reduce((acc, [, v]) => acc + v, 0) / linhasDesempenho.length)
    : 0;

  const tabelaDesempenho = linhasDesempenho.length
    ? [
        "| Disciplina | Acertos |",
        "|------------|---------|",
        ...linhasDesempenho.map(([disc, valor]) => `| ${nomeDisciplina(disc)} | ${valor}% |`),
        `| **Média** | **${desempenhoMedio}%** |`,
      ].join("\n")
    : "_sem exercícios registrados_";

  return `# Relatório de Aprendizagem - ${formatarDataBR(dados.data)}

## 📚 Disciplinas Estudadas
${disciplinas}

## 💡 Conceitos Fundamentais Assimilados
${linhasParaLista(dados.conceitos)}

## ❓ Principais Dúvidas
${linhasParaLista(dados.duvidas)}

## ⚠️ Erros Conceituais / Dificuldades
${linhasParaLista(dados.erros)}

## 📊 Percentual de Acerto nos Exercícios
${tabelaDesempenho}

## 🎯 Pontos Positivos do Dia
${linhasParaLista(dados.pontoPositivos)}

## 📌 Ações para o Próximo Dia
${linhasParaLista(dados.proximasAcoes)}
`;
}

/** Consolida vários relatórios de uma semana em um único Markdown com estatísticas agregadas. */
export function gerarMarkdownSemana(relatorios: Relatorio[], semanaLabel: string): string {
  if (relatorios.length === 0) {
    return `# Resumo da Semana - ${semanaLabel}\n\n_Nenhum relatório registrado nesta semana._\n`;
  }

  const ordenados = [...relatorios].sort((a, b) => a.data.localeCompare(b.data));
  const mediaGeral = Math.round(
    ordenados.reduce((acc, r) => acc + (r.desempenhoMedio || 0), 0) / ordenados.length
  );

  const desempenhoPorDisciplina: Record<string, number[]> = {};
  for (const r of ordenados) {
    for (const [disc, valor] of Object.entries(r.desempenho || {})) {
      (desempenhoPorDisciplina[disc] ??= []).push(valor);
    }
  }

  const tabelaDisciplinas = Object.entries(desempenhoPorDisciplina)
    .map(([disc, valores]) => {
      const media = Math.round(valores.reduce((a, b) => a + b, 0) / valores.length);
      return `| ${nomeDisciplina(disc)} | ${media}% |`;
    })
    .join("\n");

  const secoesDiarias = ordenados
    .map(
      (r) => `## ${formatarDataBR(r.data)}
${r.markdown}`
    )
    .join("\n---\n");

  return `# Resumo da Semana - ${semanaLabel}

## 📊 Estatísticas da Semana
- Dias estudados: ${ordenados.length}
- Desempenho médio geral: **${mediaGeral}%**

| Disciplina | Média |
|------------|-------|
${tabelaDisciplinas || "| _sem dados_ | — |"}

---

${secoesDiarias}
`;
}

export function gerarMarkdownGemini(relatorios: Relatorio[]): string {
  const ordenados = [...relatorios].sort((a, b) => b.data.localeCompare(a.data));
  const header = `# Exportação AVA Concursos - ${ordenados.length} relatório(s)\n\nGerado para consumo automático (Gemini Notebook). Cada seção representa um dia de estudo, com disciplinas, dúvidas, erros e desempenho.\n\n---\n\n`;
  return header + ordenados.map((r) => r.markdown).join("\n---\n\n");
}
