// Parser para importação em lote de alunos

export interface ParsedStudent {
  id: number;
  email?: string;
  name?: string;
}

/**
 * Parse CSV content and extract student IDs
 * CSV format: id,email,name
 */
export function parseCSV(csvContent: string): ParsedStudent[] {
  const lines = csvContent.trim().split('\n');
  if (lines.length < 2) {
    throw new Error('CSV deve conter ao menos um dado (além do header)');
  }

  const students: ParsedStudent[] = [];
  const headers = lines[0].toLowerCase().split(',').map(h => h.trim());

  // Find column indices
  const idIndex = headers.findIndex(h => h === 'id');
  const emailIndex = headers.findIndex(h => h === 'email');
  const nameIndex = headers.findIndex(h => h === 'name');

  if (idIndex === -1) {
    throw new Error('CSV deve ter coluna "id"');
  }

  // Parse data lines
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const columns = line.split(',').map(c => c.trim());
    const idStr = columns[idIndex];

    if (!idStr) {
      throw new Error(`Linha ${i + 1}: ID não pode estar vazio`);
    }

    const id = parseInt(idStr, 10);
    if (isNaN(id)) {
      throw new Error(`Linha ${i + 1}: ID "${idStr}" não é um número válido`);
    }

    students.push({
      id,
      email: emailIndex >= 0 ? columns[emailIndex] : undefined,
      name: nameIndex >= 0 ? columns[nameIndex] : undefined,
    });
  }

  if (students.length === 0) {
    throw new Error('Nenhum aluno encontrado no CSV');
  }

  return students;
}

/**
 * Parse plain text with comma or line-separated IDs
 */
export function parseTextIDs(textContent: string): ParsedStudent[] {
  const content = textContent.trim();

  // Try to split by comma first
  let ids = content.split(',').map(id => id.trim()).filter(id => id);

  // If only one item and no comma, try newline
  if (ids.length === 1 && !content.includes(',')) {
    ids = content.split('\n').map(id => id.trim()).filter(id => id);
  }

  if (ids.length === 0) {
    throw new Error('Nenhum ID encontrado');
  }

  const students: ParsedStudent[] = [];
  for (const idStr of ids) {
    const id = parseInt(idStr, 10);
    if (isNaN(id)) {
      throw new Error(`"${idStr}" não é um número válido`);
    }
    students.push({ id });
  }

  return students;
}

/**
 * Extract student IDs and validate uniqueness
 */
export function extractStudentIDs(students: ParsedStudent[]): {
  ids: number[];
  duplicates: number[];
} {
  const seen = new Set<number>();
  const duplicates: number[] = [];
  const ids: number[] = [];

  for (const student of students) {
    if (seen.has(student.id)) {
      if (!duplicates.includes(student.id)) {
        duplicates.push(student.id);
      }
    } else {
      seen.add(student.id);
      ids.push(student.id);
    }
  }

  return { ids, duplicates };
}

/**
 * Parse and validate bulk enrollment data
 * Returns parsed students or throws error
 */
export async function parseBulkEnrollData(
  source: 'csv' | 'text',
  content: string
): Promise<ParsedStudent[]> {
  try {
    const students = source === 'csv' ? parseCSV(content) : parseTextIDs(content);
    const { ids, duplicates } = extractStudentIDs(students);

    if (duplicates.length > 0) {
      console.warn(`IDs duplicados encontrados: ${duplicates.join(', ')}`);
    }

    return students.filter((s, idx, arr) => arr.findIndex(x => x.id === s.id) === idx);
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Erro ao processar dados');
  }
}
