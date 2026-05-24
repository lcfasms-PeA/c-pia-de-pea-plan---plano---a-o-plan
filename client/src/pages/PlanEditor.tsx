import { useState } from "react";
import { useRoute } from "wouter";
import { trpc } from "@/lib/trpc";
import MapaPlano from "@/components/MapaPlano";
import EditorPlano from "@/components/EditorPlano";
import SecaoFinanceira from "@/components/SecaoFinanceira";
import { Card } from "@/components/ui/card";
import { Loader2, AlertCircle } from "lucide-react";

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

  const sections = [
    { id: "descricaoEmpresa", title: "Descrição da Empresa", progress: 0, completed: false },
    { id: "produtosServicos", title: "Produtos e Serviços", progress: 0, completed: false },
    { id: "estruturaOrganizacional", title: "Estrutura Organizacional", progress: 0, completed: false },
    { id: "planoMarketing", title: "Plano de Marketing", progress: 0, completed: false },
    { id: "planoOperacional", title: "Plano Operacional", progress: 0, completed: false },
    { id: "estruturaCapitalizacao", title: "Estrutura de Capitalização", progress: 0, completed: false },
    { id: "planoFinanceiro", title: "Plano Financeiro", progress: 0, completed: false },
    { id: "sumarioExecutivo", title: "Sumário Executivo", progress: 0, completed: false },
  ];

  const editorSections = sections.map((s) => ({
    id: s.id,
    title: s.title,
    fields: {},
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
