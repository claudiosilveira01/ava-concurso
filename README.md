# 📚 AVA Concursos

Ambiente Virtual de Aprendizagem pessoal para preparação de concursos públicos — centraliza cronograma, biblioteca de aulas (Google Drive), relatórios diários de aprendizagem, progresso e integração com Google Calendar.

Stack: Next.js 14 (App Router) · TypeScript · Tailwind CSS · Firebase Realtime Database · Google Drive API · Google Calendar API.

## Rodando localmente

```bash
npm install
cp .env.example .env.local
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000).

**O app funciona sem nenhuma credencial configurada.** Enquanto `.env.local` estiver vazio:

- Os dados (disciplinas, aulas, relatórios, progresso, calendário) são gravados em `.data/db.json`, um arquivo local que imita a estrutura do Firebase Realtime Database.
- A sincronização com Google Drive e Google Calendar responde de forma silenciosa informando que ainda não está configurada, em vez de quebrar.

Assim que as variáveis abaixo forem preenchidas em `.env.local`, o app troca automaticamente para o Firebase/Google reais — nenhum código precisa mudar.

## Configuração

### Firebase

1. Crie um projeto em [console.firebase.google.com](https://console.firebase.google.com), ative o **Realtime Database**.
2. Copie a configuração Web para as variáveis `NEXT_PUBLIC_FIREBASE_*`.
3. Gere uma chave de service account (Configurações do Projeto → Contas de serviço → Gerar nova chave privada), cole o JSON inteiro (em uma linha) em `FIREBASE_ADMIN_SDK_KEY`.
4. Publique as regras de segurança (veja `PRD_AVA_CONCURSOS.md`, seção "Regras de Segurança Firebase").

### Google Drive + Google Calendar

Ambas as APIs usam o mesmo par de credenciais OAuth (mesmo projeto no Google Cloud Console).

1. Em [console.cloud.google.com](https://console.cloud.google.com), crie um projeto e ative **Google Drive API** e **Google Calendar API**.
2. Crie credenciais OAuth 2.0 do tipo "Desktop App".
3. Gere um refresh token autorizando os scopes `drive.readonly` e `calendar`.
4. Preencha `GOOGLE_DRIVE_CLIENT_ID`, `GOOGLE_DRIVE_CLIENT_SECRET`, `GOOGLE_DRIVE_REFRESH_TOKEN`.
5. `GOOGLE_DRIVE_FOLDER_ID` é o ID da pasta raiz no Drive (a pasta que contém uma subpasta por disciplina — ver mapeamento em `lib/constants.ts`).
6. `GOOGLE_CALENDAR_ID` normalmente é `primary`.

## Scripts

```bash
npm run dev     # ambiente de desenvolvimento
npm run build   # build de produção
npm run start   # servidor de produção
npm run lint    # ESLint
```

## Estrutura

```
app/            páginas (App Router) + rotas de API (app/api/**/route.ts)
components/     componentes React, components/ui/ (primitivos) e components/hooks/ (data fetching)
lib/            tipos, constantes, camada de dados (store.ts), integrações Google, geração de Markdown
```

Veja `DESCRICAO_TECNICA_AVA_CONCURSOS.md` para o desenho completo de arquitetura e fluxos de dados, e `PRD_AVA_CONCURSOS.md` para o escopo funcional.

## Deploy (Vercel)

1. Importe o repositório no [Vercel](https://vercel.com).
2. Configure todas as variáveis de `.env.example` no dashboard do projeto.
3. `vercel.json` já define o cron job de sincronização (`/api/sync`, a cada hora). Defina `CRON_SECRET` para proteger o endpoint de chamadas externas.

## Troubleshooting

- **"Google Drive não configurado"** ao sincronizar — normal até as credenciais do Google serem preenchidas; o app segue funcional com dados manuais.
- **Dados sumiram depois de configurar o Firebase** — o app para de ler `.data/db.json` assim que `FIREBASE_ADMIN_SDK_KEY` é definido; os dados locais não são migrados automaticamente para o Firebase.
- **Erros de tipo/lint** — rode `npm run build` antes de commitar; o projeto usa TypeScript `strict: true`.
