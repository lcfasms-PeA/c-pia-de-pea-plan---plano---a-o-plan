/**
 * Helper para cálculos financeiros do PeA-Plan
 * Inclui: VPL, TIR, Payback, DRE, Balanço Patrimonial
 */

export interface FluxoCaixa {
  mes: number;
  receitas: number;
  custos: number;
  despesas: number;
  fluxoLiquido: number;
}

export interface AnaliseFinanceira {
  vpl: number;
  tir: number;
  payback: number;
  fluxoCaixa: FluxoCaixa[];
  dre: DRE;
  balanco: BalancoPatrimonial;
}

export interface DRE {
  receitas: number;
  custos: number;
  lucroGruto: number;
  despesas: number;
  lucroOperacional: number;
  juros: number;
  lucroAntes: number;
  impostos: number;
  lucroLiquido: number;
}

export interface BalancoPatrimonial {
  ativo: {
    circulante: number;
    naoCirculante: number;
    total: number;
  };
  passivo: {
    circulante: number;
    naoCirculante: number;
    total: number;
  };
  patrimonio: {
    capitalSocial: number;
    lucrosAcumulados: number;
    total: number;
  };
}

/**
 * Calcula o Valor Presente Líquido (VPL)
 * VPL = Σ(FC_t / (1 + i)^t) - Investimento Inicial
 */
export function calcularVPL(
  fluxosCaixa: number[],
  investimentoInicial: number,
  taxaDesconto: number
): number {
  if (fluxosCaixa.length === 0) return -investimentoInicial;

  let vpl = -investimentoInicial;
  for (let t = 0; t < fluxosCaixa.length; t++) {
    vpl += fluxosCaixa[t] / Math.pow(1 + taxaDesconto, t + 1);
  }

  return Math.round(vpl * 100) / 100;
}

/**
 * Calcula a Taxa Interna de Retorno (TIR) usando Newton-Raphson
 */
export function calcularTIR(fluxosCaixa: number[], investimentoInicial: number): number {
  const fluxos = [-investimentoInicial, ...fluxosCaixa];

  // Função VPL
  const vpn = (taxa: number) => {
    let sum = 0;
    for (let i = 0; i < fluxos.length; i++) {
      sum += fluxos[i] / Math.pow(1 + taxa, i);
    }
    return sum;
  };

  // Derivada do VPL
  const vpnDerivada = (taxa: number) => {
    let sum = 0;
    for (let i = 1; i < fluxos.length; i++) {
      sum -= (i * fluxos[i]) / Math.pow(1 + taxa, i + 1);
    }
    return sum;
  };

  // Newton-Raphson
  let taxa = 0.1; // Estimativa inicial
  for (let i = 0; i < 100; i++) {
    const vpnValue = vpn(taxa);
    const vpnDeriv = vpnDerivada(taxa);

    if (Math.abs(vpnValue) < 0.0001) break;
    if (vpnDeriv === 0) break;

    taxa = taxa - vpnValue / vpnDeriv;
  }

  return Math.round(taxa * 10000) / 100; // Retorna em percentual
}

/**
 * Calcula o Payback (período de retorno do investimento)
 */
export function calcularPayback(
  fluxosCaixa: number[],
  investimentoInicial: number
): number {
  let saldoAcumulado = -investimentoInicial;
  let payback = 0;

  for (let i = 0; i < fluxosCaixa.length; i++) {
    saldoAcumulado += fluxosCaixa[i];

    if (saldoAcumulado >= 0) {
      // Interpolação linear para encontrar o payback exato
      const fluxoAnterior = i > 0 ? fluxosCaixa[i - 1] : 0;
      const saldoAnterior = saldoAcumulado - fluxosCaixa[i];
      const fracaoMes = Math.abs(saldoAnterior) / fluxosCaixa[i];

      payback = i + fracaoMes;
      break;
    }
  }

  // Se não recuperou o investimento
  if (saldoAcumulado < 0) {
    payback = -1; // Indicador de não recuperação
  }

  return Math.round(payback * 100) / 100;
}

/**
 * Calcula o fluxo de caixa mensal
 */
export function calcularFluxoCaixa(
  receitas: number[],
  custos: number[],
  despesas: number[]
): FluxoCaixa[] {
  const meses = Math.max(receitas.length, custos.length, despesas.length);
  const fluxo: FluxoCaixa[] = [];

  for (let mes = 0; mes < meses; mes++) {
    const receita = receitas[mes] || 0;
    const custo = custos[mes] || 0;
    const despesa = despesas[mes] || 0;
    const fluxoLiquido = receita - custo - despesa;

    fluxo.push({
      mes: mes + 1,
      receitas: receita,
      custos: custo,
      despesas: despesa,
      fluxoLiquido,
    });
  }

  return fluxo;
}

/**
 * Calcula a Demonstração de Resultado do Exercício (DRE)
 */
