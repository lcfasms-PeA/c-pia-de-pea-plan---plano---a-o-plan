/**
 * Helper para personalização de capa de relatórios
 * Suporta logotipos, cores e temas personalizados
 */

import { z } from "zod";

/**
 * Tipos de temas de capa disponíveis
 */
export type CoverTheme = "padrao" | "minimalista" | "corporativo" | "academico";

/**
 * Esquema de validação para opções de capa
 */
export const CoverOptionsSchema = z.object({
  theme: z.enum(["padrao", "minimalista", "corporativo", "academico"]).default("padrao"),
  logoUrl: z.string().url().optional(),
  logoPosition: z.enum(["top", "center", "bottom"]).default("top"),
  logoWidth: z.number().min(50).max(400).default(150),
  primaryColor: z.string().regex(/^#[0-9A-F]{6}$/i).default("#1F2937"),
  secondaryColor: z.string().regex(/^#[0-9A-F]{6}$/i).default("#3B82F6"),
  accentColor: z.string().regex(/^#[0-9A-F]{6}$/i).default("#10B981"),
  companyName: z.string().min(1).max(100),
  subtitle: z.string().max(200).optional(),
  authorName: z.string().max(100).optional(),
  date: z.date().optional(),
  includeInstitutionLogo: z.boolean().default(false),
  institutionLogoUrl: z.string().url().optional(),
  customText: z.string().max(500).optional(),
});

export type CoverOptions = z.infer<typeof CoverOptionsSchema>;

/**
 * Definições de temas de capa
 */
export const COVER_THEMES: Record<CoverTheme, Partial<CoverOptions>> = {
  padrao: {
    primaryColor: "#1F2937",
    secondaryColor: "#3B82F6",
    accentColor: "#10B981",
    logoPosition: "top",
    logoWidth: 150,
  },
  minimalista: {
    primaryColor: "#FFFFFF",
    secondaryColor: "#000000",
    accentColor: "#E5E7EB",
    logoPosition: "center",
    logoWidth: 120,
  },
  corporativo: {
    primaryColor: "#003366",
    secondaryColor: "#0066CC",
    accentColor: "#FF6600",
    logoPosition: "top",
    logoWidth: 180,
  },
  academico: {
    primaryColor: "#2C3E50",
    secondaryColor: "#34495E",
    accentColor: "#E74C3C",
    logoPosition: "center",
    logoWidth: 140,
  },
};

/**
 * Converte cor hexadecimal para RGB
 */
export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) {
    return { r: 31, g: 41, b: 55 }; // Cor padrão
  }
  return {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16),
  };
}

/**
 * Calcula luminância de uma cor para determinar texto branco ou preto
 */
export function getContrastColor(hex: string): string {
  const rgb = hexToRgb(hex);
  const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;
  return luminance > 0.5 ? "#000000" : "#FFFFFF";
}

/**
 * Valida opções de capa
 */
export function validateCoverOptions(options: Partial<CoverOptions>): {
  valid: boolean;
  errors: string[];
  data?: CoverOptions;
} {
  try {
    const validated = CoverOptionsSchema.parse(options);
    return {
      valid: true,
      errors: [],
      data: validated,
    };
  } catch (error: any) {
    const errors = error.errors?.map((e: any) => `${e.path.join(".")}: ${e.message}`) || [
      "Erro na validação de opções de capa",
    ];
    return {
      valid: false,
      errors,
    };
  }
}

/**
 * Gera CSS para a capa baseado nas opções
 */
export function generateCoverCSS(options: CoverOptions): string {
  const theme = COVER_THEMES[options.theme] || COVER_THEMES.padrao;
  const primaryColor = options.primaryColor || theme.primaryColor || "#1F2937";
  const secondaryColor = options.secondaryColor || theme.secondaryColor || "#3B82F6";
  const contrastColor = getContrastColor(primaryColor);

  return `
    .cover-container {
      background: linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%);
      color: ${contrastColor};
      padding: 60px 40px;
      text-align: center;
      min-height: 600px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      page-break-after: always;
    }

    .cover-logo {
      margin: 20px 0;
      max-width: ${options.logoWidth}px;
      height: auto;
    }

    .cover-institution-logo {
      position: absolute;
      top: 20px;
      right: 20px;
      max-width: 100px;
      height: auto;
      opacity: 0.8;
    }

    .cover-title {
      font-size: 48px;
      font-weight: bold;
      margin: 30px 0 20px 0;
      color: ${contrastColor};
    }

    .cover-subtitle {
      font-size: 24px;
      margin: 10px 0 30px 0;
      color: ${contrastColor};
      opacity: 0.9;
    }

    .cover-company {
      font-size: 32px;
      font-weight: 600;
      margin: 40px 0 20px 0;
      color: ${contrastColor};
    }

    .cover-author {
      font-size: 16px;
      margin: 20px 0 10px 0;
      color: ${contrastColor};
      opacity: 0.85;
    }

    .cover-date {
      font-size: 14px;
      color: ${contrastColor};
      opacity: 0.8;
    }

    .cover-custom-text {
      font-size: 14px;
      margin-top: 40px;
      padding: 20px;
      border-top: 2px solid ${contrastColor};
      color: ${contrastColor};
      opacity: 0.9;
    }

    .cover-divider {
      width: 100px;
      height: 3px;
      background-color: ${options.accentColor || "#10B981"};
      margin: 20px auto;
    }
  `;
}

