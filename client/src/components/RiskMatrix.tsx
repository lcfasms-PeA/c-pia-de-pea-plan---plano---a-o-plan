import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { X, Plus, Save, Loader2, AlertTriangle, AlertCircle } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

interface Risk {
  id: string;
  descricao: string;
  probabilidade: number; // 1-5
  impacto: number; // 1-5
  mitigacao?: string;
}

interface RiskMatrixProps {
  planId: number;
  initialRisks?: Risk[];
}

const PROBABILITY_LABELS = {
  1: "Muito Baixa",
  2: "Baixa",
  3: "Média",
  4: "Alta",
  5: "Muito Alta",
};

const IMPACT_LABELS = {
  1: "Muito Baixo",
  2: "Baixo",
  3: "Médio",
  4: "Alto",
  5: "Muito Alto",
};

const getRiskLevel = (probability: number, impact: number) => {
  const score = probability * impact;
  if (score <= 4) return { level: "Baixo", color: "bg-green-100", textColor: "text-green-700", borderColor: "border-green-300" };
  if (score <= 9) return { level: "Médio", color: "bg-yellow-100", textColor: "text-yellow-700", borderColor: "border-yellow-300" };
  if (score <= 16) return { level: "Alto", color: "bg-orange-100", textColor: "text-orange-700", borderColor: "border-orange-300" };
  return { level: "Crítico", color: "bg-red-100", textColor: "text-red-700", borderColor: "border-red-300" };
};

