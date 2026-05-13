import React, { useState } from 'react';
import { useAuth } from '@/_core/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FinancialDashboard } from '@/components/FinancialDashboard';
import { Loader2, Download, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

// Mock data para demonstração
const MOCK_FINANCIAL_DATA = {
  vpl: 125000,
  tir: 0.28,
  payback: 2.5,
  fluxoCaixa: Array.from({ length: 12 }, (_, i) => ({
    mes: i + 1,
    valor: Math.random() * 50000 + 10000,
  })),
  dre: {
    receita: 500000,
    custos: 300000,
    lucro: 200000,
  },
  indicadores: {
    liquidezCorrente: 1.8,
    endividamento: 0.35,
    margemLucro: 0.4,
    roe: 0.25,
    roa: 0.18,
  },
};

export default function FinancialAnalysis() {
  const { user, loading } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

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
    setIsLoading(true);
    try {
      // Simular download de relatório
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.success('Relatório exportado com sucesso!');
    } catch (error) {
      toast.error('Erro ao exportar relatório');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefreshData = async () => {
    setIsLoading(true);
    try {
      // Simular atualização de dados
      await new Promise((resolve) => setTimeout(resolve, 500));
      toast.success('Dados atualizados!');
    } catch (error) {
      toast.error('Erro ao atualizar dados');
    } finally {
      setIsLoading(false);
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
              Visualize indicadores financeiros, fluxo de caixa e cenários
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefreshData}
              disabled={isLoading}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Atualizar
            </Button>
            <Button
              size="sm"
              onClick={handleExportReport}
              disabled={isLoading}
            >
              <Download className="w-4 h-4 mr-2" />
              Exportar
            </Button>
          </div>
        </div>

        {/* Tabs de navegação */}
        <Tabs defaultValue="dashboard" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="detalhes">Detalhes</TabsTrigger>
            <TabsTrigger value="comparacao">Comparação</TabsTrigger>
          </TabsList>

          {/* Dashboard Principal */}
          <TabsContent value="dashboard" className="space-y-6">
            <FinancialDashboard
              data={MOCK_FINANCIAL_DATA}
              planName="Meu Plano de Negócios"
            />
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
                      R$ {MOCK_FINANCIAL_DATA.vpl.toLocaleString('pt-BR')}
                    </p>
                  </div>
                  <div className="space-y-2 text-sm">
                    <p>
                      <strong>Interpretação:</strong> Um VPL positivo indica que o projeto é
                      financeiramente viável e criará valor.
                    </p>
                    <p className="text-muted-foreground">
                      Taxa de desconto utilizada: 10% a.a.
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
                      {(MOCK_FINANCIAL_DATA.tir * 100).toFixed(2)}% a.a.
                    </p>
                  </div>
                  <div className="space-y-2 text-sm">
                    <p>
                      <strong>Interpretação:</strong> A TIR representa o retorno anual do
                      investimento. Compare com a taxa de desconto (10%).
                    </p>
                    <p className="text-muted-foreground">
                      {MOCK_FINANCIAL_DATA.tir > 0.1
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
                      {MOCK_FINANCIAL_DATA.payback.toFixed(1)} anos
                    </p>
                  </div>
                  <div className="space-y-2 text-sm">
                    <p>
                      <strong>Interpretação:</strong> O investimento será recuperado em
                      aproximadamente {MOCK_FINANCIAL_DATA.payback.toFixed(1)} anos.
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
                        {(MOCK_FINANCIAL_DATA.indicadores.margemLucro * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-500 h-2 rounded-full"
                        style={{
                          width: `${Math.min(MOCK_FINANCIAL_DATA.indicadores.margemLucro * 100, 100)}%`,
                        }}
                      ></div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>ROE (Retorno sobre Patrimônio)</span>
                      <span className="font-bold">
                        {(MOCK_FINANCIAL_DATA.indicadores.roe * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full"
                        style={{
                          width: `${Math.min(MOCK_FINANCIAL_DATA.indicadores.roe * 100, 100)}%`,
                        }}
                      ></div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>ROA (Retorno sobre Ativos)</span>
                      <span className="font-bold">
                        {(MOCK_FINANCIAL_DATA.indicadores.roa * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-purple-500 h-2 rounded-full"
                        style={{
                          width: `${Math.min(MOCK_FINANCIAL_DATA.indicadores.roa * 100, 100)}%`,
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
                            {(MOCK_FINANCIAL_DATA.vpl * (1 + variation / 100)).toLocaleString('pt-BR')}
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
                            {(MOCK_FINANCIAL_DATA.vpl * (1 - variation / 100)).toLocaleString('pt-BR')}
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
