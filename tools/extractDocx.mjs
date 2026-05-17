#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import mammoth from 'mammoth';

const docxPath = path.resolve(process.cwd(), 'docs', 'PeA-Plan_Completo.docx');
const outTxt = path.resolve(process.cwd(), 'docs', 'PeA-Plan_Completo.txt');
const outJson = path.resolve(process.cwd(), 'docs', 'PeA-Plan_Completo.json');

async function main() {
  if (!fs.existsSync(docxPath)) {
    console.error('Arquivo .docx não encontrado em:', docxPath);
    process.exit(1);
  }

  try {
    const result = await mammoth.extractRawText({ path: docxPath });
    const text = result.value;
    const messages = result.messages || [];

    fs.writeFileSync(outTxt, text, 'utf8');

    const paragraphs = text
      .split(/\r?\n\r?\n/)
      .map((p) => p.trim())
      .filter(Boolean);

    fs.writeFileSync(outJson, JSON.stringify({ paragraphs, messages }, null, 2), 'utf8');

    console.log('Extração concluída:');
    console.log(' -', outTxt);
    console.log(' -', outJson);
  } catch (err) {
    console.error('Falha na extração:', err);
    process.exit(1);
  }
}

main();
