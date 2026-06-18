import { useState } from "react";
import { useRoute } from "wouter";
import { trpc } from "@/lib/trpc";
import MapaPlano from "@/components/MapaPlano";
import EditorPlano from "@/components/EditorPlano";
import SecaoFinanceira from "@/components/SecaoFinanceira";
import CanvasEditor from "@/components/CanvasEditor";
import RiskMatrix from "@/components/RiskMatrix";
import SWOTEditor from "@/components/SWOTEditor";
import TimelineGantt from "@/components/TimelineGantt";
import { Card } from "@/components/ui/card";
import { Loader2, AlertCircle } from "lucide-react";

const TEXT_SECTION_FIELDS: Record<string, string[]> = {
  descricaoEmpresa: [
    "nomeEmpresa",
    "nomeFantasia",
    "descricaoNegocio",
    "missao",
    "visao",
    "valores",
    "dataFundacao",
    "cnpj",
    "endereco",
    "telefone",
    "email",
    "website",
    "setor",
    "segmento",
  ],
  produtosServicos: ["garantia", "posVenda"],
  estruturaOrganizacional: ["totalFuncionarios", "organograma", "planosCapacitacao"],
  planoMarketing: [
    "publicoAlvo",
    "posicionamento",
    "estrategiaPreco",
    "estrategiaPromocao",
    "estrategiaDistribuicao",
    "comunicacao",
    "orcamentoMarketing",
  ],
  planoOperacional: [
    "localizacao",
    "infraestrutura",
    "materiaPrima",
    "qualidade",
    "sustentabilidade",
  ],
  estruturaCapitalizacao: ["capitalSocial", "investimentoInicial"],
  planoFinanceiro: ["taxaDesconto", "taxaJuros"],
  sumarioExecutivo: [
    "resumoExecutivo",
    "oportunidade",
    "solucao",
    "mercado",
    "financeiro",
    "proximos12Meses",
  ],
};

function calculateObjectProgress(sectionData: Record<string, unknown> | undefined) {
  if (!sectionData) return { progress: 0, completed: false };

  const values = Object.values(sectionData);
  if (values.length === 0) return { progress: 0, completed: false };

  const filledCount = values.filter((value) => {
    if (Array.isArray(value)) {
      return value.length > 0;
    }

    return value !== null && value !== undefined && value !== "";
  }).length;

  const progress = Math.round((filledCount / values.length) * 100);
  return { progress, completed: progress >= 80 };
}

function calculateArrayProgress(items: unknown[] | undefined) {
  const progress = items && items.length > 0 ? 100 : 0;
  return { progress, completed: progress >= 80 };
}

function mapSwotInitialData(swotData: Record<string, any> | undefined) {
  return {
    strengths: (swotData?.forcas || []).map((item: { descricao?: string }) => item.descricao || ""),
    weaknesses: (swotData?.fraquezas || []).map((item: { descricao?: string }) => item.descricao || ""),
    opportunities: (swotData?.oportunidades || []).map((item: { descricao?: string }) => item.descricao || ""),
    threats: (swotData?.ameacas || []).map((item: { descricao?: string }) => item.descricao || ""),
  };
}

function buildTextSectionFields(sectionId: string, sectionData: Record<string, unknown> | undefined) {
  const templateFields = TEXT_SECTION_FIELDS[sectionId] || [];

  return templateFields.reduce<Record<string, string>>((accumulator, fieldName) => {
    const rawValue = sectionData?.[fieldName];
    accumulator[fieldName] = rawValue === null || rawValue === undefined ? "" : String(rawValue);
    return accumulator;
  }, {});
}

