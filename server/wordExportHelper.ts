import { Document, Packer, Paragraph, Table, TableRow, TableCell, WidthType, PageBreak, TextRun, HeadingLevel, AlignmentType } from 'docx';
import { PDFExportData } from './pdfExportHelper';

export async function generateWordReport(data: PDFExportData): Promise<Buffer> {
  const sections: any[] = [];

  // Capa
  sections.push(
    new Paragraph({
      text: data.companyName,
      heading: HeadingLevel.HEADING_1,
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 },
    }),
    new Paragraph({
      text: 'Plano de Negócios',
      heading: HeadingLevel.HEADING_2,
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
    }),
    new Paragraph({
      text: `Autor: ${data.authorName}`,
      alignment: AlignmentType.CENTER,
      spacing: { after: 100 },
    }),
    new Paragraph({
      text: `Data: ${new Date().toLocaleDateString('pt-BR')}`,
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 },
    }),
    new PageBreak()
  );

  // Resumo Executivo
  sections.push(
    new Paragraph({
      text: 'Resumo Executivo',
      heading: HeadingLevel.HEADING_1,
      spacing: { after: 200 },
    }),
    new Paragraph({
      text: `Empresa: ${data.companyName}`,
      spacing: { after: 100 },
    }),
    new Paragraph({
      text: `Descrição: ${data.sections?.descricao?.companyDescription || 'N/A'}`,
      spacing: { after: 100 },
    }),
    new Paragraph({
      text: `Setor: ${data.sections?.descricao?.sector || 'N/A'}`,
      spacing: { after: 400 },
    }),
    new PageBreak()
  );

  // SWOT
  if (data.swot) {
    sections.push(
      new Paragraph({
        text: 'Análise SWOT',
        heading: HeadingLevel.HEADING_1,
        spacing: { after: 200 },
      }),
      new Paragraph({
        text: 'Forças:',
        run: { bold: true },
        spacing: { after: 100 },
      }),
      ...((data.swot.strengths || []) as string[]).map((item) =>
        new Paragraph({
          text: `• ${item}`,
          spacing: { after: 50 },
        })
      ),
      new Paragraph({
        text: 'Fraquezas:',
        run: { bold: true },
        spacing: { before: 200, after: 100 },
      }),
      ...((data.swot.weaknesses || []) as string[]).map((item) =>
        new Paragraph({
          text: `• ${item}`,
          spacing: { after: 50 },
        })
      ),
      new Paragraph({
        text: 'Oportunidades:',
        run: { bold: true },
        spacing: { before: 200, after: 100 },
      }),
      ...((data.swot.opportunities || []) as string[]).map((item) =>
        new Paragraph({
          text: `• ${item}`,
          spacing: { after: 50 },
        })
      ),
      new Paragraph({
        text: 'Ameaças:',
        run: { bold: true },
        spacing: { before: 200, after: 100 },
      }),
      ...((data.swot.threats || []) as string[]).map((item) =>
        new Paragraph({
          text: `• ${item}`,
          spacing: { after: 50 },
        })
      ),
      new PageBreak()
    );
  }

  // Análise Financeira
  if (data.financialAnalysis) {
    sections.push(
      new Paragraph({
        text: 'Análise Financeira',
        heading: HeadingLevel.HEADING_1,
        spacing: { after: 200 },
      }),
      new Paragraph({
        text: 'Indicadores Principais',
        heading: HeadingLevel.HEADING_2,
        spacing: { after: 100 },
      }),
      new Paragraph({
        text: `VPL: R$ ${(data.financialAnalysis.vpl || 0).toLocaleString('pt-BR')}`,
        spacing: { after: 50 },
      }),
      new Paragraph({
        text: `TIR: ${((data.financialAnalysis.tir || 0) * 100).toFixed(2)}%`,
        spacing: { after: 50 },
      }),
      new Paragraph({
        text: `Payback: ${(data.financialAnalysis.payback || 0).toFixed(1)} anos`,
        spacing: { after: 200 },
      }),
      new Paragraph({
        text: 'Demonstração de Resultado (DRE)',
        heading: HeadingLevel.HEADING_2,
        spacing: { after: 100 },
      }),
      new Paragraph({
        text: `Receita Total: R$ ${(data.financialAnalysis.dre?.receita || 0).toLocaleString('pt-BR')}`,
        spacing: { after: 50 },
      }),
      new Paragraph({
        text: `Custos Totais: R$ ${(data.financialAnalysis.dre?.custos || 0).toLocaleString('pt-BR')}`,
        spacing: { after: 50 },
      }),
      new Paragraph({
        text: `Lucro Líquido: R$ ${(data.financialAnalysis.dre?.lucro || 0).toLocaleString('pt-BR')}`,
        spacing: { after: 200 },
        run: { bold: true },
      }),
      new Paragraph({
        text: 'Indicadores de Desempenho',
        heading: HeadingLevel.HEADING_2,
        spacing: { after: 100 },
      }),
      ...(data.financialAnalysis.indicadores
        ? [
            new Paragraph({
              text: `Liquidez Corrente: ${(data.financialAnalysis.indicadores.liquidezCorrente || 0).toFixed(2)}`,
              spacing: { after: 50 },
            }),
            new Paragraph({
              text: `Endividamento: ${((data.financialAnalysis.indicadores.endividamento || 0) * 100).toFixed(2)}%`,
              spacing: { after: 50 },
            }),
            new Paragraph({
              text: `Margem de Lucro: ${((data.financialAnalysis.indicadores.margemLucro || 0) * 100).toFixed(2)}%`,
              spacing: { after: 50 },
            }),
            new Paragraph({
              text: `ROE: ${((data.financialAnalysis.indicadores.roe || 0) * 100).toFixed(2)}%`,
              spacing: { after: 50 },
            }),
            new Paragraph({
              text: `ROA: ${((data.financialAnalysis.indicadores.roa || 0) * 100).toFixed(2)}%`,
              spacing: { after: 200 },
            }),
          ]
        : []),
      new PageBreak()
    );
  }

  // Business Model Canvas
  if (data.canvas) {
    sections.push(
      new Paragraph({
        text: 'Business Model Canvas',
        heading: HeadingLevel.HEADING_1,
        spacing: { after: 200 },
      }),
      new Paragraph({
        text: `Parceiros Chave: ${(data.canvas as any).keyPartners || 'N/A'}`,
        spacing: { after: 50 },
      }),
      new Paragraph({
        text: `Atividades Chave: ${(data.canvas as any).keyActivities || 'N/A'}`,
        spacing: { after: 50 },
      }),
      new Paragraph({
        text: `Recursos Chave: ${(data.canvas as any).keyResources || 'N/A'}`,
        spacing: { after: 50 },
      }),
      new Paragraph({
        text: `Proposição de Valor: ${(data.canvas as any).valueProposition || 'N/A'}`,
        spacing: { after: 50 },
      }),
      new Paragraph({
        text: `Segmentos de Clientes: ${(data.canvas as any).customerSegments || 'N/A'}`,
        spacing: { after: 50 },
      }),
      new Paragraph({
        text: `Canais: ${(data.canvas as any).channels || 'N/A'}`,
        spacing: { after: 50 },
      }),
      new Paragraph({
        text: `Relacionamento com Clientes: ${(data.canvas as any).customerRelationship || 'N/A'}`,
        spacing: { after: 50 },
      }),
      new Paragraph({
        text: `Fontes de Receita: ${(data.canvas as any).revenueStreams || 'N/A'}`,
        spacing: { after: 50 },
      }),
      new Paragraph({
        text: `Estrutura de Custos: ${(data.canvas as any).costStructure || 'N/A'}`,
        spacing: { after: 200 },
      }),
      new PageBreak()
    );
  }

  const doc = new Document({
    sections: [
      {
        children: sections as any,
      },
    ],
  });

  const buffer = await Packer.toBuffer(doc);
  return buffer;
}

export function generateWordFileName(companyName: string): string {
  const sanitized = companyName
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '');

  const date = new Date().toISOString().split('T')[0];
  return `${sanitized}_relatorio_${date}.docx`;
}
