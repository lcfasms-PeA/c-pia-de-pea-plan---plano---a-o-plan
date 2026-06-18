import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { parseBulkEnrollData, parseCSV, parseTextIDs } from '@/lib/parseBulkEnroll';

describe('ClassManagement - Testes de Parsing', () => {
  describe('parseCSV', () => {
    it('deve fazer parse de CSV válido com header', async () => {
      const csv = 'id,email,name\n123,joao@email.com,João Silva\n456,maria@email.com,Maria Santos';
      const result = await parseCSV(csv);

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe(123);
      expect(result[0].email).toBe('joao@email.com');
      expect(result[0].name).toBe('João Silva');
    });

    it('deve rejeitar CSV sem header id', () => {
      const csv = 'email,name\njoao@email.com,João Silva';

      expect(() => parseCSV(csv)).toThrow('CSV deve ter coluna "id"');
    });

    it('deve rejeitar CSV com ID inválido', () => {
      const csv = 'id,email,name\nabc,joao@email.com,João Silva';

      expect(() => parseCSV(csv)).toThrow('não é um número válido');
    });

    it('deve rejeitar CSV vazio', () => {
      const csv = 'id,email,name';

      expect(() => parseCSV(csv)).toThrow('CSV deve conter ao menos um dado');
    });
  });

  describe('parseTextIDs', () => {
    it('deve fazer parse de IDs separados por vírgula', () => {
      const text = '123, 456, 789';
      const result = parseTextIDs(text);

      expect(result).toHaveLength(3);
      expect(result[0].id).toBe(123);
      expect(result[1].id).toBe(456);
      expect(result[2].id).toBe(789);
    });

    it('deve fazer parse de IDs separados por quebra de linha', () => {
      const text = '123\n456\n789';
      const result = parseTextIDs(text);

      expect(result).toHaveLength(3);
      expect(result[0].id).toBe(123);
      expect(result[1].id).toBe(456);
      expect(result[2].id).toBe(789);
    });

    it('deve rejeitar ID inválido', () => {
      const text = '123, abc, 789';

      expect(() => parseTextIDs(text)).toThrow('não é um número válido');
    });

    it('deve rejeitar texto vazio', () => {
      const text = '';

      expect(() => parseTextIDs(text)).toThrow('Nenhum ID encontrado');
    });

    it('deve rejeitar apenas espaços em branco', () => {
      const text = '   ';

      expect(() => parseTextIDs(text)).toThrow('Nenhum ID encontrado');
    });
  });

  describe('parseBulkEnrollData', () => {
    it('deve fazer parse de texto com IDs', async () => {
      const text = '123, 456, 789';
      const result = await parseBulkEnrollData('text', text);

      expect(result.students).toHaveLength(3);
      expect(result.students.map(s => s.id)).toContain(123);
      expect(result.students.map(s => s.id)).toContain(456);
      expect(result.students.map(s => s.id)).toContain(789);
      expect(result.duplicates).toHaveLength(0);
    });

    it('deve fazer parse de CSV', async () => {
      const csv = 'id,email,name\n123,joao@email.com,João Silva\n456,maria@email.com,Maria Santos';
      const result = await parseBulkEnrollData('csv', csv);

      expect(result.students).toHaveLength(2);
      expect(result.students[0].id).toBe(123);
      expect(result.students[1].id).toBe(456);
      expect(result.duplicates).toHaveLength(0);
    });

    it('deve remover IDs duplicados', async () => {
      const text = '123, 456, 123, 789, 456';
      const result = await parseBulkEnrollData('text', text);

      expect(result.students).toHaveLength(3);
      expect(result.students.map(s => s.id)).toContain(123);
      expect(result.students.map(s => s.id)).toContain(456);
      expect(result.students.map(s => s.id)).toContain(789);
      expect(result.duplicates).toEqual([123, 456]);
    });

    it('deve lançar erro para entrada vazia', async () => {
      const text = '';

      await expect(parseBulkEnrollData('text', text)).rejects.toThrow();
    });
  });
});

// Nota: Testes de componentes React (ClassForm, ClassList, etc) seriam semelhantes aos de SecaoFinanceira
// Aqui focamos nos testes de lógica de parsing que são críticos
