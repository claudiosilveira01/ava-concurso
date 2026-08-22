// Lógica da sincronização automática semanal, separada de instrumentation.ts de
// propósito: o Next.js tenta empacotar instrumentation.ts também para o runtime
// "edge" (que não tem fs/path disponíveis). Mantendo o código que usa fs aqui e só
// importando este arquivo dinamicamente depois de checar NEXT_RUNTIME === "nodejs",
// o build para o edge nunca tenta resolver esses imports.
const UMA_SEMANA_MS = 7 * 24 * 60 * 60 * 1000;

async function rodarSincronizacaoAutomatica() {
  try {
    const { sincronizarBibliotecaLocal, pastaAulasExiste, pastaAulasConfigurada } = await import(
      "./localLibrary"
    );

    if (!(await pastaAulasExiste())) {
      console.log(`[AVA] pasta de aulas não encontrada em "${pastaAulasConfigurada()}" — pulando sincronização automática`);
      return;
    }

    const inicio = Date.now();
    const resultado = await sincronizarBibliotecaLocal();
    const segundos = ((Date.now() - inicio) / 1000).toFixed(1);
    console.log(
      `[AVA] sincronização automática da biblioteca: ${resultado.adicionadas} aula(s) nova(s), ${resultado.atualizadas} atualizada(s) (${segundos}s)`
    );
  } catch (erro) {
    console.error("[AVA] sincronização automática falhou:", erro);
  }
}

export function iniciarSincronizacaoAutomatica() {
  // Sem "await" de propósito: roda em segundo plano e não atrasa o servidor a
  // começar a responder às primeiras requisições.
  rodarSincronizacaoAutomatica();
  setInterval(rodarSincronizacaoAutomatica, UMA_SEMANA_MS);
}
