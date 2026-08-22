// Extrai metadados reais de dentro do PDF (não do nome do arquivo).
// O material do cursinho segue um cabeçalho quase sempre presente na 1ª página:
//   DISCIPLINA: <nome>
//   PROF(ESSOR): <nome>
//   DATA: <dd/mm/aaaa ou dd-mm-aa>
// e logo após a frase de efeito "SEJA VOCÊ O NOSSO PRÓXIMO APROVADO!!!" costuma
// vir uma linha-título com o assunto da aula (ex: "LEI ANTICORRUPÇÃO").
import { PDFParse } from "pdf-parse";
import { promises as fs } from "fs";

export interface MetadadosPDF {
  data: string | null; // YYYY-MM-DD
  disciplinaTexto: string | null;
  professor: string | null;
  assunto: string | null;
}

const REGEX_DATA = /DATA:\s*(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/i;
const REGEX_DISCIPLINA = /DISCIPLINA:\s*([^\n\r]+)/i;
const REGEX_PROFESSOR = /PROFESSOR[A]?:\s*([^\n\r]+)|PROF:\s*([^\n\r]+)/i;
const MARCADOR_BOILERPLATE = /SEJA\s+VOC[ÊE]\s+O\s+NOSSO\s+PR[ÓO]XIMO\s+APROVADO/i;

function normalizarData(dia: string, mes: string, ano: string): string | null {
  const diaNum = parseInt(dia, 10);
  const mesNum = parseInt(mes, 10);
  let anoNum = parseInt(ano, 10);
  if (ano.length === 2) anoNum += 2000;
  if (mesNum < 1 || mesNum > 12 || diaNum < 1 || diaNum > 31) return null;
  return `${anoNum}-${String(mesNum).padStart(2, "0")}-${String(diaNum).padStart(2, "0")}`;
}

/** Pega a linha logo após o slogan padrão do material como "assunto" da aula. */
function extrairAssunto(texto: string): string | null {
  const linhas = texto
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  const idxBoilerplate = linhas.findIndex((l) => MARCADOR_BOILERPLATE.test(l));
  if (idxBoilerplate === -1) return null;

  // Olha as poucas linhas seguintes ao slogan e pega a primeira que parece mesmo
  // um título (não citação, não número solto, não início de questão, não parágrafo).
  for (let i = idxBoilerplate + 1; i < Math.min(idxBoilerplate + 4, linhas.length); i++) {
    const candidata = linhas[i];
    if (!candidata) continue;
    if (/^["“]/.test(candidata)) continue; // costuma ser citação motivacional, não assunto
    if (/^\d{1,3}\s*[-–.)]?\s*$/.test(candidata)) continue; // número solto ou início de questão
    if (candidata.length < 3 || candidata.length > 70) continue; // curto/longo demais pra ser título
    if (/\t/.test(candidata)) continue; // texto com tabs = trecho de parágrafo, não título
    if (candidata.split(" ").length > 9) continue; // muitas palavras = frase corrida, não título
    if (!/[a-zA-ZÀ-ÿ]{2,}/.test(candidata)) continue; // sem palavra de verdade (emoji/símbolo solto)
    return candidata.replace(/[:.]$/, "").trim();
  }
  return null;
}

/** Lê só a primeira página do PDF (mais rápido) e extrai os campos do cabeçalho. */
export async function extrairMetadadosPDF(caminhoArquivo: string): Promise<MetadadosPDF> {
  const buffer = await fs.readFile(caminhoArquivo);
  const parser = new PDFParse({ data: buffer });
  try {
    const resultado = await parser.getText({ first: 1 });
    const texto = resultado.text || "";

    const matchData = texto.match(REGEX_DATA);
    const matchDisciplina = texto.match(REGEX_DISCIPLINA);
    const matchProfessor = texto.match(REGEX_PROFESSOR);

    return {
      data: matchData ? normalizarData(matchData[1], matchData[2], matchData[3]) : null,
      disciplinaTexto: matchDisciplina ? matchDisciplina[1].trim() : null,
      professor: matchProfessor ? (matchProfessor[1] || matchProfessor[2] || "").trim() : null,
      assunto: extrairAssunto(texto),
    };
  } finally {
    await parser.destroy();
  }
}
