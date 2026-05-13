import { z } from "zod";

/**
 * Schemas Zod para as 8 seções do Plano de Negócios (SPPLAN)
 */

// Seção 1: Descrição da Empresa
export const descricaoEmpresaSchema = z.object({
  nomeEmpresa: z.string().optional(),
  nomeFantasia: z.string().optional(),
  descricaoNegocio: z.string().optional(),
  missao: z.string().optional(),
  visao: z.string().optional(),
  valores: z.string().optional(),
  dataFundacao: z.string().optional(),
  cnpj: z.string().optional(),
  endereco: z.string().optional(),
  telefone: z.string().optional(),
  email: z.string().optional(),
  website: z.string().optional(),
  setor: z.string().optional(),
  segmento: z.string().optional(),
});

// Seção 2: Produtos e Serviços
export const produtosServicosSchema = z.object({
  produtos: z.array(
    z.object({
      id: z.string(),
      nome: z.string(),
      descricao: z.string().optional(),
      preco: z.number().optional(),
      margem: z.number().optional(),
      cicloVida: z.string().optional(),
      diferencial: z.string().optional(),
    })
  ).optional(),
  servicos: z.array(
    z.object({
      id: z.string(),
      nome: z.string(),
      descricao: z.string().optional(),
      preco: z.number().optional(),
      margem: z.number().optional(),
      cicloVida: z.string().optional(),
      diferencial: z.string().optional(),
    })
  ).optional(),
  garantia: z.string().optional(),
  posVenda: z.string().optional(),
});

// Seção 3: Estrutura Organizacional
export const estruturaOrganizacionalSchema = z.object({
  totalFuncionarios: z.number().optional(),
  organograma: z.string().optional(),
  cargos: z.array(
    z.object({
      id: z.string(),
      cargo: z.string(),
      quantidade: z.number(),
      salario: z.number().optional(),
      responsabilidades: z.string().optional(),
    })
  ).optional(),
  competenciasChave: z.array(z.string()).optional(),
  planosCapacitacao: z.string().optional(),
});

// Seção 4: Plano de Marketing
export const planoMarketingSchema = z.object({
  publicoAlvo: z.string().optional(),
  segmentacao: z.array(z.string()).optional(),
  posicionamento: z.string().optional(),
  estrategiaPreco: z.string().optional(),
  estrategiaPromocao: z.string().optional(),
  estrategiaDistribuicao: z.string().optional(),
  comunicacao: z.string().optional(),
  meiosComunicacao: z.array(z.string()).optional(),
  orcamentoMarketing: z.number().optional(),
  metasVendas: z.array(
    z.object({
      periodo: z.string(),
      meta: z.number(),
      estrategia: z.string().optional(),
    })
  ).optional(),
});

// Seção 5: Plano Operacional
export const planoOperacionalSchema = z.object({
  processosPrincipais: z.array(z.string()).optional(),
  localizacao: z.string().optional(),
  infraestrutura: z.string().optional(),
  equipamentos: z.array(
    z.object({
      id: z.string(),
      nome: z.string(),
      quantidade: z.number(),
      custo: z.number().optional(),
    })
  ).optional(),
  fornecedores: z.array(
    z.object({
      id: z.string(),
      nome: z.string(),
      produto: z.string(),
      prazo: z.string().optional(),
      condicoes: z.string().optional(),
    })
  ).optional(),
  materiaPrima: z.string().optional(),
  qualidade: z.string().optional(),
  sustentabilidade: z.string().optional(),
});

// Seção 6: Estrutura de Capitalização
export const estruturaCapitalizacaoSchema = z.object({
  capitalSocial: z.number().optional(),
  investimentoInicial: z.number().optional(),
  fonteRecursos: z.array(
    z.object({
      id: z.string(),
      fonte: z.string(),
      valor: z.number(),
      condicoes: z.string().optional(),
    })
  ).optional(),
  emprestimos: z.array(
    z.object({
      id: z.string(),
      instituicao: z.string(),
      valor: z.number(),
      taxa: z.number().optional(),
      prazo: z.number().optional(),
    })
  ).optional(),
  investidores: z.array(
    z.object({
      id: z.string(),
      nome: z.string(),
      aporte: z.number(),
      participacao: z.number().optional(),
    })
  ).optional(),
});

