/**
 * Helper para ferramentas estratégicas do PeA-Plan
 * Inclui: SWOT, Business Model Canvas, Análise de Risco
 */

export interface SWOTItem {
  id: string;
  descricao: string;
  peso?: number; // 1-5
  impacto?: string;
}

export interface SWOT {
  forcas: SWOTItem[];
  fraquezas: SWOTItem[];
  oportunidades: SWOTItem[];
  ameacas: SWOTItem[];
  dataAtualizacao?: Date;
}

export interface CanvasBloco {
  id: string;
  titulo: string;
  descricao: string;
  items: string[];
}

export interface BusinessModelCanvas {
  parceirosChave: CanvasBloco;
  atividadesChave: CanvasBloco;
  recursosChave: CanvasBloco;
  propuestaValor: CanvasBloco;
  relacionamentoClientes: CanvasBloco;
  canaisDistribuicao: CanvasBloco;
  segmentosClientes: CanvasBloco;
  estruturaCustos: CanvasBloco;
  fontesReceita: CanvasBloco;
  dataAtualizacao?: Date;
}

export interface RiscoItem {
  id: string;
  descricao: string;
  probabilidade: number; // 1-5
  impacto: number; // 1-5
  mitigacao: string;
  responsavel?: string;
  status?: "aberto" | "em_progresso" | "mitigado" | "fechado";
}

export interface AnaliseRisco {
  riscos: RiscoItem[];
  riscosAltos: RiscoItem[];
  riscosModeratos: RiscoItem[];
  riscosBaixos: RiscoItem[];
  dataAtualizacao?: Date;
}

/**
 * Calcula a matriz SWOT com análise de relações
 */
export function analisarSWOT(swot: SWOT): {
  forcasOportunidades: string[];
  forcasAmeacas: string[];
  fraquezasOportunidades: string[];
  fraquezasAmeacas: string[];
} {
  return {
    forcasOportunidades: gerarEstrategias(
      swot.forcas,
      swot.oportunidades,
      "Estratégia Agressiva"
    ),
    forcasAmeacas: gerarEstrategias(swot.forcas, swot.ameacas, "Estratégia Defensiva"),
    fraquezasOportunidades: gerarEstrategias(
      swot.fraquezas,
      swot.oportunidades,
      "Estratégia de Reorientação"
    ),
    fraquezasAmeacas: gerarEstrategias(
      swot.fraquezas,
      swot.ameacas,
      "Estratégia Sobrevivência"
    ),
  };
}

function gerarEstrategias(grupo1: SWOTItem[], grupo2: SWOTItem[], tipo: string): string[] {
  const estrategias: string[] = [];

  if (grupo1.length === 0 || grupo2.length === 0) {
    return estrategias;
  }

  // Combina os dois grupos com maior peso
  const items = [...grupo1, ...grupo2]
    .sort((a, b) => (b.peso || 0) - (a.peso || 0))
    .slice(0, 3);

  items.forEach((item) => {
    estrategias.push(`${tipo}: ${item.descricao}`);
  });

  return estrategias;
}

/**
 * Valida o Business Model Canvas
 */
export function validarCanvas(canvas: BusinessModelCanvas): {
  valido: boolean;
  erros: string[];
  avisos: string[];
} {
  const erros: string[] = [];
  const avisos: string[] = [];

  // Verifica blocos obrigatórios
  const blocos = [
    { nome: "Parceiros Chave", bloco: canvas.parceirosChave },
    { nome: "Atividades Chave", bloco: canvas.atividadesChave },
    { nome: "Recursos Chave", bloco: canvas.recursosChave },
    { nome: "Proposta de Valor", bloco: canvas.propuestaValor },
    { nome: "Relacionamento com Clientes", bloco: canvas.relacionamentoClientes },
    { nome: "Canais de Distribuição", bloco: canvas.canaisDistribuicao },
    { nome: "Segmentos de Clientes", bloco: canvas.segmentosClientes },
    { nome: "Estrutura de Custos", bloco: canvas.estruturaCustos },
    { nome: "Fontes de Receita", bloco: canvas.fontesReceita },
  ];

  blocos.forEach(({ nome, bloco }) => {
    if (!bloco || bloco.items.length === 0) {
      erros.push(`${nome} não foi preenchido`);
    } else if (bloco.items.length < 2) {
      avisos.push(`${nome} tem poucos itens (recomenda-se pelo menos 2)`);
    }
  });

  return {
    valido: erros.length === 0,
    erros,
    avisos,
  };
}

