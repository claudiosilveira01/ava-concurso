// Cliente OAuth2 compartilhado entre Google Drive e Google Calendar.
// Um único par de credenciais (mesmo projeto no Google Cloud Console) cobre as duas APIs
// — ver DESCRICAO_TECNICA_AVA_CONCURSOS.md, seção "Reutilização de OAuth".
import { google } from "googleapis";

export const googleConfigurado = Boolean(
  process.env.GOOGLE_DRIVE_CLIENT_ID &&
    process.env.GOOGLE_DRIVE_CLIENT_SECRET &&
    process.env.GOOGLE_DRIVE_REFRESH_TOKEN
);

export function getGoogleAuthClient() {
  if (!googleConfigurado) {
    throw new Error(
      "Credenciais do Google não configuradas (GOOGLE_DRIVE_CLIENT_ID / GOOGLE_DRIVE_CLIENT_SECRET / GOOGLE_DRIVE_REFRESH_TOKEN)"
    );
  }
  const auth = new google.auth.OAuth2(
    process.env.GOOGLE_DRIVE_CLIENT_ID,
    process.env.GOOGLE_DRIVE_CLIENT_SECRET,
    process.env.GOOGLE_DRIVE_REDIRECT_URL || "urn:ietf:wg:oauth:2.0:oob"
  );
  auth.setCredentials({ refresh_token: process.env.GOOGLE_DRIVE_REFRESH_TOKEN });
  return auth;
}
