import ExcelJS from 'exceljs';
const { Workbook } = ExcelJS;
import { PDFExportData } from './pdfExportHelper';

export async function generateExcelReport(data: PDFExportData): Promise<any> {
  const workbook = new Workbook();

  // Aba 1: Capa
  const coverSheet = workbook.addWorksheet('Capa');
  coverSheet.columns = [{ width: 50 }];
  coverSheet.getCell('A1').value = data.companyName;
  coverSheet.getCell('A1').font = { size: 24, bold: true };
  coverSheet.getCell('A3').value = `Plano de Negócios`;
  coverSheet.getCell('A3').font = { size: 16, bold: true };
  coverSheet.getCell('A5').value = `Autor: ${data.authorName}`;
  coverSheet.getCell('A6').value = `Data: ${new Date().toLocaleDateString('pt-BR')}`;

  // Aba 2: Resumo Executivo
  const summarySheet = workbook.addWorksheet('Resumo Executivo');
  summarySheet.columns = [{ width: 30 }, { width: 20 }];
  
  let row = 1;
  summarySheet.getCell(`A${row}`).value = 'Resumo Executivo';
  summarySheet.getCell(`A${row}`).font = { size: 14, bold: true };
  
  row += 2;
  summarySheet.getCell(`A${row}`).value = 'Empresa';
  summarySheet.getCell(`B${row}`).value = data.companyName;
  
  row++;
  summarySheet.getCell(`A${row}`).value = 'Descrição';
  summarySheet.getCell(`B${row}`).value = data.sections?.descricao?.companyDescription || 'N/A';
  
  row++;
  summarySheet.getCell(`A${row}`).value = 'Setor';
  summarySheet.getCell(`B${row}`).value = data.sections?.descricao?.sector || 'N/A';

  // Aba 3: Análise SWOT
  if (data.swot) {
    const swotSheet = workbook.addWorksheet('SWOT');
    swotSheet.columns = [{ width: 25 }, { width: 40 }];
    
    let swotRow = 1;
    swotSheet.getCell(`A${swotRow}`).value = 'Análise SWOT';
    swotSheet.getCell(`A${swotRow}`).font = { size: 14, bold: true };
    
    swotRow += 2;
    
    // Forças
    swotSheet.getCell(`A${swotRow}`).value = 'FORÇAS';
    swotSheet.getCell(`A${swotRow}`).font = { bold: true, color: { argb: 'FF10B981' } };
    swotRow++;
    (data.swot.strengths || []).forEach((item: string) => {
      swotSheet.getCell(`A${swotRow}`).value = `• ${item}`;
      swotRow++;
    });
    
    swotRow++;
    
    // Fraquezas
    swotSheet.getCell(`A${swotRow}`).value = 'FRAQUEZAS';
    swotSheet.getCell(`A${swotRow}`).font = { bold: true, color: { argb: 'FFEF4444' } };
    swotRow++;
    (data.swot.weaknesses || []).forEach((item: string) => {
      swotSheet.getCell(`A${swotRow}`).value = `• ${item}`;
      swotRow++;
    });
    
    swotRow++;
    
    // Oportunidades
    swotSheet.getCell(`A${swotRow}`).value = 'OPORTUNIDADES';
    swotSheet.getCell(`A${swotRow}`).font = { bold: true, color: { argb: 'FFF59E0B' } };
    swotRow++;
    (data.swot.opportunities || []).forEach((item: string) => {
      swotSheet.getCell(`A${swotRow}`).value = `• ${item}`;
      swotRow++;
    });
    
    swotRow++;
    
    // Ameaças
    swotSheet.getCell(`A${swotRow}`).value = 'AMEAÇAS';
    swotSheet.getCell(`A${swotRow}`).font = { bold: true, color: { argb: 'FF8B5CF6' } };
    swotRow++;
    (data.swot.threats || []).forEach((item: string) => {
      swotSheet.getCell(`A${swotRow}`).value = `• ${item}`;
      swotRow++;
    });
  }

  // Aba 4: Análise Financeira
  if (data.financialAnalysis) {
    const finSheet = workbook.addWorksheet('Análise Financeira');
    finSheet.columns = [{ width: 25 }, { width: 20 }];
    
    let finRow = 1;
    finSheet.getCell(`A${finRow}`).value = 'Indicadores Financeiros';
    finSheet.getCell(`A${finRow}`).font = { size: 14, bold: true };
    
    finRow += 2;
    
    // VPL
    finSheet.getCell(`A${finRow}`).value = 'VPL (Valor Presente Líquido)';
    finSheet.getCell(`B${finRow}`).value = data.financialAnalysis.vpl || 0;
    finSheet.getCell(`B${finRow}`).numFmt = '"R$"#,##0.00';
    finRow++;
    
    // TIR
    finSheet.getCell(`A${finRow}`).value = 'TIR (Taxa Interna de Retorno)';
    finSheet.getCell(`B${finRow}`).value = (data.financialAnalysis.tir || 0) * 100;
    finSheet.getCell(`B${finRow}`).numFmt = '0.00"%"';
    finRow++;
    
    // Payback
    finSheet.getCell(`A${finRow}`).value = 'Payback (anos)';
    finSheet.getCell(`B${finRow}`).value = data.financialAnalysis.payback || 0;
    finSheet.getCell(`B${finRow}`).numFmt = '0.00';
    finRow += 2;
    
    // DRE
    finSheet.getCell(`A${finRow}`).value = 'Demonstração de Resultado (DRE)';
    finSheet.getCell(`A${finRow}`).font = { size: 12, bold: true };
    finRow++;
    
    finSheet.getCell(`A${finRow}`).value = 'Receita Total';
    finSheet.getCell(`B${finRow}`).value = data.financialAnalysis.dre?.receita || 0;
    finSheet.getCell(`B${finRow}`).numFmt = '"R$"#,##0.00';
    finRow++;
    
    finSheet.getCell(`A${finRow}`).value = 'Custos Totais';
    finSheet.getCell(`B${finRow}`).value = data.financialAnalysis.dre?.custos || 0;
    finSheet.getCell(`B${finRow}`).numFmt = '"R$"#,##0.00';
    finRow++;
    
    finSheet.getCell(`A${finRow}`).value = 'Lucro Líquido';
    finSheet.getCell(`B${finRow}`).value = data.financialAnalysis.dre?.lucro || 0;
    finSheet.getCell(`B${finRow}`).numFmt = '"R$"#,##0.00';
    finRow += 2;
    
    // Indicadores
    finSheet.getCell(`A${finRow}`).value = 'Indicadores de Desempenho';
    finSheet.getCell(`A${finRow}`).font = { size: 12, bold: true };
    finRow++;
    
    if (data.financialAnalysis.indicadores) {
      finSheet.getCell(`A${finRow}`).value = 'Liquidez Corrente';
      finSheet.getCell(`B${finRow}`).value = data.financialAnalysis.indicadores.liquidezCorrente;
      finSheet.getCell(`B${finRow}`).numFmt = '0.00';
      finRow++;
      
      finSheet.getCell(`A${finRow}`).value = 'Endividamento';
      finSheet.getCell(`B${finRow}`).value = (data.financialAnalysis.indicadores.endividamento || 0) * 100;
      finSheet.getCell(`B${finRow}`).numFmt = '0.00"%"';
      finRow++;
      
      finSheet.getCell(`A${finRow}`).value = 'Margem de Lucro';
      finSheet.getCell(`B${finRow}`).value = (data.financialAnalysis.indicadores.margemLucro || 0) * 100;
      finSheet.getCell(`B${finRow}`).numFmt = '0.00"%"';
      finRow++;
      
      finSheet.getCell(`A${finRow}`).value = 'ROE (Retorno sobre Patrimônio)';
      finSheet.getCell(`B${finRow}`).value = (data.financialAnalysis.indicadores.roe || 0) * 100;
      finSheet.getCell(`B${finRow}`).numFmt = '0.00"%"';
      finRow++;
      
      finSheet.getCell(`A${finRow}`).value = 'ROA (Retorno sobre Ativos)';
      finSheet.getCell(`B${finRow}`).value = (data.financialAnalysis.indicadores.roa || 0) * 100;
      finSheet.getCell(`B${finRow}`).numFmt = '0.00"%"';
    }
  }

  // Aba 5: Fluxo de Caixa
  if (data.financialAnalysis?.fluxoCaixa && (data.financialAnalysis.fluxoCaixa as any[]).length > 0) {
    const cashSheet = workbook.addWorksheet('Fluxo de Caixa');
    cashSheet.columns = [{ width: 15 }, { width: 20 }];
    
    let cashRow = 1;
    cashSheet.getCell(`A${cashRow}`).value = 'Mês';
    cashSheet.getCell(`B${cashRow}`).value = 'Valor';
    cashSheet.getCell(`A${cashRow}`).font = { bold: true };
    cashSheet.getCell(`B${cashRow}`).font = { bold: true };
    
    cashRow++;
    (data.financialAnalysis?.fluxoCaixa || []).forEach((item: any) => {
      cashSheet.getCell(`A${cashRow}`).value = `Mês ${item.mes}`;
      cashSheet.getCell(`B${cashRow}`).value = item.valor;
      cashSheet.getCell(`B${cashRow}`).numFmt = '"R$"#,##0.00';
      cashRow++;
    });
  }

  // Aba 6: Canvas
  if (data.canvas) {
    const canvasSheet = workbook.addWorksheet('Business Model Canvas');
    canvasSheet.columns = [{ width: 30 }, { width: 50 }];
    
    let canvasRow = 1;
    canvasSheet.getCell(`A${canvasRow}`).value = 'Business Model Canvas';
    canvasSheet.getCell(`A${canvasRow}`).font = { size: 14, bold: true };
    
    canvasRow += 2;
    
    const canvasBlocks = [
      { name: 'Parceiros Chave', key: 'keyPartners' },
      { name: 'Atividades Chave', key: 'keyActivities' },
      { name: 'Recursos Chave', key: 'keyResources' },
      { name: 'Proposição de Valor', key: 'valueProposition' },
      { name: 'Segmentos de Clientes', key: 'customerSegments' },
      { name: 'Canais', key: 'channels' },
      { name: 'Relacionamento com Clientes', key: 'customerRelationship' },
      { name: 'Fontes de Receita', key: 'revenueStreams' },
      { name: 'Estrutura de Custos', key: 'costStructure' },
    ];
    
    canvasBlocks.forEach((block) => {
      canvasSheet.getCell(`A${canvasRow}`).value = block.name;
      canvasSheet.getCell(`A${canvasRow}`).font = { bold: true };
      canvasSheet.getCell(`B${canvasRow}`).value = (data.canvas as any)[block.key] || 'N/A';
      canvasRow++;
    });
  }

  // Converter para buffer
  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
}

export function generateExcelFileName(companyName: string): string {
  const sanitized = companyName
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '');
  
  const date = new Date().toISOString().split('T')[0];
  return `${sanitized}_relatorio_${date}.xlsx`;
}
