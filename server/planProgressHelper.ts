import { BusinessPlanData } from "../shared/planSchemas";

/**
 * Helper para calcular o progresso do plano de negócios
 */

export interface SectionProgress {
  name: string;
  completed: boolean;
  percentage: number;
  fields: {
    name: string;
    filled: boolean;
  }[];
}

export interface PlanProgress {
  totalPercentage: number;
  sections: SectionProgress[];
  completedSections: number;
  totalSections: number;
}

/**
 * Calcula o progresso de uma seção individual
 */
function calculateSectionProgress(
  sectionName: string,
  sectionData: any
): SectionProgress {
  if (!sectionData) {
    return {
      name: sectionName,
      completed: false,
      percentage: 0,
      fields: [],
    };
  }

  const fields: { name: string; filled: boolean }[] = [];
  let filledFields = 0;

  // Verifica cada campo da seção
  for (const [key, value] of Object.entries(sectionData)) {
    const isFilled = value !== null && value !== undefined && value !== "";

    // Para arrays, verifica se tem itens
    if (Array.isArray(value)) {
      const arrayFilled = value.length > 0 && value.some((item) => {
        if (typeof item === "object") {
          return Object.values(item).some((v) => v !== null && v !== undefined && v !== "");
        }
        return item !== null && item !== undefined && item !== "";
      });
      fields.push({ name: key, filled: arrayFilled });
      if (arrayFilled) filledFields++;
    } else {
      fields.push({ name: key, filled: isFilled });
      if (isFilled) filledFields++;
    }
  }

  const percentage = fields.length > 0 ? Math.round((filledFields / fields.length) * 100) : 0;
  const completed = percentage >= 80; // Considera completa com 80% preenchido

  return {
    name: sectionName,
    completed,
    percentage,
    fields,
  };
}

/**
 * Calcula o progresso geral do plano
 */
export function calculatePlanProgress(planData: BusinessPlanData | null): PlanProgress {
  if (!planData) {
    return {
      totalPercentage: 0,
      sections: [],
      completedSections: 0,
      totalSections: 8,
    };
  }

  const sections: SectionProgress[] = [
    calculateSectionProgress("Descrição da Empresa", planData.descricaoEmpresa),
    calculateSectionProgress("Produtos e Serviços", planData.produtosServicos),
    calculateSectionProgress("Estrutura Organizacional", planData.estruturaOrganizacional),
    calculateSectionProgress("Plano de Marketing", planData.planoMarketing),
    calculateSectionProgress("Plano Operacional", planData.planoOperacional),
    calculateSectionProgress("Estrutura de Capitalização", planData.estruturaCapitalizacao),
    calculateSectionProgress("Plano Financeiro", planData.planoFinanceiro),
    calculateSectionProgress("Sumário Executivo", planData.sumarioExecutivo),
  ];

  const completedSections = sections.filter((s) => s.completed).length;
  const totalPercentage = Math.round(
    sections.reduce((sum, s) => sum + s.percentage, 0) / sections.length
  );

  return {
    totalPercentage,
    sections,
    completedSections,
    totalSections: 8,
  };
}

/**
 * Retorna o nome da próxima seção a preencher
 */
export function getNextSection(planData: BusinessPlanData | null): string | null {
  const progress = calculatePlanProgress(planData);
  const nextSection = progress.sections.find((s) => !s.completed);
  return nextSection?.name || null;
}

/**
 * Verifica se o plano está completo
 */
export function isPlanComplete(planData: BusinessPlanData | null): boolean {
  const progress = calculatePlanProgress(planData);
  return progress.completedSections === progress.totalSections;
}

/**
 * Retorna estatísticas do plano
 */
export function getPlanStats(planData: BusinessPlanData | null) {
  const progress = calculatePlanProgress(planData);
  return {
    progress: progress.totalPercentage,
    completedSections: progress.completedSections,
    totalSections: progress.totalSections,
    isComplete: isPlanComplete(planData),
    nextSection: getNextSection(planData),
    estimatedCompletionDays: Math.ceil((100 - progress.totalPercentage) / 10), // Estimativa simplificada
  };
}
