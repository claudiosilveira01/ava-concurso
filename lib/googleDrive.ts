import { google } from "googleapis";
import { getGoogleAuthClient, googleConfigurado } from "./googleAuth";
import { PASTA_PARA_DISCIPLINA } from "./constants";
import { extrairMetadadosNomeArquivo } from "./utils";
import { readPath, writePath, updatePath } from "./store";
import type { Aula, SyncResult } from "./types";

/** Escaneia a pasta raiz configurada no Drive e retorna as aulas encontradas, agrupadas por disciplina. */
export async function listarPDFsDrive(): Promise<Record<string, Aula[]>> {
  const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;
  if (!folderId) {
    throw new Error("GOOGLE_DRIVE_FOLDER_ID não configurado");
  }

  const auth = getGoogleAuthClient();
  const drive = google.drive({ version: "v3", auth });

  const subfolders = await drive.files.list({
    q: `'${folderId}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`,
    spaces: "drive",
    pageSize: 100,
    fields: "files(id, name)",
  });

  const resultado: Record<string, Aula[]> = {};

  for (const folder of subfolders.data.files || []) {
    const disciplinaId = folder.name ? PASTA_PARA_DISCIPLINA[folder.name] : undefined;
    if (!disciplinaId || !folder.id) continue; // ignora pastas que não mapeiam para uma disciplina conhecida

    const pdfs = await drive.files.list({
      q: `'${folder.id}' in parents and mimeType='application/pdf' and trashed=false`,
      spaces: "drive",
      orderBy: "name",
      pageSize: 300,
      fields: "files(id, name, size, createdTime, webViewLink)",
    });

    const aulas: Aula[] = (pdfs.data.files || []).map((file, index) => {
      const { numero, titulo } = extrairMetadadosNomeArquivo(file.name || `Aula ${index + 1}`, index + 1);
      return {
        id: `aula_${String(index + 1).padStart(3, "0")}`,
        numero,
        titulo,
        disciplina: disciplinaId,
        data: file.createdTime ? file.createdTime.split("T")[0] : new Date().toISOString().split("T")[0],
        googleDriveId: file.id || undefined,
        googleDriveUrl: file.webViewLink || `https://drive.google.com/file/d/${file.id}/view`,
        nomeArquivo: file.name || undefined,
        tamanho: file.size ? Number(file.size) : undefined,
        tipo: "application/pdf",
        concluida: false,
        completadoEm: null,
        criadoEm: new Date().toISOString(),
      };
    });

    resultado[disciplinaId] = aulas;
  }

  return resultado;
}

/**
 * Compara o Drive com o Firebase/store local: adiciona aulas novas, atualiza metadados
 * de aulas existentes (preservando `concluida`/`completadoEm`) e nunca remove aulas que
 * sumiram do Drive — o usuário pode tê-las movido, não necessariamente deletado.
 */
export async function sincronizarDrive(): Promise<SyncResult> {
  const aulasNoDrive = await listarPDFsDrive();

  let adicionadas = 0;
  let atualizadas = 0;

  for (const [disciplinaId, aulas] of Object.entries(aulasNoDrive)) {
    const aulasExistentes = (await readPath<Record<string, Aula>>(`aulas/${disciplinaId}`)) || {};

    for (const aula of aulas) {
      const existente = aulasExistentes[aula.id];
      if (!existente) {
        await writePath(`aulas/${disciplinaId}/${aula.id}`, aula);
        adicionadas++;
      } else if (existente.googleDriveUrl !== aula.googleDriveUrl || existente.tamanho !== aula.tamanho) {
        await updatePath(`aulas/${disciplinaId}/${aula.id}`, {
          googleDriveUrl: aula.googleDriveUrl,
          tamanho: aula.tamanho,
          nomeArquivo: aula.nomeArquivo,
        });
        atualizadas++;
      }
    }

    const aulasAtualizadas = (await readPath<Record<string, Aula>>(`aulas/${disciplinaId}`)) || {};
    const totalAulas = Object.keys(aulasAtualizadas).length;
    const totalAulasConcluidas = Object.values(aulasAtualizadas).filter((a) => a.concluida).length;

    await updatePath(`disciplinas/${disciplinaId}`, {
      totalAulas,
      totalAulasConcluidas,
      progresso: totalAulas ? Math.round((totalAulasConcluidas / totalAulas) * 100) : 0,
      sincronizadoEm: new Date().toISOString(),
    });
  }

  return { adicionadas, atualizadas, removidas: 0 };
}

export { googleConfigurado as googleDriveConfigurado };
