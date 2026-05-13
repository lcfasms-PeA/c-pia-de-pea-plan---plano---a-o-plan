import { describe, expect, it } from "vitest";
import { generatePDFFileName, validateExportData, type PDFExportData } from "./pdfExportHelper";

describe("PDF Export Helper", () => {
  describe("generatePDFFileName", () => {
    it("should generate valid PDF filename", () => {
      const date = new Date("2026-05-12");
      const fileName = generatePDFFileName("Minha Empresa", date);

      expect(fileName).toContain("plano-negocio");
      expect(fileName).toContain("minha-empresa");
      expect(fileName).toContain("2026-05-12");
      expect(fileName.endsWith(".docx")).toBe(true);
    });

    it("should sanitize special characters in company name", () => {
      const date = new Date("2026-05-12");
      const fileName = generatePDFFileName("Empresa & Co. Ltda!", date);

      expect(fileName).not.toContain("&");
      expect(fileName).not.toContain("!");
      expect(fileName).toContain("empresa-co-ltda");
      expect(fileName.endsWith(".docx")).toBe(true);
    });

    it("should handle very long company names", () => {
      const date = new Date("2026-05-12");
      const longName = "A".repeat(100);
      const fileName = generatePDFFileName(longName, date);

      expect(fileName.length).toBeLessThan(100);
    });
  });

  describe("validateExportData", () => {
    it("should validate complete export data", () => {
      const data: PDFExportData = {
        planName: "Plano 1",
        companyName: "Empresa",
        authorName: "João",
        createdAt: new Date(),
        sections: {
          descricao: { nomeEmpresa: "Empresa" },
        },
      };

      const result = validateExportData(data);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should reject data without company name", () => {
      const data: PDFExportData = {
        planName: "Plano 1",
        companyName: "",
        authorName: "João",
        createdAt: new Date(),
        sections: {},
      };

      const result = validateExportData(data);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain("Nome da empresa é obrigatório");
    });

    it("should reject data without author name", () => {
      const data: PDFExportData = {
        planName: "Plano 1",
        companyName: "Empresa",
        authorName: "",
        createdAt: new Date(),
        sections: {},
      };

      const result = validateExportData(data);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain("Nome do autor é obrigatório");
    });

    it("should reject data without sections", () => {
      const data: PDFExportData = {
        planName: "Plano 1",
        companyName: "Empresa",
        authorName: "João",
        createdAt: new Date(),
        sections: {},
      };

      const result = validateExportData(data);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain("Nenhuma seção foi preenchida");
    });

    it("should accept data with multiple errors", () => {
      const data: PDFExportData = {
        planName: "Plano 1",
        companyName: "",
        authorName: "",
        createdAt: new Date(),
        sections: {},
      };

      const result = validateExportData(data);

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(1);
    });
  });

  describe("PDF Document Generation", () => {
    it("should handle SWOT data in export", () => {
      const data: PDFExportData = {
        planName: "Plano SWOT",
        companyName: "Tech Company",
        authorName: "Maria",
        createdAt: new Date(),
        sections: {
          descricao: { nomeEmpresa: "Tech Company" },
        },
        swot: {
          forcas: [{ id: "1", descricao: "Equipe experiente", peso: 5 }],
          fraquezas: [{ id: "1", descricao: "Falta de capital", peso: 3 }],
          oportunidades: [{ id: "1", descricao: "Mercado em crescimento", peso: 4 }],
          ameacas: [{ id: "1", descricao: "Concorrência forte", peso: 4 }],
        },
      };

      const result = validateExportData(data);
      expect(result.valid).toBe(true);
    });

    it("should handle financial data in export", () => {
      const data: PDFExportData = {
        planName: "Plano Financeiro",
        companyName: "Finance Corp",
        authorName: "Pedro",
        createdAt: new Date(),
        sections: {
          descricao: { nomeEmpresa: "Finance Corp" },
          financeiro: { receitas: 100000 },
        },
        financialAnalysis: {
          vpl: 50000,
          tir: 15.5,
          payback: 2.5,
          dre: {
            receitas: 100000,
            custos: 40000,
            lucroGruto: 60000,
            despesas: 20000,
            lucroOperacional: 40000,
            juros: 5000,
            lucroAntes: 35000,
            impostos: 5250,
            lucroLiquido: 29750,
          },
          balanco: {
            ativo: { circulante: 50000, naoCirculante: 100000, total: 150000 },
            passivo: { circulante: 30000, naoCirculante: 40000, total: 70000 },
            patrimonio: { capitalSocial: 100000, lucrosAcumulados: 29750, total: 129750 },
          },
        },
      };

      const result = validateExportData(data);
      expect(result.valid).toBe(true);
    });

    it("should handle canvas data in export", () => {
      const data: PDFExportData = {
        planName: "Plano Canvas",
        companyName: "Startup",
        authorName: "Ana",
        createdAt: new Date(),
        sections: {
          descricao: { nomeEmpresa: "Startup" },
        },
        canvas: {
          parceirosChave: {
            id: "1",
            titulo: "Parceiros",
            descricao: "Parceiros principais",
            items: ["Fornecedor A", "Fornecedor B"],
          },
          atividadesChave: {
            id: "2",
            titulo: "Atividades",
            descricao: "Atividades principais",
            items: ["Desenvolvimento", "Marketing"],
          },
          recursosChave: {
            id: "3",
            titulo: "Recursos",
            descricao: "Recursos principais",
            items: ["Equipe", "Tecnologia"],
          },
          propuestaValor: {
            id: "4",
            titulo: "Proposta",
            descricao: "Proposta de valor",
            items: ["Inovação", "Qualidade"],
          },
          relacionamentoClientes: {
            id: "5",
            titulo: "Relacionamento",
            descricao: "Relacionamento com clientes",
            items: ["Suporte 24/7"],
          },
          canaisDistribuicao: {
            id: "6",
            titulo: "Canais",
            descricao: "Canais de distribuição",
            items: ["Online", "Presencial"],
          },
          segmentosClientes: {
            id: "7",
            titulo: "Segmentos",
            descricao: "Segmentos de clientes",
            items: ["PME", "Startups"],
          },
          estruturaCustos: {
            id: "8",
            titulo: "Custos",
            descricao: "Estrutura de custos",
            items: ["Pessoal", "Infraestrutura"],
          },
          fontesReceita: {
            id: "9",
            titulo: "Receita",
            descricao: "Fontes de receita",
            items: ["Assinatura", "Consultoria"],
          },
        },
      };

      const result = validateExportData(data);
      expect(result.valid).toBe(true);
    });
  });
});
