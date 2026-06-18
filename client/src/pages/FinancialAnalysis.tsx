import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/_core/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FinancialDashboard } from '@/components/FinancialDashboard';
import { Loader2, Download, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

import { trpc } from '@/lib/trpc';

interface FinancialPlanData {
  investimentoInicial: number;
  taxaDesconto: number;
  receitas: number;
  custos: number;
  despesas: number;
  juros: number;
  aliquotaImposto: number;
  fluxosCaixa: Array<{ mes: number; valor: number }>;
}

const EMPTY_FINANCIAL_DATA: FinancialPlanData = {
  investimentoInicial: 0,
  taxaDesconto: 0.1,
  receitas: 0,
  custos: 0,
  despesas: 0,
  juros: 0,
  aliquotaImposto: 0.15,
  fluxosCaixa: [],
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

export default function FinancialAnalysis() {
  const { user, loading } = useAuth();
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const { data: plansData, isLoading: plansLoading, refetch: refetchPlans } = trpc.businessPlans.list.useQuery();
  const exportPdfMutation = trpc.businessPlans.exportPDF.useMutation();

  useEffect(() => {
    if (!selectedPlanId && plansData && plansData.length > 0) {
      setSelectedPlanId(String(plansData[0].id));
    }
  }, [plansData, selectedPlanId]);

  const selectedPlan = useMemo(
    () => plansData?.find((plan) => String(plan.id) === selectedPlanId) || null,
    [plansData, selectedPlanId]
  );

  const financialData = useMemo<FinancialPlanData>(() => {
    const planFinancialData = (selectedPlan?.data as any)?.planoFinanceiro;
    if (!planFinancialData) return EMPTY_FINANCIAL_DATA;

    return {
      ...EMPTY_FINANCIAL_DATA,
      ...planFinancialData,
      fluxosCaixa: Array.isArray(planFinancialData.fluxosCaixa) ? planFinancialData.fluxosCaixa : [],
    };
  }, [selectedPlan]);

  const hasFinancialData =
    financialData.investimentoInicial > 0 &&
    financialData.fluxosCaixa.length > 0;

  const vplQuery = trpc.financeiro.calcularVPL.useQuery(
    {
      fluxosCaixa: financialData.fluxosCaixa.map((item) => item.valor),
      investimentoInicial: financialData.investimentoInicial,
      taxaDesconto: financialData.taxaDesconto,
    },
    { enabled: hasFinancialData }
  );

  const tirQuery = trpc.financeiro.calcularTIR.useQuery(
    {
      fluxosCaixa: financialData.fluxosCaixa.map((item) => item.valor),
      investimentoInicial: financialData.investimentoInicial,
    },
    { enabled: hasFinancialData }
  );

  const paybackQuery = trpc.financeiro.calcularPayback.useQuery(
    {
      fluxosCaixa: financialData.fluxosCaixa.map((item) => item.valor),
      investimentoInicial: financialData.investimentoInicial,
    },
    { enabled: hasFinancialData }
  );

  const dreQuery = trpc.financeiro.calcularDRE.useQuery(
    {
      receitas: financialData.receitas,
      custos: financialData.custos,
      despesas: financialData.despesas,
      juros: financialData.juros,
      aliquotaImposto: financialData.aliquotaImposto,
    },
    { enabled: Boolean(selectedPlan) }
  );

  const dashboardData = useMemo(() => {
    const dre = dreQuery.data;
    const lucroLiquido = dre?.lucroLiquido || 0;
    const receitaTotal = financialData.receitas || 0;
    const totalCustos = financialData.custos + financialData.despesas + financialData.juros;
    const margemLucro = receitaTotal > 0 ? lucroLiquido / receitaTotal : 0;
    const liquidezCorrente = totalCustos > 0 ? receitaTotal / totalCustos : 0;
    const endividamento = receitaTotal > 0 ? totalCustos / receitaTotal : 0;
    const roe = financialData.investimentoInicial > 0 ? lucroLiquido / financialData.investimentoInicial : 0;
    const totalAtivos = financialData.investimentoInicial + totalCustos;
    const roa = totalAtivos > 0 ? lucroLiquido / totalAtivos : 0;

    return {
      vpl: vplQuery.data || 0,
      tir: tirQuery.data || 0,
      payback: paybackQuery.data || 0,
      fluxoCaixa: financialData.fluxosCaixa,
      dre: {
        receita: receitaTotal,
        custos: totalCustos,
        lucro: lucroLiquido,
      },
      indicadores: {
        liquidezCorrente,
        endividamento,
        margemLucro,
        roe,
        roa,
      },
    };
  }, [dreQuery.data, financialData, paybackQuery.data, tirQuery.data, vplQuery.data]);

  const isBusy =
    plansLoading ||
    exportPdfMutation.isPending ||
    vplQuery.isLoading ||
    tirQuery.isLoading ||
    paybackQuery.isLoading ||
    dreQuery.isLoading;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card>
          <CardContent className="pt-6">
            <p>Por favor, faça login para acessar a análise financeira.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleExportReport = async () => {
    if (!selectedPlan) {
      toast.error('Selecione um plano para exportar');
      return;
    }

    try {
      const result = await exportPdfMutation.mutateAsync({ id: selectedPlan.id });
      const byteCharacters = atob(result.buffer);
      const byteNumbers = Array.from(byteCharacters, (char) => char.charCodeAt(0));
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = result.fileName;
      link.click();
      URL.revokeObjectURL(url);
      toast.success('Relatório exportado com sucesso!');
    } catch {
      toast.error('Erro ao exportar relatório');
    }
  };

  const handleRefreshData = async () => {
    try {
      await Promise.all([
        refetchPlans(),
        vplQuery.refetch(),
        tirQuery.refetch(),
        paybackQuery.refetch(),
        dreQuery.refetch(),
      ]);
      toast.success('Dados atualizados!');
    } catch {
      toast.error('Erro ao atualizar dados');
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Análise Financeira</h1>
            <p className="text-muted-foreground mt-1">
              Visualize indicadores financeiros reais dos planos cadastrados
            </p>
          </div>
          <div className="flex flex-col md:flex-row gap-2">
            <Select value={selectedPlanId || undefined} onValueChange={setSelectedPlanId}>
              <SelectTrigger className="w-full md:w-72">
                <SelectValue placeholder="Selecione um plano" />
              </SelectTrigger>
              <SelectContent>
                {(plansData || []).map((plan) => (
                  <SelectItem key={plan.id} value={String(plan.id)}>
                    {plan.title || `Plano #${plan.id}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefreshData}
              disabled={isBusy}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Atualizar
            </Button>
            <Button
              size="sm"
              onClick={handleExportReport}
              disabled={isBusy || !selectedPlan}
            >
              <Download className="w-4 h-4 mr-2" />
              Exportar
            </Button>
          </div>
        </div>

        {!plansLoading && (!plansData || plansData.length === 0) && (
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">
                Nenhum plano encontrado para análise financeira.
              </p>
            </CardContent>
          </Card>
        )}

        {selectedPlan && !hasFinancialData && (
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">
                Este plano ainda não possui dados suficientes no plano financeiro para análise.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Tabs de navegação */}
        <Tabs defaultValue="dashboard" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="detalhes">Detalhes</TabsTrigger>
            <TabsTrigger value="comparacao">Comparação</TabsTrigger>
          </TabsList>

          {/* Dashboard Principal */}
          <TabsContent value="dashboard" className="space-y-6">
            {selectedPlan && hasFinancialData ? (
              <FinancialDashboard
                data={dashboardData}
                planName={selectedPlan.title || `Plano #${selectedPlan.id}`}
              />
            ) : null}
          </TabsContent>

          {/* Detalhes */}
          <TabsContent value="detalhes" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Análise de VPL */}
              <Card>
                <CardHeader>
                  <CardTitle>Valor Presente Líquido (VPL)</CardTitle>
                  <CardDescription>
                    Valor atual de todos os fluxos de caixa futuros
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm text-muted-foreground">VPL Calculado</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {formatCurrency(dashboardData.vpl)}
                    </p>
                  </div>
                  <div className="space-y-2 text-sm">
                    <p>
                      <strong>Interpretação:</strong> Um VPL positivo indica que o projeto é
                      financeiramente viável e criará valor.
                    </p>
                    <p className="text-muted-foreground">
                      Taxa de desconto utilizada: {(financialData.taxaDesconto * 100).toFixed(2)}% a.a.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Análise de TIR */}
              <Card>
                <CardHeader>
                  <CardTitle>Taxa Interna de Retorno (TIR)</CardTitle>
                  <CardDescription>
                    Taxa de retorno anual do investimento
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-green-50 rounded-lg">
                    <p className="text-sm text-muted-foreground">TIR Calculada</p>
                    <p className="text-2xl font-bold text-green-600">
                      {(dashboardData.tir * 100).toFixed(2)}% a.a.
                    </p>
                  </div>
                  <div className="space-y-2 text-sm">
                    <p>
                      <strong>Interpretação:</strong> A TIR representa o retorno anual do
                      investimento. Compare com a taxa de desconto (10%).
                    </p>
                    <p className="text-muted-foreground">
                      {dashboardData.tir > financialData.taxaDesconto
                        ? 'TIR acima da taxa de desconto - Projeto viável'
                        : 'TIR abaixo da taxa de desconto - Projeto não viável'}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Análise de Payback */}
              <Card>
                <CardHeader>
                  <CardTitle>Período de Payback</CardTitle>
                  <CardDescription>
                    Tempo para recuperar o investimento inicial
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-orange-50 rounded-lg">
                    <p className="text-sm text-muted-foreground">Payback</p>
                    <p className="text-2xl font-bold text-orange-600">
                      {dashboardData.payback.toFixed(1)} anos
                    </p>
                  </div>
                  <div className="space-y-2 text-sm">
                    <p>
                      <strong>Interpretação:</strong> O investimento será recuperado em
                      aproximadamente {dashboardData.payback.toFixed(1)} anos.
                    </p>
                    <p className="text-muted-foreground">
                      Período aceitável para este tipo de negócio
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Índices de Rentabilidade */}
              <Card>
                <CardHeader>
                  <CardTitle>Índices de Rentabilidade</CardTitle>
                  <CardDescription>
                    Indicadores de eficiência operacional
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Margem de Lucro</span>
                      <span className="font-bold">
                        {(dashboardData.indicadores.margemLucro * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-500 h-2 rounded-full"
                        style={{
                          width: `${Math.min(dashboardData.indicadores.margemLucro * 100, 100)}%`,
                        }}
                      ></div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>ROE (Retorno sobre Patrimônio)</span>
                      <span className="font-bold">
                        {(dashboardData.indicadores.roe * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full"
                        style={{
                          width: `${Math.min(dashboardData.indicadores.roe * 100, 100)}%`,
                        }}
                      ></div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>ROA (Retorno sobre Ativos)</span>
                      <span className="font-bold">
                        {(dashboardData.indicadores.roa * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-purple-500 h-2 rounded-full"
                        style={{
                          width: `${Math.min(dashboardData.indicadores.roa * 100, 100)}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Comparação de Cenários */}
          <TabsContent value="comparacao" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Análise de Sensibilidade</CardTitle>
                <CardDescription>
                  Como mudanças nas variáveis afetam os indicadores
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Variação de Preço */}
                  <div>
                    <h4 className="font-semibold mb-3">Impacto de Variação de Preço</h4>
                    <div className="space-y-2">
                      {[-20, -10, 0, 10, 20].map((variation) => (
                        <div key={variation} className="flex items-center gap-4">
                          <span className="w-16 text-sm">{variation > 0 ? '+' : ''}{variation}%</span>
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${
                                variation > 0 ? 'bg-green-500' : variation < 0 ? 'bg-red-500' : 'bg-blue-500'
                              }`}
                              style={{
                                width: `${50 + (variation / 20) * 50}%`,
                              }}
                            ></div>
                          </div>
                          <span className="w-20 text-sm font-bold text-right">
                            {formatCurrency(dashboardData.vpl * (1 + variation / 100))}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Variação de Custo */}
                  <div>
                    <h4 className="font-semibold mb-3">Impacto de Variação de Custo</h4>
                    <div className="space-y-2">
                      {[-20, -10, 0, 10, 20].map((variation) => (
                        <div key={variation} className="flex items-center gap-4">
                          <span className="w-16 text-sm">{variation > 0 ? '+' : ''}{variation}%</span>
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${
                                variation > 0 ? 'bg-red-500' : variation < 0 ? 'bg-green-500' : 'bg-blue-500'
                              }`}
                              style={{
                                width: `${50 - (variation / 20) * 50}%`,
                              }}
                            ></div>
                          </div>
                          <span className="w-20 text-sm font-bold text-right">
                            {formatCurrency(dashboardData.vpl * (1 - variation / 100))}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