export function calcularDRE(
  receitas: number,
  custos: number,
  despesas: number,
  juros: number,
  aliquotaImposto: number = 0.15
): DRE {
  const lucroGruto = receitas - custos;
  const lucroOperacional = lucroGruto - despesas;
  const lucroAntes = lucroOperacional - juros;
  const impostos = Math.max(0, lucroAntes * aliquotaImposto);
  const lucroLiquido = lucroAntes - impostos;

  return {
    receitas,
    custos,
    lucroGruto,
    despesas,
    lucroOperacional,
    juros,
    lucroAntes,
    impostos,
    lucroLiquido,
  };
}

/**
 * Calcula o Balanço Patrimonial
 */
export function calcularBalanco(
  ativoCirculante: number,
  ativoNaoCirculante: number,
  passivoCirculante: number,
  passivoNaoCirculante: number,
  capitalSocial: number,
  lucrosAcumulados: number
): BalancoPatrimonial {
  const ativoTotal = ativoCirculante + ativoNaoCirculante;
  const passivoTotal = passivoCirculante + passivoNaoCirculante;
  const patrimonioTotal = capitalSocial + lucrosAcumulados;

  return {
    ativo: {
      circulante: ativoCirculante,
      naoCirculante: ativoNaoCirculante,
      total: ativoTotal,
    },
    passivo: {
      circulante: passivoCirculante,
      naoCirculante: passivoNaoCirculante,
      total: passivoTotal,
    },
    patrimonio: {
      capitalSocial,
      lucrosAcumulados,
      total: patrimonioTotal,
    },
  };
}

/**
 * Calcula indicadores financeiros
 */
export interface IndicadoresFinanceiros {
  liquidezCorrente: number;
  liquidezSeca: number;
  endividamento: number;
  margemLiquida: number;
  roe: number; // Return on Equity
  roa: number; // Return on Assets
}

export function calcularIndicadores(
  dre: DRE,
  balanco: BalancoPatrimonial
): IndicadoresFinanceiros {
  const ativoTotal = balanco.ativo.total;
  const ativoCirculante = balanco.ativo.circulante;
  const passivoCirculante = balanco.passivo.circulante;
  const passivoTotal = balanco.passivo.total;
  const patrimonio = balanco.patrimonio.total;
  const lucroLiquido = dre.lucroLiquido;
  const receitas = dre.receitas;

  const liquidezCorrente = passivoCirculante > 0 ? ativoCirculante / passivoCirculante : 0;
  const liquidezSeca = passivoCirculante > 0 ? (ativoCirculante - 0) / passivoCirculante : 0; // Sem estoque
  const endividamento = ativoTotal > 0 ? passivoTotal / ativoTotal : 0;
  const margemLiquida = receitas > 0 ? lucroLiquido / receitas : 0;
  const roe = patrimonio > 0 ? lucroLiquido / patrimonio : 0;
  const roa = ativoTotal > 0 ? lucroLiquido / ativoTotal : 0;

  return {
    liquidezCorrente: Math.round(liquidezCorrente * 100) / 100,
    liquidezSeca: Math.round(liquidezSeca * 100) / 100,
    endividamento: Math.round(endividamento * 100) / 100,
    margemLiquida: Math.round(margemLiquida * 10000) / 100, // Em percentual
    roe: Math.round(roe * 10000) / 100, // Em percentual
    roa: Math.round(roa * 10000) / 100, // Em percentual
  };
}

/**
 * Análise financeira completa
 */
export function analisarFinanceiro(
  receitas: number[],
  custos: number[],
  despesas: number[],
  investimentoInicial: number,
  taxaDesconto: number,
  juros: number,
  ativoCirculante: number,
  ativoNaoCirculante: number,
  passivoCirculante: number,
  passivoNaoCirculante: number,
  capitalSocial: number
): AnaliseFinanceira {
  // Fluxo de caixa
  const fluxoCaixa = calcularFluxoCaixa(receitas, custos, despesas);
  const fluxosLiquidos = fluxoCaixa.map((f) => f.fluxoLiquido);

  // Métricas principais
  const vpl = calcularVPL(fluxosLiquidos, investimentoInicial, taxaDesconto);
  const tir = calcularTIR(fluxosLiquidos, investimentoInicial);
  const payback = calcularPayback(fluxosLiquidos, investimentoInicial);

  // DRE
  const totalReceitas = receitas.reduce((a, b) => a + b, 0);
  const totalCustos = custos.reduce((a, b) => a + b, 0);
  const totalDespesas = despesas.reduce((a, b) => a + b, 0);
  const dre = calcularDRE(totalReceitas, totalCustos, totalDespesas, juros * 12);

  // Balanço
  const lucrosAcumulados = dre.lucroLiquido;
  const balanco = calcularBalanco(
    ativoCirculante,
    ativoNaoCirculante,
    passivoCirculante,
    passivoNaoCirculante,
    capitalSocial,
    lucrosAcumulados
  );

  return {
    vpl,
    tir,
    payback,
    fluxoCaixa,
    dre,
    balanco,
  };
}
