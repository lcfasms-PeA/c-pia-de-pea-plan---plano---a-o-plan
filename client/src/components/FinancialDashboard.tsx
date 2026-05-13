import React, { useState } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, DollarSign, Percent, Calendar } from 'lucide-react';

interface FinancialData {
  vpl: number;
  tir: number;
  payback: number;
  fluxoCaixa: Array<{ mes: number; valor: number }>;
  dre: {
    receita: number;
    custos: number;
    lucro: number;
  };
  indicadores: {
    liquidezCorrente: number;
    endividamento: number;
    margemLucro: number;
    roe: number;
    roa: number;
  };
}

interface FinancialDashboardProps {
  data: FinancialData;
  planName: string;
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

export function FinancialDashboard({ data, planName }: FinancialDashboardProps) {
  const [selectedScenario, setSelectedScenario] = useState<'base' | 'otimista' | 'pessimista'>('base');

  // Formatar valores monetários
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  // Formatar percentual
  const formatPercent = (value: number) => {
    return `${(value * 100).toFixed(2)}%`;
  };

  // Dados para gráfico de fluxo de caixa
  const fluxoCaixaData = data.fluxoCaixa.map((item) => ({
    ...item,
    mesLabel: `Mês ${item.mes}`,
  }));

  // Dados para gráfico de composição de custos
  const composicaoCustos = [
    { name: 'Custos Variáveis', value: data.dre.custos * 0.6 },
    { name: 'Custos Fixos', value: data.dre.custos * 0.4 },
  ];

  // Dados para gráfico de indicadores
  const indicadoresData = [
    {
      name: 'Liquidez Corrente',
      valor: data.indicadores.liquidezCorrente,
      meta: 1.5,
    },
    {
      name: 'Endividamento',
      valor: data.indicadores.endividamento,
      meta: 0.5,
    },
    {
      name: 'Margem de Lucro',
      valor: data.indicadores.margemLucro,
      meta: 0.25,
    },
    {
      name: 'ROE',
      valor: data.indicadores.roe,
      meta: 0.15,
    },
    {
      name: 'ROA',
      valor: data.indicadores.roa,
      meta: 0.1,
    },
  ];

  // Indicador de saúde financeira
  const calcularSaudeFinanceira = () => {
    let score = 0;
    if (data.vpl > 0) score += 20;
    if (data.tir > 0.15) score += 20;
    if (data.payback > 0 && data.payback < 5) score += 20;
    if (data.indicadores.liquidezCorrente > 1.2) score += 20;
    if (data.indicadores.margemLucro > 0.15) score += 20;
    return score;
  };

  const saudeFinanceira = calcularSaudeFinanceira();
  const saudeColor =
    saudeFinanceira >= 80 ? 'text-green-600' : saudeFinanceira >= 60 ? 'text-yellow-600' : 'text-red-600';

  return (
    <div className="w-full space-y-6">
      {/* Header com métricas principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* VPL */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              VPL
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(data.vpl)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {data.vpl > 0 ? (
                <span className="flex items-center gap-1 text-green-600">
                  <TrendingUp className="w-3 h-3" />
                  Viável
                </span>
              ) : (
                <span className="flex items-center gap-1 text-red-600">
                  <TrendingDown className="w-3 h-3" />
                  Não viável
                </span>
              )}
            </p>
          </CardContent>
        </Card>

        {/* TIR */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Percent className="w-4 h-4" />
              TIR
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPercent(data.tir)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {data.tir > 0.15 ? (
                <span className="flex items-center gap-1 text-green-600">
                  <TrendingUp className="w-3 h-3" />
                  Acima da meta
                </span>
              ) : (
                <span className="flex items-center gap-1 text-yellow-600">
                  <TrendingDown className="w-3 h-3" />
                  Abaixo da meta
                </span>
              )}
            </p>
          </CardContent>
        </Card>

        {/* Payback */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Payback
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.payback.toFixed(1)} anos</div>
            <p className="text-xs text-muted-foreground mt-1">
              {data.payback > 0 && data.payback < 5 ? (
                <span className="flex items-center gap-1 text-green-600">
                  <TrendingUp className="w-3 h-3" />
                  Aceitável
                </span>
              ) : (
                <span className="flex items-center gap-1 text-red-600">
                  <TrendingDown className="w-3 h-3" />
                  Longo prazo
                </span>
              )}
            </p>
          </CardContent>
        </Card>

        {/* Saúde Financeira */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Saúde Financeira</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${saudeColor}`}>{saudeFinanceira}/100</div>
            <p className="text-xs text-muted-foreground mt-1">
              <Badge
                variant={saudeFinanceira >= 80 ? 'default' : saudeFinanceira >= 60 ? 'secondary' : 'destructive'}
              >
                {saudeFinanceira >= 80 ? 'Excelente' : saudeFinanceira >= 60 ? 'Bom' : 'Crítico'}
              </Badge>
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos principais */}
      <Tabs defaultValue="fluxo" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="fluxo">Fluxo de Caixa</TabsTrigger>
          <TabsTrigger value="dre">DRE</TabsTrigger>
          <TabsTrigger value="indicadores">Indicadores</TabsTrigger>
          <TabsTrigger value="composicao">Composição</TabsTrigger>
        </TabsList>

        {/* Fluxo de Caixa */}
        <TabsContent value="fluxo">
          <Card>
            <CardHeader>
              <CardTitle>Fluxo de Caixa Projetado</CardTitle>
              <CardDescription>Projeção mensal de entrada e saída de caixa</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={fluxoCaixaData}>
                  <defs>
                    <linearGradient id="colorFluxo" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="mesLabel" />
                  <YAxis />
                  <Tooltip
                    formatter={(value) => formatCurrency(value as number)}
                    labelFormatter={(label) => `${label}`}
                  />
                  <Area type="monotone" dataKey="valor" stroke="#3B82F6" fillOpacity={1} fill="url(#colorFluxo)" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* DRE */}
        <TabsContent value="dre">
          <Card>
            <CardHeader>
              <CardTitle>Demonstração de Resultado (DRE)</CardTitle>
              <CardDescription>Receitas, custos e lucro anual</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Gráfico */}
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={[
                      {
                        name: 'Financeiro',
                        Receita: data.dre.receita,
                        Custos: data.dre.custos,
                        Lucro: data.dre.lucro,
                      },
                    ]}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value) => formatCurrency(value as number)} />
                    <Legend />
                    <Bar dataKey="Receita" fill="#10B981" />
                    <Bar dataKey="Custos" fill="#EF4444" />
                    <Bar dataKey="Lucro" fill="#3B82F6" />
                  </BarChart>
                </ResponsiveContainer>

                {/* Detalhes */}
                <div className="grid grid-cols-3 gap-4 mt-4">
                  <div className="p-3 bg-green-50 rounded-lg">
                    <p className="text-sm text-muted-foreground">Receita Total</p>
                    <p className="text-lg font-bold text-green-600">{formatCurrency(data.dre.receita)}</p>
                  </div>
                  <div className="p-3 bg-red-50 rounded-lg">
                    <p className="text-sm text-muted-foreground">Custos Totais</p>
                    <p className="text-lg font-bold text-red-600">{formatCurrency(data.dre.custos)}</p>
                  </div>
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-muted-foreground">Lucro Líquido</p>
                    <p className="text-lg font-bold text-blue-600">{formatCurrency(data.dre.lucro)}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Indicadores */}
        <TabsContent value="indicadores">
          <Card>
            <CardHeader>
              <CardTitle>Indicadores Financeiros</CardTitle>
              <CardDescription>Comparação com metas estabelecidas</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={indicadoresData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                  <YAxis />
                  <Tooltip formatter={(value) => (value as number).toFixed(3)} />
                  <Legend />
                  <Bar dataKey="valor" fill="#3B82F6" name="Valor Atual" />
                  <Bar dataKey="meta" fill="#10B981" name="Meta" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Composição de Custos */}
        <TabsContent value="composicao">
          <Card>
            <CardHeader>
              <CardTitle>Composição de Custos</CardTitle>
              <CardDescription>Distribuição de custos variáveis e fixos</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={composicaoCustos}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${formatCurrency(value)}`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {composicaoCustos.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(value as number)} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Análise de Sensibilidade */}
      <Card>
        <CardHeader>
          <CardTitle>Análise de Cenários</CardTitle>
          <CardDescription>Simulação de diferentes cenários de mercado</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            {[
              { name: 'Pessimista', vpl: data.vpl * 0.7, tir: data.tir * 0.7, color: 'bg-red-50' },
              { name: 'Base', vpl: data.vpl, tir: data.tir, color: 'bg-blue-50' },
              { name: 'Otimista', vpl: data.vpl * 1.3, tir: data.tir * 1.3, color: 'bg-green-50' },
            ].map((scenario) => (
              <div key={scenario.name} className={`p-4 rounded-lg ${scenario.color}`}>
                <h4 className="font-semibold mb-2">{scenario.name}</h4>
                <div className="space-y-1 text-sm">
                  <p>
                    VPL: <span className="font-bold">{formatCurrency(scenario.vpl)}</span>
                  </p>
                  <p>
                    TIR: <span className="font-bold">{formatPercent(scenario.tir)}</span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
