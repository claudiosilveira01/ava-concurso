// Roda uma vez quando o servidor Next.js sobe. Como o AVA agora fica ligado o
// tempo todo (ver ava-servico-oculto.vbs), isso é o suficiente pra manter a
// biblioteca de aulas sempre em dia: sincroniza assim que o servidor liga
// (pega o que mudou desde a última vez) e depois repete a cada 7 dias enquanto
// o processo continuar no ar — sem precisar de Tarefa Agendada do Windows.
//
// Usa require() condicional (não import()) de propósito: o Next.js também tenta
// empacotar este arquivo para o runtime "edge", que não tem fs/path disponíveis.
// Com require() dentro de um "if" sobre NEXT_RUNTIME, o bundler consegue eliminar
// esse trecho inteiro (e tudo que ele importa) do pacote do edge em tempo de build.
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    require("./lib/syncAutomatico").iniciarSincronizacaoAutomatica();
  }
}