export default function PlanEditor() {
  const [, params] = useRoute("/plano/:id");
  const planId = params?.id ? parseInt(params.id) : null;
  const [currentSectionId, setCurrentSectionId] = useState("descricaoEmpresa");

  const { data: plan, isLoading, error } = trpc.businessPlans.getById.useQuery(
    { id: planId! },
    { enabled: !!planId }
  );

  const { data: progress } = trpc.businessPlans.getProgress.useQuery(
    { id: planId! },
    { enabled: !!planId }
  );
  const updateSectionMutation = trpc.businessPlans.updateSection.useMutation();

  if (!planId) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="p-6 text-center">
          <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-500" />
          <p className="text-lg font-semibold">Plano não encontrado</p>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-12 h-12 animate-spin text-blue-500" />
      </div>
    );
  }

  if (error || !plan) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="p-6 text-center">
          <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-500" />
          <p className="text-lg font-semibold">Erro ao carregar plano</p>
          <p className="text-sm text-gray-600">{error?.message}</p>
        </Card>
      </div>
    );
  }

  const planData = (plan.data as Record<string, any>) || {};
  const progressSections = progress?.sections || [];

  const baseSections = [
    { id: "descricaoEmpresa", title: "Descrição da Empresa" },
    { id: "produtosServicos", title: "Produtos e Serviços" },
    { id: "estruturaOrganizacional", title: "Estrutura Organizacional" },
    { id: "planoMarketing", title: "Plano de Marketing" },
    { id: "planoOperacional", title: "Plano Operacional" },
    { id: "estruturaCapitalizacao", title: "Estrutura de Capitalização" },
    { id: "planoFinanceiro", title: "Plano Financeiro" },
    { id: "sumarioExecutivo", title: "Sumário Executivo" },
  ];

  const sections = [
    ...baseSections.map((section, index) => ({
      ...section,
      progress: progressSections[index]?.percentage ?? calculateObjectProgress(planData[section.id]).progress,
      completed: progressSections[index]?.completed ?? calculateObjectProgress(planData[section.id]).completed,
    })),
    {
      id: "canvas",
      title: "Business Model Canvas",
      ...calculateObjectProgress(planData.canvas),
    },
    {
      id: "analiseSWOT",
      title: "Análise SWOT",
      ...calculateArrayProgress([
        ...(planData.swot?.forcas || []),
        ...(planData.swot?.fraquezas || []),
        ...(planData.swot?.oportunidades || []),
        ...(planData.swot?.ameacas || []),
      ]),
    },
    {
      id: "cronogramaProjeto",
      title: "Cronograma do Projeto",
      ...calculateArrayProgress(planData.planoOperacional?.cronograma),
    },
    {
      id: "analiseRiscos",
      title: "Análise de Risco",
      ...calculateArrayProgress(planData.sumarioExecutivo?.riscos),
    },
  ];

  const editorSections = baseSections.map((s) => ({
    id: s.id,
    title: s.title,
    fields: buildTextSectionFields(s.id, planData[s.id]),
  }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
      {/* Sidebar - Mapa do Plano */}
      <div className="lg:col-span-1">
        <MapaPlano
          sections={sections}
          currentSection={currentSectionId}
          onSelectSection={setCurrentSectionId}
        />
      </div>

      {/* Main Content - Editor */}
      <div className="lg:col-span-2">
        {currentSectionId === "planoFinanceiro" ? (
          <SecaoFinanceira
            planId={planId}
            initialData={(plan?.data as any)?.planoFinanceiro}
            onSave={async (data) => {
              // Salvar dados financeiros
              await updateSectionMutation.mutateAsync({
                id: planId,
                section: "planoFinanceiro" as any,
                data: data as any,
              });
            }}
          />
        ) : currentSectionId === "canvas" ? (
          <CanvasEditor
            planId={planId}
            initialData={planData.canvas}
          />
        ) : currentSectionId === "analiseSWOT" ? (
          <SWOTEditor
            planId={planId}
            initialData={mapSwotInitialData(planData.swot)}
          />
        ) : currentSectionId === "cronogramaProjeto" ? (
          <TimelineGantt
            planId={planId}
            initialTasks={planData.planoOperacional?.cronograma}
          />
        ) : currentSectionId === "analiseRiscos" ? (
          <RiskMatrix
            planId={planId}
            initialRisks={planData.sumarioExecutivo?.riscos}
          />
        ) : (
          <EditorPlano
            planId={planId}
            sections={editorSections}
            currentSectionId={currentSectionId}
            onSectionChange={setCurrentSectionId}
          />
        )}
      </div>
    </div>
  );
}
