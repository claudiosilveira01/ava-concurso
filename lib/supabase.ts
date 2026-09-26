// Acesso ao Supabase (banco online + armazenamento de PDFs) só pelo servidor.
// Usa a API REST direto (fetch), sem biblioteca extra. A chave secreta NUNCA vai pro navegador.
export const BUCKET_PDFS = "aulas-pdf";

const url = (process.env.SUPABASE_URL || "").replace(/\/$/, "");
const chave = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

export const supabaseConfigurado = Boolean(url && chave);

function cabecalhos(extra: Record<string, string> = {}): Record<string, string> {
  return { apikey: chave, Authorization: `Bearer ${chave}`, ...extra };
}

async function checar(res: Response, contexto: string): Promise<Response> {
  if (!res.ok) {
    const texto = await res.text().catch(() => "");
    throw new Error(`Supabase (${contexto}) falhou: ${res.status} ${texto.slice(0, 200)}`);
  }
  return res;
}

/** Linhas de ava_dados cuja chave é exatamente `chave` ou começa com `chave/`. */
export async function sbLerBlocos(prefixo: string): Promise<{ chave: string; valor: unknown }[]> {
  const filtro = `or=(chave.eq.${encodeURIComponent(prefixo)},chave.like.${encodeURIComponent(prefixo + "/*")})`;
  const res = await checar(
    await fetch(`${url}/rest/v1/ava_dados?select=chave,valor&${filtro}`, { headers: cabecalhos(), cache: "no-store" }),
    "ler"
  );
  return res.json();
}

export async function sbGravarBloco(chaveBloco: string, valor: unknown): Promise<void> {
  await checar(
    await fetch(`${url}/rest/v1/ava_dados?on_conflict=chave`, {
      method: "POST",
      headers: cabecalhos({ "Content-Type": "application/json", Prefer: "resolution=merge-duplicates" }),
      body: JSON.stringify({ chave: chaveBloco, valor, atualizado_em: new Date().toISOString() }),
      cache: "no-store",
    }),
    "gravar"
  );
}

export async function sbRemoverBlocos(prefixo: string): Promise<void> {
  const filtro = `or=(chave.eq.${encodeURIComponent(prefixo)},chave.like.${encodeURIComponent(prefixo + "/*")})`;
  await checar(
    await fetch(`${url}/rest/v1/ava_dados?${filtro}`, { method: "DELETE", headers: cabecalhos(), cache: "no-store" }),
    "remover"
  );
}

/** Link temporário (60s) para abrir um PDF do armazenamento privado. */
export async function sbLinkPdf(chaveArquivo: string): Promise<string> {
  const caminho = chaveArquivo.split("/").map(encodeURIComponent).join("/");
  const res = await checar(
    await fetch(`${url}/storage/v1/object/sign/${BUCKET_PDFS}/${caminho}`, {
      method: "POST",
      headers: cabecalhos({ "Content-Type": "application/json" }),
      body: JSON.stringify({ expiresIn: 60 }),
      cache: "no-store",
    }),
    "link do PDF"
  );
  const { signedURL } = (await res.json()) as { signedURL: string };
  return `${url}/storage/v1${signedURL}`;
}
