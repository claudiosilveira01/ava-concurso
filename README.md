# 📚 AVA Concursos

Ambiente Virtual de Aprendizagem pessoal para preparação de concursos públicos — centraliza cronograma, biblioteca de aulas (Google Drive), relatórios diários de aprendizagem, progresso e integração com Google Calendar.

Stack: Next.js 14 (App Router) · TypeScript · Tailwind CSS · Firebase Realtime Database · Google Drive API · Google Calendar API.

## Uso diário (sem mexer em terminal)

Este projeto roda **100% local, sem deploy em nuvem** — é feito pra uso pessoal, só na sua máquina.

- **Para estudar:** dê duplo-clique em [`iniciar-ava.bat`](iniciar-ava.bat). Uma janela preta abre e fica rodando — não feche ela enquanto estiver usando o app. Acesse **http://localhost:3010** no navegador.
- **Para encerrar:** feche a janela do `iniciar-ava.bat`, ou dê duplo-clique em [`parar-ava.bat`](parar-ava.bat).
- Na primeira execução o script compila o projeto automaticamente (leva alguns minutos); nas próximas vezes abre em segundos.
- Depois de qualquer mudança no código, rode `npm run build` de novo (ou apague a pasta `.next`) antes de usar `iniciar-ava.bat`, senão ele continua servindo a versão antiga compilada.

O Node.js precisa estar instalado (você já tem — Node v24). O XAMPP não entra nessa parte: ele serve Apache/PHP, e o AVA é uma aplicação Next.js/Node — os dois rodam em paralelo na sua máquina sem conflito, em portas diferentes.

## Setup de desenvolvimento

```bash
npm install
cp .env.example .env.local
npm run dev
```

Abra [http://localhost:3010](http://localhost:3010) (a porta 3010 evita conflito com outros projetos locais que usam a 3000).

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

## Deploy em nuvem (não usado — decisão do projeto)

O app roda só localmente por decisão do usuário (uso pessoal, uma máquina só). O `vercel.json` (cron de sincronização a cada hora) fica no repositório caso essa decisão mude no futuro, mas nada foi publicado — não existe GitHub remoto nem projeto no Vercel configurados. Sem sincronização automática por cron enquanto for local: use o botão "Sincronizar" nas páginas Biblioteca/Disciplinas/Calendário quando quiser atualizar.

## Troubleshooting

- **"Google Drive não configurado"** ao sincronizar — normal até as credenciais do Google serem preenchidas; o app segue funcional com dados manuais.
- **Dados sumiram depois de configurar o Firebase** — o app para de ler `.data/db.json` assim que `FIREBASE_ADMIN_SDK_KEY` é definido; os dados locais não são migrados automaticamente para o Firebase.
- **Erros de tipo/lint** — rode `npm run build` antes de commitar; o projeto usa TypeScript `strict: true`.
- **`iniciar-ava.bat` abre e fecha na hora / erro estranho** — abra um `cmd.exe` normal, rode `cd "C:\dev-projects\AVA Concurso"` e depois `iniciar-ava.bat` pra ver a mensagem de erro completa sem a janela fechar sozinha.
- **Porta 3010 já em uso** — rode `parar-ava.bat` primeiro (ele mata o processo que estiver naquela porta) e tente de novo.
