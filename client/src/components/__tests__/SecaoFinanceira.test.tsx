import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SecaoFinanceira from '@/components/SecaoFinanceira';
import { trpc } from '@/lib/trpc';

// Mock do trpc
vi.mock('@/lib/trpc', () => ({
  trpc: {
    financeiro: {
      calcularVPL: { useQuery: vi.fn() },
      calcularTIR: { useQuery: vi.fn() },
      calcularPayback: { useQuery: vi.fn() },
      calcularDRE: { useQuery: vi.fn() },
    },
  },
}));

class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}

if (!globalThis.ResizeObserver) {
  (globalThis as any).ResizeObserver = ResizeObserverMock;
}

describe('SecaoFinanceira - Validação e Erros', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock das queries
    (trpc.financeiro.calcularVPL.useQuery as any).mockReturnValue({
      data: 125000,
      refetch: vi.fn().mockResolvedValue({ data: 125000 }),
    });
    (trpc.financeiro.calcularTIR.useQuery as any).mockReturnValue({
      data: 0.28,
      refetch: vi.fn().mockResolvedValue({ data: 0.28 }),
    });
    (trpc.financeiro.calcularPayback.useQuery as any).mockReturnValue({
      data: 2.5,
      refetch: vi.fn().mockResolvedValue({ data: 2.5 }),
    });
    (trpc.financeiro.calcularDRE.useQuery as any).mockReturnValue({
      data: {
        receitas: 500000,
        custos: 300000,
        lucroGruto: 200000,
        despesas: 50000,
        lucroOperacional: 150000,
        juros: 10000,
        lucroAntes: 140000,
        impostos: 21000,
        lucroLiquido: 119000,
      },
      refetch: vi.fn().mockResolvedValue({ data: {} }),
    });
  });

  it('deve validar investimento inicial positivo', async () => {
    const user = userEvent.setup();
    render(<SecaoFinanceira planId={1} />);

    fireEvent.change(screen.getByLabelText(/Investimento Inicial/i), {
      target: { value: '-100' },
    });

    // Clicar em salvar
    const saveButton = screen.getByText(/Salvar Dados Financeiros/);
    await user.click(saveButton);

    await waitFor(() => {
      expect(screen.getAllByText(/Investimento inicial deve ser maior que zero/).length).toBeGreaterThan(0);
    });
  });

  it('deve validar taxa de desconto entre 0 e 1', async () => {
    render(<SecaoFinanceira planId={1} />);

    const inputs = screen.getAllByRole('spinbutton');
    fireEvent.change(inputs[1], {
      target: { value: '1.5' },
    });

    const user = userEvent.setup();

    const saveButton = screen.getByText(/Salvar Dados Financeiros/);
    await user.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText(/Taxa de desconto deve estar entre 0 e 1/)).toBeInTheDocument();
    });
  });

  it('deve validar custos não negativos', async () => {
    render(<SecaoFinanceira planId={1} />);

    const inputs = screen.getAllByRole('spinbutton');
    fireEvent.change(inputs[3], {
      target: { value: '-50000' },
    });

    const user = userEvent.setup();
    const saveButton = screen.getByText(/Salvar Dados Financeiros/);
    await user.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText(/Custos não podem ser negativos/)).toBeInTheDocument();
    });
  });

  it('deve exibir alerta de erros de validação', async () => {
    render(<SecaoFinanceira planId={1} />);

    fireEvent.change(screen.getByLabelText(/Investimento Inicial/i), {
      target: { value: '-100' },
    });

    const user = userEvent.setup();
    const saveButton = screen.getByText(/Salvar Dados Financeiros/);
    await user.click(saveButton);

    await waitFor(() => {
      // Deve exibir aviso com quantidade de erros
      expect(screen.getByText(/erro\(s\) de validação encontrado\(s\)/i)).toBeInTheDocument();
    });
  });

  it('deve desabilitar botão salvar quando há erros de validação', async () => {
    render(<SecaoFinanceira planId={1} />);

    fireEvent.change(screen.getByLabelText(/Investimento Inicial/i), {
      target: { value: '-100' },
    });

    const user = userEvent.setup();
    const saveButton = screen.getByText(/Salvar Dados Financeiros/);

    await user.click(saveButton);

    await waitFor(() => {
      expect(saveButton).toBeDisabled();
    });
  });

  it('deve limpar erro ao editar campo', async () => {
    const user = userEvent.setup();
    render(<SecaoFinanceira planId={1} />);

    const investimentoInput = screen.getByLabelText(/Investimento Inicial/i);

    fireEvent.change(investimentoInput, {
      target: { value: '-100' },
    });

    const saveButton = screen.getByText(/Salvar Dados Financeiros/);
    await user.click(saveButton);

    await waitFor(() => {
      expect(screen.getAllByText(/Investimento inicial deve ser maior que zero/).length).toBeGreaterThan(0);
    });

    // Editar para valor válido
    fireEvent.change(investimentoInput, {
      target: { value: '100000' },
    });

    // Erro deve desaparecer
    await waitFor(() => {
      expect(screen.queryAllByText(/Investimento inicial deve ser maior que zero/)).toHaveLength(0);
    });
  });

  it('deve exibir erro de salvamento ao chamar onSave com erro', async () => {
    const user = userEvent.setup();
    const onSave = vi.fn().mockRejectedValue(new Error('Erro de conexão'));

    render(<SecaoFinanceira planId={1} onSave={onSave} />);

    const saveButton = screen.getByText(/Salvar Dados Financeiros/);
    await user.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText(/Erro ao salvar/)).toBeInTheDocument();
      expect(screen.getByText(/Erro de conexão/)).toBeInTheDocument();
    });
  });

  it('deve permitir salvar com dados válidos', async () => {
    const user = userEvent.setup();
    const onSave = vi.fn().mockResolvedValue(undefined);

    render(<SecaoFinanceira planId={1} onSave={onSave} />);

    const saveButton = screen.getByText(/Salvar Dados Financeiros/);
    await user.click(saveButton);

    await waitFor(() => {
      expect(onSave).toHaveBeenCalled();
    });
  });

  it('deve validar fluxo de caixa não vazio', async () => {
    const user = userEvent.setup();
    const { container } = render(
      <SecaoFinanceira
        planId={1}
        initialData={{ fluxosCaixa: [{ mes: 1, valor: 50000 }] }}
      />
    );

    // Ir para tab de fluxo
    const fluxoTab = screen.getByText('Fluxo de Caixa');
    await user.click(fluxoTab);

    // Com apenas 1 mês, o botão de remover deve estar desabilitado
    await waitFor(() => {
      const disabledButtons = container.querySelectorAll('button:disabled');
      expect(disabledButtons.length).toBeGreaterThan(0);
    });
  });
});
