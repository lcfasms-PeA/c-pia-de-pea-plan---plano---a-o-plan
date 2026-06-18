import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Save, Plus, Trash2, TrendingUp, DollarSign, Percent } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface FinancialData {
  investimentoInicial: number;
  taxaDesconto: number;
  receitas: number;
  custos: number;
  despesas: number;
  juros: number;
  aliquotaImposto: number;
  fluxosCaixa: Array<{ mes: number; valor: number }>;
}

const EMPTY_FINANCIAL_DATA: FinancialData = {
  investimentoInicial: 100000,
  taxaDesconto: 0.1,
  receitas: 500000,
  custos: 300000,
  despesas: 50000,
  juros: 10000,
  aliquotaImposto: 0.15,
  fluxosCaixa: Array.from({ length: 12 }, (_, i) => ({
    mes: i + 1,
    valor: 50000,
  })),
};

interface SecaoFinanceiraProps {
  planId: number;
  initialData?: Partial<FinancialData>;
  onSave?: (data: FinancialData) => void;
}

interface ValidationError {
  field: string;
  message: string;
}

// Validação de dados financeiros
function validateFinancialData(data: FinancialData): ValidationError[] {
  const errors: ValidationError[] = [];

  // Investimento inicial
  if (data.investimentoInicial <= 0) {
    errors.push({
      field: 'investimentoInicial',
      message: 'Investimento inicial deve ser maior que zero',
    });
  }
  if (!Number.isFinite(data.investimentoInicial)) {
    errors.push({
      field: 'investimentoInicial',
      message: 'Investimento inicial deve ser um número válido',
    });
  }

  // Taxa de desconto
  if (data.taxaDesconto < 0 || data.taxaDesconto > 1) {
    errors.push({
      field: 'taxaDesconto',
      message: 'Taxa de desconto deve estar entre 0 e 1 (0% a 100%)',
    });
  }

  // DRE
  if (data.receitas < 0) {
    errors.push({
      field: 'receitas',
      message: 'Receitas não podem ser negativas',
    });
  }
  if (data.custos < 0) {
    errors.push({
      field: 'custos',
      message: 'Custos não podem ser negativos',
    });
  }
  if (data.despesas < 0) {
    errors.push({
      field: 'despesas',
      message: 'Despesas não podem ser negativas',
    });
  }
  if (data.juros < 0) {
    errors.push({
      field: 'juros',
      message: 'Juros não podem ser negativos',
    });
  }
  if (data.aliquotaImposto < 0 || data.aliquotaImposto > 1) {
    errors.push({
      field: 'aliquotaImposto',
      message: 'Alíquota de imposto deve estar entre 0 e 1 (0% a 100%)',
    });
  }

  // Fluxo de caixa
  if (data.fluxosCaixa.length === 0) {
    errors.push({
      field: 'fluxosCaixa',
      message: 'Deve haver pelo menos um período de fluxo de caixa',
    });
  }
  data.fluxosCaixa.forEach((fluxo, index) => {
    if (fluxo.valor < 0) {
      errors.push({
        field: `fluxosCaixa.${index}`,
        message: `Fluxo de caixa do mês ${fluxo.mes} não pode ser negativo`,
      });
    }
    if (!Number.isFinite(fluxo.valor)) {
      errors.push({
        field: `fluxosCaixa.${index}`,
        message: `Fluxo de caixa do mês ${fluxo.mes} deve ser um número válido`,
      });
    }
  });

  return errors;
}

