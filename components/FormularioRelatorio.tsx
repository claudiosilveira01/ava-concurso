"use client";

import { useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Input, Textarea } from "@/components/ui/Input";
import { Checkbox } from "@/components/ui/Checkbox";
import { Button } from "@/components/ui/Button";
import { DisciplinaIcon } from "@/components/ui/DisciplinaIcon";
import { useToast } from "@/components/ui/Toast";
import { useRelatorio, criarRelatorio, atualizarRelatorio } from "@/components/hooks/useRelatorios";
import { relatorioFormSchema, type RelatorioFormInput } from "@/lib/validation";
import { DISCIPLINAS_CONFIG, DIAS_SEMANA, DIAS_SEMANA_LABEL } from "@/lib/constants";

const VALORES_PADRAO: RelatorioFormInput = {
  diasEstudados: [],
  disciplinasEstudadas: [],
  conceitos: "",
  duvidas: "",
  erros: "",
  desempenho: {},
  pontoPositivos: "",
  proximasAcoes: "",
};

export function FormularioRelatorio({ dataParaEditar }: { dataParaEditar?: string }) {
  const router = useRouter();
  const { toast } = useToast();
  const modoEdicao = Boolean(dataParaEditar);
  const {
    relatorio,
    loading: carregandoRelatorio,
    error: erroCarregar,
  } = useRelatorio(dataParaEditar ?? null);

  const {
    register,
    handleSubmit,
    control,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<RelatorioFormInput>({
    resolver: zodResolver(relatorioFormSchema),
    defaultValues: VALORES_PADRAO,
  });

  useEffect(() => {
    if (relatorio) {
      reset({
        data: relatorio.data,
        diasEstudados: relatorio.diasEstudados,
        disciplinasEstudadas: relatorio.disciplinasEstudadas,
        conceitos: relatorio.conceitos,
        duvidas: relatorio.duvidas,
        erros: relatorio.erros,
        desempenho: relatorio.desempenho,
        pontoPositivos: relatorio.pontoPositivos,
        proximasAcoes: relatorio.proximasAcoes,
      });
    }
  }, [relatorio, reset]);

  const disciplinasEstudadas = useWatch({ control, name: "disciplinasEstudadas" }) ?? [];
  const diasEstudados = useWatch({ control, name: "diasEstudados" }) ?? [];
  const desempenho = useWatch({ control, name: "desempenho" }) ?? {};

  function alternarDisciplina(id: string, marcado: boolean) {
    const proximas = marcado
      ? [...disciplinasEstudadas, id]
      : disciplinasEstudadas.filter((d) => d !== id);
    setValue("disciplinasEstudadas", proximas, { shouldValidate: true });
    if (!marcado) {
      const proximoDesempenho = { ...desempenho };
      delete proximoDesempenho[id];
      setValue("desempenho", proximoDesempenho);
    }
  }

  function alternarDia(dia: string, marcado: boolean) {
    const proximos = marcado ? [...diasEstudados, dia] : diasEstudados.filter((d) => d !== dia);
    setValue("diasEstudados", proximos);
  }

  function alterarDesempenho(id: string, valorTexto: string) {
    if (valorTexto === "") {
      const proximoDesempenho = { ...desempenho };
      delete proximoDesempenho[id];
      setValue("desempenho", proximoDesempenho);
      return;
    }
    const valor = Number(valorTexto);
    if (Number.isNaN(valor)) return;
    setValue("desempenho", { ...desempenho, [id]: valor });
  }

  async function onSubmit(dados: RelatorioFormInput) {
    try {
      if (modoEdicao && dataParaEditar) {
        await atualizarRelatorio(dataParaEditar, dados);
      } else {
        await criarRelatorio(dados);
      }
      toast("Relatório salvo com sucesso", "success");
      router.push("/relatorios");
    } catch (err) {
      toast(err instanceof Error ? err.message : "Erro ao salvar relatório", "error");
    }
  }

  if (modoEdicao && carregandoRelatorio) {
    return <p className="text-sm text-[var(--muted)]">Carregando...</p>;
  }

  if (modoEdicao && erroCarregar) {
    return <p className="text-sm text-red-500">{erroCarregar}</p>;
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Disciplinas estudadas</CardTitle>
        </CardHeader>
        <CardContent>
          {errors.disciplinasEstudadas && (
            <p className="mb-2 text-sm text-red-500">{errors.disciplinasEstudadas.message}</p>
          )}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {DISCIPLINAS_CONFIG.map((disciplina) => {
              const marcado = disciplinasEstudadas.includes(disciplina.id);
              return (
                <label key={disciplina.id} className="flex items-center gap-2 text-sm">
                  <Checkbox
                    checked={marcado}
                    onChange={(checked) => alternarDisciplina(disciplina.id, checked)}
                    color={disciplina.cor}
                  />
                  <span className="flex items-center gap-1.5">
                    <DisciplinaIcon icone={disciplina.icone} className="h-4 w-4" style={{ color: disciplina.cor }} />
                    {disciplina.nome}
                  </span>
                </label>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Dias estudados</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            {DIAS_SEMANA.map((dia) => {
              const marcado = diasEstudados.includes(dia);
              return (
                <label key={dia} className="flex items-center gap-2 text-sm">
                  <Checkbox checked={marcado} onChange={(checked) => alternarDia(dia, checked)} />
                  <span>{DIAS_SEMANA_LABEL[dia]}</span>
                </label>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {disciplinasEstudadas.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Desempenho por disciplina (0-100)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {DISCIPLINAS_CONFIG.filter((d) => disciplinasEstudadas.includes(d.id)).map((disciplina) => (
                <div key={disciplina.id} className="flex flex-col gap-1">
                  <label className="flex items-center gap-1.5 text-sm font-medium" style={{ color: disciplina.cor }}>
                    <DisciplinaIcon icone={disciplina.icone} className="h-4 w-4" style={{ color: disciplina.cor }} />
                    {disciplina.nome}
                  </label>
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    value={desempenho[disciplina.id] ?? ""}
                    onChange={(e) => alterarDesempenho(disciplina.id, e.target.value)}
                    placeholder="0-100"
                  />
                </div>
              ))}
            </div>
            {errors.desempenho && (
              <p className="mt-2 text-sm text-red-500">Os valores de desempenho devem estar entre 0 e 100.</p>
            )}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="flex flex-col gap-4 pt-4">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">Conceitos aprendidos</label>
            <Textarea rows={4} {...register("conceitos")} />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">Dúvidas</label>
            <Textarea rows={4} {...register("duvidas")} />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">Erros</label>
            <Textarea rows={4} {...register("erros")} />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">Pontos positivos</label>
            <Textarea rows={4} {...register("pontoPositivos")} />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">Próximas ações</label>
            <Textarea rows={4} {...register("proximasAcoes")} />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Salvando..." : "Salvar Relatório"}
        </Button>
      </div>
    </form>
  );
}