/**
 * Calcula o nível de risco (matriz de risco)
 */
export function calcularNivelRisco(probabilidade: number, impacto: number): {
  nivel: "baixo" | "moderado" | "alto";
  score: number;
} {
  const score = probabilidade * impacto;

  if (score <= 4) {
    return { nivel: "baixo", score };
  } else if (score <= 12) {
    return { nivel: "moderado", score };
  } else {
    return { nivel: "alto", score };
  }
}

/**
 * Analisa e classifica os riscos
 */
export function analisarRiscos(riscos: RiscoItem[]): AnaliseRisco {
  const riscosAltos: RiscoItem[] = [];
  const riscosModeratos: RiscoItem[] = [];
  const riscosBaixos: RiscoItem[] = [];

  riscos.forEach((risco) => {
    const { nivel } = calcularNivelRisco(risco.probabilidade, risco.impacto);

    if (nivel === "alto") {
      riscosAltos.push(risco);
    } else if (nivel === "moderado") {
      riscosModeratos.push(risco);
    } else {
      riscosBaixos.push(risco);
    }
  });

  // Ordena por score decrescente
  const ordenar = (a: RiscoItem, b: RiscoItem) =>
    b.probabilidade * b.impacto - a.probabilidade * a.impacto;

  return {
    riscos,
    riscosAltos: riscosAltos.sort(ordenar),
    riscosModeratos: riscosModeratos.sort(ordenar),
    riscosBaixos: riscosBaixos.sort(ordenar),
    dataAtualizacao: new Date(),
  };
}

/**
 * Gera recomendações baseadas na análise SWOT
 */
export function gerarRecomendacoes(swot: SWOT): string[] {
  const recomendacoes: string[] = [];

  // Recomendações baseadas em forças
  if (swot.forcas.length > 0) {
    const forcasPrincipais = swot.forcas
      .sort((a, b) => (b.peso || 0) - (a.peso || 0))
      .slice(0, 2)
      .map((f) => f.descricao)
      .join(", ");
    recomendacoes.push(`Potencialize suas forças principais: ${forcasPrincipais}`);
  }

  // Recomendações baseadas em fraquezas
  if (swot.fraquezas.length > 0) {
    const fraquezasPrincipais = swot.fraquezas
      .sort((a, b) => (b.peso || 0) - (a.peso || 0))
      .slice(0, 2)
      .map((f) => f.descricao)
      .join(", ");
    recomendacoes.push(`Trabalhe para reduzir: ${fraquezasPrincipais}`);
  }

  // Recomendações baseadas em oportunidades
  if (swot.oportunidades.length > 0) {
    const oportunidadesPrincipais = swot.oportunidades
      .sort((a, b) => (b.peso || 0) - (a.peso || 0))
      .slice(0, 2)
      .map((o) => o.descricao)
      .join(", ");
    recomendacoes.push(`Explore essas oportunidades: ${oportunidadesPrincipais}`);
  }

  // Recomendações baseadas em ameaças
  if (swot.ameacas.length > 0) {
    const ameacasPrincipais = swot.ameacas
      .sort((a, b) => (b.peso || 0) - (a.peso || 0))
      .slice(0, 2)
      .map((a) => a.descricao)
      .join(", ");
    recomendacoes.push(`Monitore essas ameaças: ${ameacasPrincipais}`);
  }

  return recomendacoes;
}

/**
 * Calcula a saúde geral da estratégia (0-100)
 */
export function calcularSaudeEstrategia(
  swot: SWOT,
  canvas: BusinessModelCanvas,
  riscos: RiscoItem[]
): number {
  let score = 50; // Score base

  // Adiciona pontos por itens SWOT
  score += Math.min(swot.forcas.length * 2, 15);
  score -= Math.min(swot.fraquezas.length * 1, 10);
  score += Math.min(swot.oportunidades.length * 2, 15);
  score -= Math.min(swot.ameacas.length * 1, 10);

  // Valida canvas
  const validacao = validarCanvas(canvas);
  if (validacao.valido) {
    score += 10;
  } else {
    score -= validacao.erros.length * 5;
  }

  // Analisa riscos
  const analise = analisarRiscos(riscos);
  if (analise.riscosAltos.length === 0) {
    score += 10;
  } else {
    score -= analise.riscosAltos.length * 5;
  }

  return Math.max(0, Math.min(100, score));
}