export default function SecaoFinanceira({
  planId,
  initialData,
  onSave,
}: SecaoFinanceiraProps) {
  const [data, setData] = useState<FinancialData>({
    ...EMPTY_FINANCIAL_DATA,
    ...initialData,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [calculations, setCalculations] = useState<any>(null);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState(false);

  // Calcular VPL
  const calcularVPLMutation = trpc.financeiro.calcularVPL.useQuery(
    {
      fluxosCaixa: data.fluxosCaixa.map(f => f.valor),
      investimentoInicial: data.investimentoInicial,
      taxaDesconto: data.taxaDesconto,
    },
    { enabled: false }
  );

  // Calcular TIR
  const calcularTIRMutation = trpc.financeiro.calcularTIR.useQuery(
    {
      fluxosCaixa: data.fluxosCaixa.map(f => f.valor),
      investimentoInicial: data.investimentoInicial,
    },
    { enabled: false }
  );

  // Calcular Payback
  const calcularPaybackMutation = trpc.financeiro.calcularPayback.useQuery(
    {
      fluxosCaixa: data.fluxosCaixa.map(f => f.valor),
      investimentoInicial: data.investimentoInicial,
    },
    { enabled: false }
  );

  // Calcular DRE
  const calcularDREMutation = trpc.financeiro.calcularDRE.useQuery(
    {
      receitas: data.receitas,
      custos: data.custos,
      despesas: data.despesas,
      juros: data.juros,
      aliquotaImposto: data.aliquotaImposto,
    },
    { enabled: false }
  );

  // Recalcular quando dados mudam
  useEffect(() => {
    const recalcular = async () => {
      try {
        // Validar antes de recalcular
        const errors = validateFinancialData(data);

        // Se há erros, limpar cálculos
        if (errors.length > 0) {
          setCalculations(null);
          return;
        }

        const results = await Promise.all([
          calcularVPLMutation.refetch(),
          calcularTIRMutation.refetch(),
          calcularPaybackMutation.refetch(),
          calcularDREMutation.refetch(),
        ]);

        setCalculations({
          vpl: results[0].data,
          tir: results[1].data,
          payback: results[2].data,
          dre: results[3].data,
        });
      } catch (error) {
        console.error('Erro ao calcular:', error);
        toast.error('Erro ao calcular indicadores financeiros');
        setCalculations(null);
      }
    };

    recalcular();
  }, [data]);

  const handleSave = async () => {
    setIsValidating(true);
    setSaveError(null);

    // Validar dados
    const errors = validateFinancialData(data);
    setValidationErrors(errors);

    if (errors.length > 0) {
      toast.error(`Erros de validação encontrados: ${errors.length} problema(s)`);
      setIsValidating(false);
      return;
    }

    setIsSaving(true);
    try {
      await onSave?.(data);
      toast.success('Dados financeiros salvos com sucesso!');
      setSaveError(null);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido ao salvar';
      setSaveError(errorMessage);
      toast.error(`Erro ao salvar: ${errorMessage}`);
      console.error('Erro ao salvar dados financeiros:', error);
    } finally {
      setIsSaving(false);
      setIsValidating(false);
    }
  };

  const updateFluxoCaixa = (index: number, valor: number) => {
    setData(prev => ({
      ...prev,
      fluxosCaixa: prev.fluxosCaixa.map((f, i) =>
        i === index ? { ...f, valor } : f
      ),
    }));
  };

  const addFluxoCaixa = () => {
    const nextMes = Math.max(...data.fluxosCaixa.map(f => f.mes)) + 1;
    setData(prev => ({
      ...prev,
      fluxosCaixa: [...prev.fluxosCaixa, { mes: nextMes, valor: 50000 }],
    }));
  };

  const removeFluxoCaixa = (index: number) => {
    if (data.fluxosCaixa.length > 1) {
      setData(prev => ({
        ...prev,
        fluxosCaixa: prev.fluxosCaixa.filter((_, i) => i !== index),
      }));
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatPercent = (value: number) => {
    return `${(value * 100).toFixed(2)}%`;
  };

  const fluxoChartData = data.fluxosCaixa.map((f, i) => ({
    mes: `Mês ${f.mes}`,
    valor: f.valor,
  }));

  return (
    <div className="space-y-6 w-full">
      {/* Erro de Salvamento */}
      {saveError && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex gap-3">
              <div className="text-red-600 font-bold">⚠️</div>
              <div>
                <p className="font-semibold text-red-900">Erro ao salvar</p>
                <p className="text-sm text-red-800">{saveError}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Erros de Validação */}
      {validationErrors.length > 0 && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex gap-2">
                <div className="text-yellow-600 font-bold">⚠️</div>
                <p className="font-semibold text-yellow-900">
                  {validationErrors.length} erro(s) de validação encontrado(s)
                </p>
              </div>
              <ul className="text-sm text-yellow-800 space-y-1 ml-6">
                {validationErrors.map((error, index) => (
                  <li key={index} className="list-disc">
                    {error.message}
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      )}
      <Tabs defaultValue="dados" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="dados">Dados Financeiros</TabsTrigger>
          <TabsTrigger value="fluxo">Fluxo de Caixa</TabsTrigger>
          <TabsTrigger value="resultados">Resultados</TabsTrigger>
        </TabsList>

        {/* Dados Financeiros */}
        <TabsContent value="dados" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Investimento Inicial</CardTitle>
              <CardDescription>
                Valor total investido no início do projeto
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="investimentoInicial">Investimento Inicial (R$)</Label>
                <Input
                  id="investimentoInicial"
                  type="number"
                  value={data.investimentoInicial}
                  onChange={(e) => {
                    setData(prev => ({
                      ...prev,
                      investimentoInicial: parseFloat(e.target.value) || 0,
                    }));
                    // Limpar erro ao editar
                    setValidationErrors(prev => prev.filter(err => err.field !== 'investimentoInicial'));
                  }}
                  placeholder="100000"
                  className={validationErrors.some(e => e.field === 'investimentoInicial') ? 'border-red-500' : ''}
                />
                {validationErrors.find(e => e.field === 'investimentoInicial') && (
                  <p className="text-sm text-red-600">
                    {validationErrors.find(e => e.field === 'investimentoInicial')?.message}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Taxa de Desconto</CardTitle>
              <CardDescription>
                Taxa percentual para calcular VPL (ex: 10% = 0.10)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label>Taxa de Desconto</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={data.taxaDesconto}
                  onChange={(e) =>
                    setData(prev => ({
                      ...prev,
                      taxaDesconto: parseFloat(e.target.value) || 0,
                    }))
                  }
                  placeholder="0.10"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Dados da DRE</CardTitle>
              <CardDescription>
                Demonstração de Resultado do Exercício
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Receitas (R$)</Label>
                  <Input
                    type="number"
                    value={data.receitas}
                    onChange={(e) =>
                      setData(prev => ({
                        ...prev,
                        receitas: parseFloat(e.target.value) || 0,
                      }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Custos (R$)</Label>
                  <Input
                    type="number"
                    value={data.custos}
                    onChange={(e) =>
                      setData(prev => ({
                        ...prev,
                        custos: parseFloat(e.target.value) || 0,
                      }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Despesas (R$)</Label>
                  <Input
                    type="number"
                    value={data.despesas}
                    onChange={(e) =>
                      setData(prev => ({
                        ...prev,
                        despesas: parseFloat(e.target.value) || 0,
                      }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Juros (R$)</Label>
                  <Input
                    type="number"
                    value={data.juros}
                    onChange={(e) =>
                      setData(prev => ({
                        ...prev,
                        juros: parseFloat(e.target.value) || 0,
                      }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Alíquota de Imposto</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={data.aliquotaImposto}
                    onChange={(e) =>
                      setData(prev => ({
                        ...prev,
                        aliquotaImposto: parseFloat(e.target.value) || 0,
                      }))
                    }
                    placeholder="0.15"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Fluxo de Caixa */}
        <TabsContent value="fluxo" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Fluxo de Caixa Projetado</CardTitle>
              <CardDescription>
                Editar projeção de caixa por período
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Gráfico */}
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={fluxoChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="mes" />
                    <YAxis />
                    <Tooltip formatter={(value) => formatCurrency(value as number)} />
                    <Bar dataKey="valor" fill="#3B82F6" />
                  </BarChart>
                </ResponsiveContainer>

                {/* Lista de meses */}
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {data.fluxosCaixa.map((fluxo, index) => (
                    <div key={index} className="flex items-end gap-2">
                      <div className="flex-1 space-y-1">
                        <Label>Mês {fluxo.mes}</Label>
                        <Input
                          type="number"
                          value={fluxo.valor}
                          onChange={(e) =>
                            updateFluxoCaixa(index, parseFloat(e.target.value) || 0)
                          }
                          placeholder="50000"
                        />
                      </div>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => removeFluxoCaixa(index)}
                        disabled={data.fluxosCaixa.length === 1}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>

                <Button
                  onClick={addFluxoCaixa}
                  variant="outline"
                  className="w-full"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Mês
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Resultados */}
        <TabsContent value="resultados" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* VPL */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  VPL
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {calculations?.vpl
                    ? formatCurrency(calculations.vpl)
                    : 'Calculando...'}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {calculations?.vpl && calculations.vpl > 0 ? (
                    <Badge className="bg-green-100 text-green-800">
                      <TrendingUp className="w-3 h-3 mr-1" />
                      Viável
                    </Badge>
                  ) : (
                    <Badge variant="destructive">
                      <TrendingUp className="w-3 h-3 mr-1" />
                      Não viável
                    </Badge>
                  )}
                </p>
              </CardContent>
            </Card>

            {/* TIR */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Percent className="w-4 h-4" />
                  TIR
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {calculations?.tir
                    ? formatPercent(calculations.tir)
                    : 'Calculando...'}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Taxa de retorno anual
                </p>
              </CardContent>
            </Card>

            {/* Payback */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Payback</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {calculations?.payback
                    ? `${calculations.payback.toFixed(1)} anos`
                    : 'Calculando...'}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Tempo para recuperar investimento
                </p>
              </CardContent>
            </Card>

            {/* Lucro Líquido (DRE) */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Lucro Líquido</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {calculations?.dre
                    ? formatCurrency(calculations.dre.lucroLiquido || 0)
                    : 'Calculando...'}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Resultado do exercício
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Detalhes DRE */}
          {calculations?.dre && (
            <Card>
              <CardHeader>
                <CardTitle>Demonstração de Resultado (DRE)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm border-b pb-2">
                    <span>Receitas:</span>
                    <span className="font-bold">{formatCurrency(calculations.dre.receitas)}</span>
                  </div>
                  <div className="flex justify-between text-sm border-b pb-2">
                    <span>Custos:</span>
                    <span className="font-bold">{formatCurrency(calculations.dre.custos)}</span>
                  </div>
                  <div className="flex justify-between text-sm border-b pb-2">
                    <span>Lucro Bruto:</span>
                    <span className="font-bold">{formatCurrency(calculations.dre.lucroGruto)}</span>
                  </div>
                  <div className="flex justify-between text-sm border-b pb-2">
                    <span>Despesas:</span>
                    <span className="font-bold">{formatCurrency(calculations.dre.despesas)}</span>
                  </div>
                  <div className="flex justify-between text-sm border-b pb-2">
                    <span>Lucro Operacional:</span>
                    <span className="font-bold">{formatCurrency(calculations.dre.lucroOperacional)}</span>
                  </div>
                  <div className="flex justify-between text-sm border-b pb-2">
                    <span>Juros:</span>
                    <span className="font-bold">{formatCurrency(calculations.dre.juros)}</span>
                  </div>
                  <div className="flex justify-between text-sm border-b pb-2">
                    <span>Lucro Antes de Imposto:</span>
                    <span className="font-bold">{formatCurrency(calculations.dre.lucroAntes)}</span>
                  </div>
                  <div className="flex justify-between text-sm border-b pb-2">
                    <span>Impostos:</span>
                    <span className="font-bold">{formatCurrency(calculations.dre.impostos)}</span>
                  </div>
                  <div className="flex justify-between text-sm bg-blue-50 p-2 rounded font-bold">
                    <span>Lucro Líquido:</span>
                    <span>{formatCurrency(calculations.dre.lucroLiquido)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Botão Salvar */}
      <Button
        onClick={handleSave}
        disabled={isSaving || isValidating || validationErrors.length > 0}
        className="w-full"
        size="lg"
      >
        <Save className="w-4 h-4 mr-2" />
        {isValidating ? 'Validando...' : isSaving ? 'Salvando...' : 'Salvar Dados Financeiros'}
      </Button>

      {validationErrors.length > 0 && (
        <p className="text-xs text-red-600 text-center">
          Corrija os erros acima antes de salvar
        </p>
      )}
    </div>
  );
}
