import { describe, expect, it } from "vitest";
import { calculatePlanProgress, isPlanComplete, getNextSection } from "./planProgressHelper";
import { BusinessPlanData } from "../shared/planSchemas";

describe("Business Plan Progress Helper", () => {
  describe("calculatePlanProgress", () => {
    it("should return 0% progress for empty plan", () => {
      const emptyPlan: BusinessPlanData = {};
      const progress = calculatePlanProgress(emptyPlan);

      expect(progress.totalPercentage).toBe(0);
      expect(progress.completedSections).toBe(0);
      expect(progress.totalSections).toBe(8);
    });

    it("should return 0% progress for null plan", () => {
      const progress = calculatePlanProgress(null);

      expect(progress.totalPercentage).toBe(0);
      expect(progress.completedSections).toBe(0);
      expect(progress.totalSections).toBe(8);
    });

    it("should calculate progress for partially filled plan", () => {
      const partialPlan: BusinessPlanData = {
        descricaoEmpresa: {
          nomeEmpresa: "Test Company",
          nomeFantasia: "Test",
          descricaoNegocio: "A test business",
          missao: "Our mission",
          visao: "Our vision",
        },
        produtosServicos: {
          produtos: [
            {
              id: "1",
              nome: "Product 1",
              descricao: "A product",
              preco: 100,
            },
          ],
        },
      };

      const progress = calculatePlanProgress(partialPlan);

      expect(progress.totalPercentage).toBeGreaterThan(0);
      expect(progress.totalPercentage).toBeLessThan(100);
      expect(progress.sections.length).toBe(8);
    });

    it("should mark section as completed when 80% filled", () => {
      const plan: BusinessPlanData = {
        descricaoEmpresa: {
          nomeEmpresa: "Test Company",
          nomeFantasia: "Test",
          descricaoNegocio: "A test business",
          missao: "Our mission",
          visao: "Our vision",
          valores: "Our values",
          dataFundacao: "2024-01-01",
        },
      };

      const progress = calculatePlanProgress(plan);
      const descricaoSection = progress.sections[0];

      expect(descricaoSection.completed).toBe(true);
      expect(descricaoSection.percentage).toBeGreaterThanOrEqual(80);
    });
  });

  describe("isPlanComplete", () => {
    it("should return false for empty plan", () => {
      const emptyPlan: BusinessPlanData = {};
      expect(isPlanComplete(emptyPlan)).toBe(false);
    });

    it("should return false for null plan", () => {
      expect(isPlanComplete(null)).toBe(false);
    });

    it("should return true for fully filled plan", () => {
      const completePlan: BusinessPlanData = {
        descricaoEmpresa: {
          nomeEmpresa: "Test",
          nomeFantasia: "Test",
          descricaoNegocio: "Test",
          missao: "Test",
          visao: "Test",
          valores: "Test",
          dataFundacao: "2024-01-01",
          cnpj: "12.345.678/0001-00",
        },
        produtosServicos: {
          produtos: [{ id: "1", nome: "Product", preco: 100 }],
          servicos: [{ id: "1", nome: "Service", preco: 50 }],
          garantia: "1 year",
          posVenda: "Support available",
        },
        estruturaOrganizacional: {
          totalFuncionarios: 10,
          organograma: "CEO -> Managers",
          cargos: [{ id: "1", cargo: "CEO", quantidade: 1 }],
          competenciasChave: ["Leadership"],
          planosCapacitacao: "Annual training",
        },
        planoMarketing: {
          publicoAlvo: "Businesses",
          segmentacao: ["SME"],
          posicionamento: "Premium",
          estrategiaPreco: "Value-based",
          estrategiaPromocao: "Digital",
          estrategiaDistribuicao: "Direct",
          comunicacao: "Multi-channel",
          meiosComunicacao: ["Email", "Social"],
          orcamentoMarketing: 10000,
        },
        planoOperacional: {
          processosPrincipais: ["Production"],
          localizacao: "Downtown",
          infraestrutura: "Modern facility",
          equipamentos: [{ id: "1", nome: "Machine", quantidade: 5, custo: 50000 }],
          fornecedores: [{ id: "1", nome: "Supplier", produto: "Raw materials" }],
          materiaPrima: "Sourced locally",
          qualidade: "ISO certified",
          sustentabilidade: "Green practices",
        },
        estruturaCapitalizacao: {
          capitalSocial: 100000,
          investimentoInicial: 150000,
          fonteRecursos: [{ id: "1", fonte: "Owner", valor: 100000 }],
          emprestimos: [{ id: "1", instituicao: "Bank", valor: 50000, taxa: 5 }],
          investidores: [{ id: "1", nome: "Investor", aporte: 50000 }],
        },
        planoFinanceiro: {
          receitas: [{ id: "1", descricao: "Sales", mes1: 10000 }],
          custos: [{ id: "1", descricao: "COGS", mes1: 5000 }],
          despesas: [{ id: "1", descricao: "Rent", mes1: 2000 }],
          taxaDesconto: 10,
          taxaJuros: 5,
        },
        sumarioExecutivo: {
          resumoExecutivo: "Summary",
          oportunidade: "Market opportunity",
          solucao: "Our solution",
          diferenciais: ["Unique", "Innovative"],
          mercado: "Growing market",
          financeiro: "Profitable",
          riscos: [{ id: "1", descricao: "Market risk", probabilidade: 30, impacto: 50 }],
          proximos12Meses: "Growth plans",
        },
      };

      expect(isPlanComplete(completePlan)).toBe(true);
    });
  });

  describe("getNextSection", () => {
    it("should return first section for empty plan", () => {
      const emptyPlan: BusinessPlanData = {};
      const nextSection = getNextSection(emptyPlan);

      expect(nextSection).toBe("Descrição da Empresa");
    });

    it("should return next incomplete section", () => {
      const plan: BusinessPlanData = {
        descricaoEmpresa: {
          nomeEmpresa: "Test",
          nomeFantasia: "Test",
          descricaoNegocio: "Test",
          missao: "Test",
          visao: "Test",
          valores: "Test",
          dataFundacao: "2024-01-01",
          cnpj: "12.345.678/0001-00",
        },
      };

      const nextSection = getNextSection(plan);

      expect(nextSection).toBe("Produtos e Serviços");
    });

    it("should return null for complete plan", () => {
      const completePlan: BusinessPlanData = {
        descricaoEmpresa: {
          nomeEmpresa: "Test",
          nomeFantasia: "Test",
          descricaoNegocio: "Test",
          missao: "Test",
          visao: "Test",
          valores: "Test",
          dataFundacao: "2024-01-01",
          cnpj: "12.345.678/0001-00",
        },
        produtosServicos: {
          produtos: [{ id: "1", nome: "Product", preco: 100 }],
          servicos: [{ id: "1", nome: "Service", preco: 50 }],
          garantia: "1 year",
          posVenda: "Support",
        },
        estruturaOrganizacional: {
          totalFuncionarios: 10,
          organograma: "CEO",
          cargos: [{ id: "1", cargo: "CEO", quantidade: 1 }],
          competenciasChave: ["Leadership"],
          planosCapacitacao: "Training",
        },
        planoMarketing: {
          publicoAlvo: "Businesses",
          segmentacao: ["SME"],
          posicionamento: "Premium",
          estrategiaPreco: "Value",
          estrategiaPromocao: "Digital",
          estrategiaDistribuicao: "Direct",
          comunicacao: "Multi",
          meiosComunicacao: ["Email"],
          orcamentoMarketing: 10000,
        },
        planoOperacional: {
          processosPrincipais: ["Production"],
          localizacao: "Downtown",
          infraestrutura: "Modern",
          equipamentos: [{ id: "1", nome: "Machine", quantidade: 5, custo: 50000 }],
          fornecedores: [{ id: "1", nome: "Supplier", produto: "Materials" }],
          materiaPrima: "Local",
          qualidade: "ISO",
          sustentabilidade: "Green",
        },
        estruturaCapitalizacao: {
          capitalSocial: 100000,
          investimentoInicial: 150000,
          fonteRecursos: [{ id: "1", fonte: "Owner", valor: 100000 }],
          emprestimos: [{ id: "1", instituicao: "Bank", valor: 50000, taxa: 5 }],
          investidores: [{ id: "1", nome: "Investor", aporte: 50000 }],
        },
        planoFinanceiro: {
          receitas: [{ id: "1", descricao: "Sales", mes1: 10000 }],
          custos: [{ id: "1", descricao: "COGS", mes1: 5000 }],
          despesas: [{ id: "1", descricao: "Rent", mes1: 2000 }],
          taxaDesconto: 10,
          taxaJuros: 5,
        },
        sumarioExecutivo: {
          resumoExecutivo: "Summary",
          oportunidade: "Opportunity",
          solucao: "Solution",
          diferenciais: ["Unique"],
          mercado: "Growing",
          financeiro: "Profitable",
          riscos: [{ id: "1", descricao: "Risk", probabilidade: 30, impacto: 50 }],
          proximos12Meses: "Growth",
        },
      };

      const nextSection = getNextSection(completePlan);

      expect(nextSection).toBeNull();
    });
  });
});