/**
 * Gera HTML para a capa
 */
export function generateCoverHTML(options: CoverOptions): string {
  const logoHtml = options.logoUrl
    ? `<img src="${options.logoUrl}" alt="Logo" class="cover-logo" />`
    : "";

  const institutionLogoHtml =
    options.includeInstitutionLogo && options.institutionLogoUrl
      ? `<img src="${options.institutionLogoUrl}" alt="Institution Logo" class="cover-institution-logo" />`
      : "";

  const subtitleHtml = options.subtitle
    ? `<div class="cover-subtitle">${options.subtitle}</div>`
    : "";

  const authorHtml = options.authorName
    ? `<div class="cover-author">Por: ${options.authorName}</div>`
    : "";

  const dateHtml = options.date
    ? `<div class="cover-date">${options.date.toLocaleDateString("pt-BR")}</div>`
    : "";

  const customTextHtml = options.customText
    ? `<div class="cover-custom-text">${options.customText}</div>`
    : "";

  const dividerHtml = `<div class="cover-divider"></div>`;

  return `
    <div class="cover-container">
      ${institutionLogoHtml}
      ${logoHtml}
      ${dividerHtml}
      <div class="cover-title">Plano de Negócios</div>
      ${subtitleHtml}
      <div class="cover-company">${options.companyName}</div>
      ${authorHtml}
      ${dateHtml}
      ${customTextHtml}
    </div>
  `;
}

/**
 * Gera objeto de capa para o documento Word
 */
export function generateCoverObject(options: CoverOptions): any {
  const { Paragraph, TextRun, AlignmentType, PageBreak, Table, TableRow, TableCell, WidthType, BorderStyle } = require("docx");

  const theme = COVER_THEMES[options.theme] || COVER_THEMES.padrao;
  const primaryColor = options.primaryColor || theme.primaryColor || "#1F2937";
  const contrastColor = getContrastColor(primaryColor);

  const coverElements = [];

  // Logo da empresa
  if (options.logoUrl) {
    coverElements.push(
      new Paragraph({
        text: "",
        spacing: { after: 400 },
      })
    );
  }

  // Divisor
  coverElements.push(
    new Paragraph({
      text: "━".repeat(50),
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
    })
  );

  // Título
  coverElements.push(
    new Paragraph({
      text: "Plano de Negócios",
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
      size: 96,
      bold: true,
    })
  );

  // Subtítulo
  if (options.subtitle) {
    coverElements.push(
      new Paragraph({
        text: options.subtitle,
        alignment: AlignmentType.CENTER,
        spacing: { after: 300 },
        size: 48,
      })
    );
  }

  // Nome da empresa
  coverElements.push(
    new Paragraph({
      text: options.companyName,
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
      size: 64,
      bold: true,
    })
  );

  // Autor
  if (options.authorName) {
    coverElements.push(
      new Paragraph({
        text: `Por: ${options.authorName}`,
        alignment: AlignmentType.CENTER,
        spacing: { after: 100 },
        size: 32,
      })
    );
  }

  // Data
  if (options.date) {
    coverElements.push(
      new Paragraph({
        text: options.date.toLocaleDateString("pt-BR"),
        alignment: AlignmentType.CENTER,
        spacing: { after: 300 },
        size: 28,
      })
    );
  }

  // Texto customizado
  if (options.customText) {
    coverElements.push(
      new Paragraph({
        text: "",
        spacing: { after: 200 },
      }),
      new Paragraph({
        text: options.customText,
        alignment: AlignmentType.CENTER,
        spacing: { after: 200 },
        size: 28,
      })
    );
  }

  // Espaço em branco para preencher a página
  for (let i = 0; i < 5; i++) {
    coverElements.push(
      new Paragraph({
        text: "",
        spacing: { after: 200 },
      })
    );
  }

  // Page break
  coverElements.push(new PageBreak());

  return coverElements;
}

/**
 * Gera resumo de opções de capa para visualização
 */
export function generateCoverSummary(options: CoverOptions): {
  theme: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
  };
  logo: {
    hasCompanyLogo: boolean;
    hasInstitutionLogo: boolean;
  };
  content: {
    company: string;
    author?: string;
    subtitle?: string;
    customText?: string;
  };
} {
  return {
    theme: options.theme,
    colors: {
      primary: options.primaryColor,
      secondary: options.secondaryColor,
      accent: options.accentColor,
    },
    logo: {
      hasCompanyLogo: !!options.logoUrl,
      hasInstitutionLogo: options.includeInstitutionLogo && !!options.institutionLogoUrl,
    },
    content: {
      company: options.companyName,
      author: options.authorName,
      subtitle: options.subtitle,
      customText: options.customText,
    },
  };
}
