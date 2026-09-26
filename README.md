# 📚 AVA Concursos

Ambiente Virtual de Aprendizagem pessoal para preparação de concursos públicos — centraliza cronograma, biblioteca de aulas (lida direto da pasta local de PDFs), relatórios diários de aprendizagem e progresso.

Stack: Next.js 14 (App Router) · TypeScript · Tailwind CSS · Firebase Realtime Database (opcional) · pdf-parse.

## Uso diário (sem mexer em terminal)

Este projeto roda **100% local, sem deploy em nuvem** — é feito pra uso pessoal, só na sua máquina.

**O AVA liga sozinho.** Assim que você entra na sua conta do Windows, ele já sobe automaticamente em segundo plano (sem abrir nenhuma janela) e fica no ar enquanto o PC estiver ligado. Basta abrir **http://localhost:3010** no navegador quando quiser estudar.

Como isso funciona: existe um arquivo `AVA Concursos.vbs` (cópia de [`ava-servico-oculto.vbs`](ava-servico-oculto.vbs)) na pasta de Inicialização do Windows (`shell:startup`) — é o mesmo mecanismo que programas como Discord ou OneDrive usam pra abrir sozinhos no login. Ele só liga o servidor se a porta 3010 ainda não estiver em uso, então não tem risco de abrir duas cópias por engano. Os logs desse modo automático ficam em `ava-servidor.log` (na pasta do projeto), útil se algo parecer não estar funcionando.

Controles manuais, se precisar:
- **`iniciar-ava.bat`** — liga na força bruta, com uma janela visível mostrando o que está acontecendo (útil pra ver erros). Dá duplo-clique.
- **`parar-ava.bat`** — desliga o servidor (seja o automático do login ou o manual).
- Na primeira execução (ou depois de mudar o código) é preciso compilar de novo: rode `npm run build` na pasta do projeto, ou apague a pasta `.next` e use `iniciar-ava.bat`, que compila sozinho.

O Node.js precisa estar instalado (você já tem — Node v24). O XAMPP não entra nessa parte: ele serve Apache/PHP, e o AVA é uma aplicação Next.js/Node — os dois rodam em paralelo na sua máquina sem conflito, em portas diferentes.

## Biblioteca de aulas (lê direto da sua pasta de PDFs)

Não tem integração com Google Drive nem nenhuma nuvem — o AVA lê os PDFs direto de `C:\Users\webap\Documents\POTENCIAL CONCURSOS` (configurável em `POTENCIAL_CONCURSOS_PATH`, ver `.env.example`).

Cada disciplina é uma subpasta (ex: `PORTUGUES`, `DIREITO_CONSTITUCIONAL`). Pra cada PDF, o AVA abre o arquivo de verdade e lê a primeira página pra extrair:
- **Data real da aula** (campo `DATA:` do material) — é essa data que você usa pra achar a videoaula correspondente na plataforma do cursinho.
- **Assunto da aula** — o título logo após a frase de efeito do material ("Seja você o nosso próximo aprovado!!!").
- **Professor.**

Se o PDF não tiver esse padrão (ex: listas de exercício sem cabeçalho), o AVA cai pro nome do arquivo como assunto. Essa lógica está em `lib/pdfParser.ts` e `lib/localLibrary.ts`.

**Atualização automática:** o servidor sincroniza a biblioteca sozinho ao ligar (pega PDFs novos desde a última vez) e depois a cada 7 dias, enquanto ficar no ar — ver `instrumentation.ts`. Não precisa de Tarefa Agendada do Windows nem de clicar em nada. Ainda assim, dá pra forçar uma sincronização manual a qualquer momento pelo botão "Sincronizar" nas páginas Biblioteca ou Disciplinas.

Ler o conteúdo de cada PDF é a parte mais lenta — por isso só acontece uma vez por arquivo (o AVA lembra o tamanho de cada PDF já processado e só reabre os que são novos ou mudaram).

## Setup de desenvolvimento

```bash
npm install
cp .env.example .env.local
npm run dev
```

Abra [http://localhost:3010](http://localhost:3010) (a porta 3010 evita conflito com outros projetos locais que usam a 3000).

**O app funciona sem nenhuma credencial configurada.** Enquanto `.env.local` estiver vazio (ou sem as variáveis do Firebase), os dados (disciplinas, aulas, relatórios, progresso) são gravados em `.data/db.json`, um arquivo local que imita a estrutura do Firebase Realtime Database — funciona perfeitamente bem sozinho, o Firebase é totalmente opcional.

### Firebase (opcional)

Só necessário se um dia quiser sincronizar os dados entre mais de um dispositivo — hoje o app é single-machine e não precisa disso.

1. Crie um projeto em [console.firebase.google.com](https://console.firebase.google.com), ative o **Realtime Database**.
2. Copie a configuração Web para as variáveis `NEXT_PUBLIC_FIREBASE_*`.
3. Gere uma chave de service account (Configurações do Projeto → Contas de serviço → Gerar nova chave privada), cole o JSON inteiro (em uma linha) em `FIREBASE_ADMIN_SDK_KEY`.
4. Publique as regras de segurança do Realtime Database (restrinja a leitura/escrita à sua conta).

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
lib/            tipos, constantes, camada de dados (store.ts), leitura de PDF/biblioteca local, geração de Markdown
```

A documentação de produto (visão, escopo funcional, decisões de arquitetura e histórico) vive fora do repositório, em `BRAIN/03_PROJETOS/AVA_CONCURSO/` (Obsidian). Este README cobre só o uso e a execução do código.

## Deploy em nuvem (não usado — decisão do projeto)

O app roda só localmente por decisão do usuário (uso pessoal, uma máquina só). Não há deploy no Vercel nem repositório remoto no GitHub — o versionamento é um `git` local nesta máquina, só pra histórico. Nada roda na nuvem.

## Troubleshooting

- **Aula aparece com "Data não identificada"** — o PDF dessa aula não tem o campo `DATA:` no padrão esperado (comum em listas de exercício). Não afeta o resto do app, só não dá pra usar essa data pra achar a videoaula na plataforma do cursinho.
- **Assunto errado ou estranho** — a extração é por padrão de texto; PDFs fora do formato usual do cursinho podem confundir a lógica. O nome do arquivo é usado como respaldo.
- **Pasta de aulas não encontrada** — confira se `C:\Users\webap\Documents\POTENCIAL CONCURSOS` existe, ou ajuste `POTENCIAL_CONCURSOS_PATH` em `.env.local`.
- **Dados sumiram depois de configurar o Firebase** — o app para de ler `.data/db.json` assim que `FIREBASE_ADMIN_SDK_KEY` é definido; os dados locais não são migrados automaticamente para o Firebase.
- **Erros de tipo/lint** — rode `npm run build` antes de commitar; o projeto usa TypeScript `strict: true`.
- **`iniciar-ava.bat` abre e fecha na hora / erro estranho** — abra um `cmd.exe` normal, rode `cd C:\dev-projects\ava-concurso` e depois `iniciar-ava.bat` pra ver a mensagem de erro completa sem a janela fechar sozinha.
- **Porta 3010 já em uso** — rode `parar-ava.bat` primeiro (ele mata o processo que estiver naquela porta) e tente de novo.