export default function RiskMatrix({ planId, initialRisks = [] }: RiskMatrixProps) {
  const [risks, setRisks] = useState<Risk[]>(initialRisks);
  const [selectedRisk, setSelectedRisk] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const riskMutation = trpc.strategic.risks.save.useMutation();

  const handleAddRisk = () => {
    const newRisk: Risk = {
      id: Math.random().toString(),
      descricao: "",
      probabilidade: 3,
      impacto: 3,
      mitigacao: "",
    };
    setRisks([...risks, newRisk]);
    setSelectedRisk(newRisk.id);
  };

  const handleRemoveRisk = (id: string) => {
    setRisks(risks.filter((r) => r.id !== id));
    if (selectedRisk === id) setSelectedRisk(null);
  };

  const handleUpdateRisk = (id: string, updates: Partial<Risk>) => {
    setRisks(risks.map((r) => (r.id === id ? { ...r, ...updates } : r)));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const result = await riskMutation.mutateAsync({
        planId,
        riscos: risks,
      });
      toast.success(`Riscos salvos com sucesso! ${result.analysis.riscosAltos.length} risco(s) alto(s) identificado(s).`);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro ao salvar riscos";
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  };

  const risksByLevel = useMemo(() => {
    return {
      critico: risks.filter((r) => r.probabilidade * r.impacto > 16),
      alto: risks.filter((r) => r.probabilidade * r.impacto > 9 && r.probabilidade * r.impacto <= 16),
      medio: risks.filter((r) => r.probabilidade * r.impacto > 4 && r.probabilidade * r.impacto <= 9),
      baixo: risks.filter((r) => r.probabilidade * r.impacto <= 4),
    };
  }, [risks]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Análise de Risco</h2>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleAddRisk}>
            <Plus className="w-4 h-4 mr-2" />
            Adicionar Risco
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Salvar
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Matriz Visual */}
        <div className="lg:col-span-2">
          <Card className="p-6">
            <h3 className="text-lg font-bold mb-4">Matriz de Risco (Probabilidade × Impacto)</h3>
            
            <div className="overflow-x-auto">
              <div className="inline-block">
                {/* Cabeçalho com rótulos de Impacto */}
                <div className="flex">
                  <div className="w-16" /> {/* Espaço para rótulos de Probabilidade */}
                  {[5, 4, 3, 2, 1].map((impact) => (
                    <div key={impact} className="w-20 h-8 flex items-center justify-center text-xs font-bold border">
                      {IMPACT_LABELS[impact as keyof typeof IMPACT_LABELS]}
                    </div>
                  ))}
                </div>

                {/* Linhas da matriz */}
                {[5, 4, 3, 2, 1].map((probability) => (
                  <div key={probability} className="flex">
                    <div className="w-16 h-20 flex items-center justify-center text-xs font-bold border bg-gray-50">
                      {PROBABILITY_LABELS[probability as keyof typeof PROBABILITY_LABELS]}
                    </div>
                    {[5, 4, 3, 2, 1].map((impact) => {
                      const cellRisks = risks.filter(
                        (r) => r.probabilidade === probability && r.impacto === impact
                      );
                      const riskInfo = getRiskLevel(probability, impact);

                      return (
                        <div
                          key={`${probability}-${impact}`}
                          className={`w-20 h-20 border flex flex-col items-center justify-center text-xs font-bold cursor-pointer hover:opacity-80 transition ${riskInfo.color} ${riskInfo.borderColor}`}
                        >
                          {cellRisks.length > 0 && (
                            <div className="text-center">
                              <div className="text-lg">{cellRisks.length}</div>
                              <div className="text-xs">{riskInfo.level}</div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>

            {/* Legenda */}
            <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "Crítico", color: "bg-red-100", borderColor: "border-red-300" },
                { label: "Alto", color: "bg-orange-100", borderColor: "border-orange-300" },
                { label: "Médio", color: "bg-yellow-100", borderColor: "border-yellow-300" },
                { label: "Baixo", color: "bg-green-100", borderColor: "border-green-300" },
              ].map(({ label, color, borderColor }) => (
                <div key={label} className={`p-3 rounded border-2 ${color} ${borderColor} text-center text-sm font-semibold`}>
                  {label}
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Resumo de Riscos */}
        <div className="space-y-4">
          <Card className="p-4 bg-red-50 border-2 border-red-300">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <h4 className="font-bold text-red-700">Críticos</h4>
            </div>
            <p className="text-2xl font-bold text-red-600">{risksByLevel.critico.length}</p>
          </Card>

          <Card className="p-4 bg-orange-50 border-2 border-orange-300">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="w-5 h-5 text-orange-600" />
              <h4 className="font-bold text-orange-700">Altos</h4>
            </div>
            <p className="text-2xl font-bold text-orange-600">{risksByLevel.alto.length}</p>
          </Card>

          <Card className="p-4 bg-yellow-50 border-2 border-yellow-300">
            <h4 className="font-bold text-yellow-700 mb-2">Médios</h4>
            <p className="text-2xl font-bold text-yellow-600">{risksByLevel.medio.length}</p>
          </Card>

          <Card className="p-4 bg-green-50 border-2 border-green-300">
            <h4 className="font-bold text-green-700 mb-2">Baixos</h4>
            <p className="text-2xl font-bold text-green-600">{risksByLevel.baixo.length}</p>
          </Card>

          <Card className="p-4 bg-blue-50 border-2 border-blue-300">
            <h4 className="font-bold text-blue-700 mb-2">Total</h4>
            <p className="text-2xl font-bold text-blue-600">{risks.length}</p>
          </Card>
        </div>
      </div>

      {/* Lista de Riscos Detalhada */}
      <Card className="p-6">
        <h3 className="text-lg font-bold mb-4">Detalhamento de Riscos</h3>
        
        {risks.length === 0 ? (
          <p className="text-gray-500 text-center py-8">Nenhum risco adicionado. Clique em "Adicionar Risco" para começar.</p>
        ) : (
          <div className="space-y-4">
            {risks.map((risk) => {
              const riskInfo = getRiskLevel(risk.probabilidade, risk.impacto);
              const isSelected = selectedRisk === risk.id;

              return (
                <div
                  key={risk.id}
                  className={`p-4 rounded border-2 cursor-pointer transition ${
                    isSelected
                      ? `${riskInfo.color} ${riskInfo.borderColor}`
                      : "border-gray-200 bg-gray-50 hover:bg-gray-100"
                  }`}
                  onClick={() => setSelectedRisk(risk.id)}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <Input
                        value={risk.descricao}
                        onChange={(e) => handleUpdateRisk(risk.id, { descricao: e.target.value })}
                        placeholder="Descrição do risco"
                        className="font-semibold mb-2"
                        onClick={(e) => e.stopPropagation()}
                      />
                      <div className="flex gap-4 text-sm">
                        <label className="flex items-center gap-2">
                          <span className="font-semibold">Probabilidade:</span>
                          <select
                            value={risk.probabilidade}
                            onChange={(e) =>
                              handleUpdateRisk(risk.id, { probabilidade: parseInt(e.target.value) })
                            }
                            className="border rounded px-2 py-1"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {[1, 2, 3, 4, 5].map((p) => (
                              <option key={p} value={p}>
                                {p} - {PROBABILITY_LABELS[p as keyof typeof PROBABILITY_LABELS]}
                              </option>
                            ))}
                          </select>
                        </label>
                        <label className="flex items-center gap-2">
                          <span className="font-semibold">Impacto:</span>
                          <select
                            value={risk.impacto}
                            onChange={(e) =>
                              handleUpdateRisk(risk.id, { impacto: parseInt(e.target.value) })
                            }
                            className="border rounded px-2 py-1"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {[1, 2, 3, 4, 5].map((i) => (
                              <option key={i} value={i}>
                                {i} - {IMPACT_LABELS[i as keyof typeof IMPACT_LABELS]}
                              </option>
                            ))}
                          </select>
                        </label>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <div className={`px-3 py-1 rounded font-bold ${riskInfo.textColor} ${riskInfo.color}`}>
                        {riskInfo.level}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveRisk(risk.id);
                        }}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {isSelected && (
                    <div className="mt-3 pt-3 border-t">
                      <label className="block text-sm font-semibold mb-2">Plano de Mitigação:</label>
                      <Textarea
                        value={risk.mitigacao || ""}
                        onChange={(e) => handleUpdateRisk(risk.id, { mitigacao: e.target.value })}
                        placeholder="Descreva as ações para mitigar este risco"
                        className="min-h-20"
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}