// Seção 7: Plano Financeiro
export const planoFinanceiroSchema = z.object({
  receitas: z.array(
    z.object({
      id: z.string(),
      descricao: z.string(),
      mes1: z.number().optional(),
      mes2: z.number().optional(),
      mes3: z.number().optional(),
      mes4: z.number().optional(),
      mes5: z.number().optional(),
      mes6: z.number().optional(),
      mes7: z.number().optional(),
      mes8: z.number().optional(),
      mes9: z.number().optional(),
      mes10: z.number().optional(),
      mes11: z.number().optional(),
      mes12: z.number().optional(),
    })
  ).optional(),
  custos: z.array(
    z.object({
      id: z.string(),
      descricao: z.string(),
      mes1: z.number().optional(),
      mes2: z.number().optional(),
      mes3: z.number().optional(),
      mes4: z.number().optional(),
      mes5: z.number().optional(),
      mes6: z.number().optional(),
      mes7: z.number().optional(),
      mes8: z.number().optional(),
      mes9: z.number().optional(),
      mes10: z.number().optional(),
      mes11: z.number().optional(),
      mes12: z.number().optional(),
    })
  ).optional(),
  despesas: z.array(
    z.object({
      id: z.string(),
      descricao: z.string(),
      mes1: z.number().optional(),
      mes2: z.number().optional(),
      mes3: z.number().optional(),
      mes4: z.number().optional(),
      mes5: z.number().optional(),
      mes6: z.number().optional(),
      mes7: z.number().optional(),
      mes8: z.number().optional(),
      mes9: z.number().optional(),
      mes10: z.number().optional(),
      mes11: z.number().optional(),
      mes12: z.number().optional(),
    })
  ).optional(),
  taxaDesconto: z.number().optional(),
  taxaJuros: z.number().optional(),
});

// Seção 8: Sumário Executivo
export const sumarioExecutivoSchema = z.object({
  resumoExecutivo: z.string().optional(),
  oportunidade: z.string().optional(),
  solucao: z.string().optional(),
  diferenciais: z.array(z.string()).optional(),
  mercado: z.string().optional(),
  financeiro: z.string().optional(),
  riscos: z.array(
    z.object({
      id: z.string(),
      descricao: z.string(),
      probabilidade: z.number().optional(),
      impacto: z.number().optional(),
      mitigacao: z.string().optional(),
    })
  ).optional(),
  proximos12Meses: z.string().optional(),
});

// Schema completo do Plano de Negócios
export const businessPlanDataSchema = z.object({
  descricaoEmpresa: descricaoEmpresaSchema.optional(),
  produtosServicos: produtosServicosSchema.optional(),
  estruturaOrganizacional: estruturaOrganizacionalSchema.optional(),
  planoMarketing: planoMarketingSchema.optional(),
  planoOperacional: planoOperacionalSchema.optional(),
  estruturaCapitalizacao: estruturaCapitalizacaoSchema.optional(),
  planoFinanceiro: planoFinanceiroSchema.optional(),
  sumarioExecutivo: sumarioExecutivoSchema.optional(),
});

export type BusinessPlanData = z.infer<typeof businessPlanDataSchema>;
export type DescricaoEmpresa = z.infer<typeof descricaoEmpresaSchema>;
export type ProdutosServicos = z.infer<typeof produtosServicosSchema>;
export type EstruturOrganizacional = z.infer<typeof estruturaOrganizacionalSchema>;
export type PlanoMarketing = z.infer<typeof planoMarketingSchema>;
export type PlanoOperacional = z.infer<typeof planoOperacionalSchema>;
export type EstruturaCapitalizacao = z.infer<typeof estruturaCapitalizacaoSchema>;
export type PlanoFinanceiro = z.infer<typeof planoFinanceiroSchema>;
export type SumarioExecutivo = z.infer<typeof sumarioExecutivoSchema>;
