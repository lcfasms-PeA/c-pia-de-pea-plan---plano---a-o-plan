/**
 * Helper para exportação de plano de negócios em PDF
 * Utiliza ReportLab para geração de PDFs profissionais
 */

import { Document, Packer, Paragraph, Table, TableRow, TableCell, WidthType, BorderStyle, convertInchesToTwip, PageBreak, HeadingLevel, TextRun } from "docx";
import { type CoverOptions } from "./coverCustomization";

export interface PDFExportData {
  planName: string;
  companyName: string;
  authorName: string;
  createdAt: Date;
  theme?: {
    primaryColor?: string;
    secondaryColor?: string;
    logoUrl?: string;
  };
  coverOptions?: Partial<CoverOptions>;
  sections: {
    descricao?: any;
    produtos?: any;
    marketing?: any;
    operacional?: any;
    financeiro?: any;
    capitalizacao?: any;
    sumario?: any;
  };
  swot?: any;
  canvas?: any;
  financialAnalysis?: any;
}

/**
 * Formata um objeto para exibição em texto
 */
function formatObject(obj: any, indent = 0): string {
  if (!obj) return "";

  const indentStr = "  ".repeat(indent);
  let result = "";

  if (typeof obj === "object" && !Array.isArray(obj)) {
    for (const [key, value] of Object.entries(obj)) {
      if (value === null || value === undefined) continue;

      if (typeof value === "object") {
        result += `${indentStr}${key}:\n${formatObject(value, indent + 1)}`;
      } else {
        result += `${indentStr}${key}: ${value}\n`;
      }
    }
  } else if (Array.isArray(obj)) {
    obj.forEach((item, index) => {
      result += `${indentStr}[${index}] ${typeof item === "object" ? "\n" + formatObject(item, indent + 1) : item}\n`;
    });
  } else {
    result = `${indentStr}${obj}`;
  }

  return result;
}

/**
 * Gera um documento Word com o plano de negócios
 */
export function generatePlanDocument(data: PDFExportData): Document {
  const sections = [];

  // Capa personalizada
  const coverOptions = data.coverOptions ? {
    companyName: data.coverOptions.companyName || data.companyName,
    authorName: data.coverOptions.authorName || data.authorName,
    date: data.coverOptions.date || data.createdAt,
    theme: data.coverOptions.theme || "padrao",
    logoUrl: data.coverOptions.logoUrl || data.theme?.logoUrl,
    logoPosition: data.coverOptions.logoPosition || "top",
    logoWidth: data.coverOptions.logoWidth || 150,
    primaryColor: data.coverOptions.primaryColor || data.theme?.primaryColor || "#1F2937",
    secondaryColor: data.coverOptions.secondaryColor || data.theme?.secondaryColor || "#3B82F6",
    accentColor: data.coverOptions.accentColor || "#10B981",
    subtitle: data.coverOptions.subtitle,
    includeInstitutionLogo: data.coverOptions.includeInstitutionLogo || false,
    institutionLogoUrl: data.coverOptions.institutionLogoUrl,
    customText: data.coverOptions.customText,
  } : {
    companyName: data.companyName,
    authorName: data.authorName,
    date: data.createdAt,
    theme: "padrao" as const,
    logoUrl: data.theme?.logoUrl,
    logoPosition: "top" as const,
    logoWidth: 150,
    primaryColor: data.theme?.primaryColor || "#1F2937",
    secondaryColor: data.theme?.secondaryColor || "#3B82F6",
    accentColor: "#10B981",
  };

  // Adiciona capa com divisores
  sections.push(
    new Paragraph({
      text: "━".repeat(60),
      alignment: "center" as any,
      spacing: { after: 400 },
    }),
    new Paragraph({
      text: "Plano de Negócios",
      heading: HeadingLevel.HEADING_1,
      alignment: "center" as any,
      spacing: { after: 200 },
      children: [new TextRun({ text: "Plano de Negócios", bold: true })],
    }),
    new Paragraph({
      text: coverOptions.subtitle || "",
      alignment: "center" as any,
      spacing: { after: 300 },
    }),
    new Paragraph({
      text: coverOptions.companyName,
      heading: HeadingLevel.HEADING_1,
      alignment: "center" as any,
      spacing: { after: 200 },
      children: [new TextRun({ text: coverOptions.companyName, bold: true })],
    }),
    new Paragraph({
      text: `Por: ${coverOptions.authorName}`,
      alignment: "center" as any,
      spacing: { after: 100 },
    }),
    new Paragraph({
      text: `Data: ${coverOptions.date.toLocaleDateString("pt-BR")}`,
      alignment: "center" as any,
      spacing: { after: 300 },
    }),
    coverOptions.customText ? new Paragraph({
      text: coverOptions.customText,
      alignment: "center" as any,
      spacing: { after: 200 },
    }) : new Paragraph({
      text: "",
      spacing: { after: 0 },
    }),
    new Paragraph({
      text: "━".repeat(60),
      alignment: "center" as any,
      spacing: { after: 600 },
    }),
    new PageBreak()
  );

  // Índice
  sections.push(
    new Paragraph({
      text: "Índice",
      heading: HeadingLevel.HEADING_1,
      spacing: { after: 200 },
    }),
    new Paragraph({
      text: "1. Descrição da Empresa",
      spacing: { after: 100 },
    }),
    new Paragraph({
      text: "2. Produtos e Serviços",
      spacing: { after: 100 },
    }),
    new Paragraph({
      text: "3. Plano de Marketing",
      spacing: { after: 100 },
    }),
    new Paragraph({
      text: "4. Plano Operacional",
      spacing: { after: 100 },
    }),
    new Paragraph({
      text: "5. Análise Financeira",
      spacing: { after: 100 },
    }),
    new Paragraph({
      text: "6. Análise SWOT",
      spacing: { after: 100 },
    }),
    new Paragraph({
      text: "7. Business Model Canvas",
      spacing: { after: 100 },
    }),
    new Paragraph({
      text: "8. Anexos",
      spacing: { after: 600 },
    }),
    new PageBreak()
  );

  // Seção 1: Descrição da Empresa
  if (data.sections.descricao) {
    sections.push(
      new Paragraph({
        text: "1. Descrição da Empresa",
        heading: HeadingLevel.HEADING_1,
        spacing: { after: 200 },
      }),
      new Paragraph({
        text: formatObject(data.sections.descricao),
        spacing: { after: 400 },
      }),
      new PageBreak()
    );
  }

  // Seção 2: Produtos e Serviços
  if (data.sections.produtos) {
    sections.push(
      new Paragraph({
        text: "2. Produtos e Serviços",
        heading: HeadingLevel.HEADING_1,
        spacing: { after: 200 },
      }),
      new Paragraph({
        text: formatObject(data.sections.produtos),
        spacing: { after: 400 },
      }),
      new PageBreak()
    );
  }

  // Seção 3: Plano de Marketing
  if (data.sections.marketing) {
    sections.push(
      new Paragraph({
        text: "3. Plano de Marketing",
        heading: HeadingLevel.HEADING_1,
        spacing: { after: 200 },
      }),
      new Paragraph({
        text: formatObject(data.sections.marketing),
        spacing: { after: 400 },
      }),
      new PageBreak()
    );
  }

  // Seção 4: Plano Operacional
  if (data.sections.operacional) {
    sections.push(
      new Paragraph({
        text: "4. Plano Operacional",
        heading: HeadingLevel.HEADING_1,
        spacing: { after: 200 },
      }),
      new Paragraph({
        text: formatObject(data.sections.operacional),
        spacing: { after: 400 },
      }),
      new PageBreak()
    );
  }

  // Seção 5: Análise Financeira
  if (data.financialAnalysis) {
    sections.push(
      new Paragraph({
        text: "5. Análise Financeira",
        heading: HeadingLevel.HEADING_1,
        spacing: { after: 200 },
      }),
      new Paragraph({
        text: "Indicadores Principais",
        heading: HeadingLevel.HEADING_2,
        spacing: { after: 100 },
      }),
      new Paragraph({
        text: `VPL: R$ ${data.financialAnalysis.vpl?.toLocaleString("pt-BR")}`,
        spacing: { after: 50 },
      }),
      new Paragraph({
        text: `TIR: ${data.financialAnalysis.tir?.toFixed(2)}%`,
        spacing: { after: 50 },
      }),
      new Paragraph({
        text: `Payback: ${data.financialAnalysis.payback?.toFixed(2)} meses`,
        spacing: { after: 200 },
      }),
      new Paragraph({
        text: "Demonstração de Resultado (DRE)",
        heading: HeadingLevel.HEADING_2,
        spacing: { after: 100 },
      }),
      new Paragraph({
        text: formatObject(data.financialAnalysis.dre),
        spacing: { after: 200 },
      }),
      new Paragraph({
        text: "Balanço Patrimonial",
        heading: HeadingLevel.HEADING_2,
        spacing: { after: 100 },
      }),
      new Paragraph({
        text: formatObject(data.financialAnalysis.balanco),
        spacing: { after: 400 },
      }),
      new PageBreak()
    );
  }

  // Seção 6: Análise SWOT
  if (data.swot) {
    sections.push(
      new Paragraph({
        text: "6. Análise SWOT",
        heading: HeadingLevel.HEADING_1,
        spacing: { after: 200 },
      }),
      new Paragraph({
        text: "Forças",
        heading: HeadingLevel.HEADING_2,
        spacing: { after: 100 },
      }),
      new Paragraph({
        text: formatObject(data.swot.forcas),
        spacing: { after: 150 },
      }),
      new Paragraph({
        text: "Fraquezas",
        heading: HeadingLevel.HEADING_2,
        spacing: { after: 100 },
      }),
      new Paragraph({
        text: formatObject(data.swot.fraquezas),
        spacing: { after: 150 },
      }),
      new Paragraph({
        text: "Oportunidades",
        heading: HeadingLevel.HEADING_2,
        spacing: { after: 100 },
      }),
      new Paragraph({
        text: formatObject(data.swot.oportunidades),
        spacing: { after: 150 },
      }),
      new Paragraph({
        text: "Ameaças",
        heading: HeadingLevel.HEADING_2,
        spacing: { after: 100 },
      }),
      new Paragraph({
        text: formatObject(data.swot.ameacas),
        spacing: { after: 400 },
      }),
      new PageBreak()
    );
  }

  // Seção 7: Business Model Canvas
  if (data.canvas) {
    sections.push(
      new Paragraph({
        text: "7. Business Model Canvas",
        heading: HeadingLevel.HEADING_1,
        spacing: { after: 200 },
      }),
      new Paragraph({
        text: "Parceiros Chave",
        heading: HeadingLevel.HEADING_2,
        spacing: { after: 100 },
      }),
      new Paragraph({
        text: formatObject(data.canvas.parceirosChave),
        spacing: { after: 150 },
      }),
      new Paragraph({
        text: "Atividades Chave",
        heading: HeadingLevel.HEADING_2,
        spacing: { after: 100 },
      }),
      new Paragraph({
        text: formatObject(data.canvas.atividadesChave),
        spacing: { after: 150 },
      }),
      new Paragraph({
        text: "Recursos Chave",
        heading: HeadingLevel.HEADING_2,
        spacing: { after: 100 },
      }),
      new Paragraph({
        text: formatObject(data.canvas.recursosChave),
        spacing: { after: 150 },
      }),
      new Paragraph({
        text: "Proposta de Valor",
        heading: HeadingLevel.HEADING_2,
        spacing: { after: 100 },
      }),
      new Paragraph({
        text: formatObject(data.canvas.propuestaValor),
        spacing: { after: 150 },
      }),
      new Paragraph({
        text: "Relacionamento com Clientes",
        heading: HeadingLevel.HEADING_2,
        spacing: { after: 100 },
      }),
      new Paragraph({
        text: formatObject(data.canvas.relacionamentoClientes),
        spacing: { after: 150 },
      }),
      new Paragraph({
        text: "Canais de Distribuição",
        heading: HeadingLevel.HEADING_2,
        spacing: { after: 100 },
      }),
      new Paragraph({
        text: formatObject(data.canvas.canaisDistribuicao),
        spacing: { after: 150 },
      }),
      new Paragraph({
        text: "Segmentos de Clientes",
        heading: HeadingLevel.HEADING_2,
        spacing: { after: 100 },
      }),
      new Paragraph({
        text: formatObject(data.canvas.segmentosClientes),
        spacing: { after: 150 },
      }),
      new Paragraph({
        text: "Estrutura de Custos",
        heading: HeadingLevel.HEADING_2,
        spacing: { after: 100 },
      }),
      new Paragraph({
        text: formatObject(data.canvas.estruturaCustos),
        spacing: { after: 150 },
      }),
      new Paragraph({
        text: "Fontes de Receita",
        heading: HeadingLevel.HEADING_2,
        spacing: { after: 100 },
      }),
      new Paragraph({
        text: formatObject(data.canvas.fontesReceita),
        spacing: { after: 400 },
      }),
      new PageBreak()
    );
  }

  // Rodapé
  sections.push(
    new Paragraph({
      text: "Fim do Documento",
      alignment: "center" as any,
      spacing: { before: 400 },
    })
  );

  return new Document({
    sections: [
      {
        children: sections as any,
      },
    ],
  });
}

/**
 * Gera um buffer de documento Word a partir dos dados do plano
 */
export async function generatePlanDocument_Buffer(data: PDFExportData): Promise<Buffer> {
  const doc = generatePlanDocument(data);
  const buffer = await Packer.toBuffer(doc);
  return buffer;
}

/**
 * Alias para compatibilidade
 */
export const generatePlanPDF = generatePlanDocument_Buffer;

/**
 * Gera um nome de arquivo para o PDF
 */
export function generatePDFFileName(companyName: string, createdAt: Date): string {
  const sanitizedName = companyName
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "-")
    .replace(/-+/g, "-")
    .substring(0, 50);

  const date = createdAt.toISOString().split("T")[0];
  return `plano-negocio-${sanitizedName}-${date}.docx`;
}

/**
 * Valida os dados antes da exportação
 */
export function validateExportData(data: PDFExportData): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!data.companyName) {
    errors.push("Nome da empresa é obrigatório");
  }

  if (!data.authorName) {
    errors.push("Nome do autor é obrigatório");
  }

  if (!data.sections || Object.keys(data.sections).length === 0) {
    errors.push("Nenhuma seção foi preenchida");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
