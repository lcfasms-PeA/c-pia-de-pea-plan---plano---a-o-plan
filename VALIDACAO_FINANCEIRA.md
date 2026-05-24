# Validação de Dados Financeiros - Documentação

## Regras de Validação Implementadas

### 1. **Investimento Inicial**
- ✅ **Regra:** Deve ser maior que zero
- ✅ **Tipo:** Número finito válido
- ✅ **Mensagem de Erro:** "Investimento inicial deve ser maior que zero"

### 2. **Taxa de Desconto**
- ✅ **Regra:** Deve estar entre 0 e 1 (0% a 100%)
- ✅ **Formato:** Decimal (ex: 0.10 = 10%)
- ✅ **Mensagem de Erro:** "Taxa de desconto deve estar entre 0 e 1 (0% a 100%)"

### 3. **Receitas**
- ✅ **Regra:** Não pode ser negativa
- ✅ **Tipo:** Número não-negativo
- ✅ **Mensagem de Erro:** "Receitas não podem ser negativas"

### 4. **Custos**
- ✅ **Regra:** Não pode ser negativo
- ✅ **Tipo:** Número não-negativo
- ✅ **Mensagem de Erro:** "Custos não podem ser negativos"

### 5. **Despesas**
- ✅ **Regra:** Não pode ser negativa
- ✅ **Tipo:** Número não-negativo
- ✅ **Mensagem de Erro:** "Despesas não podem ser negativas"

### 6. **Juros**
- ✅ **Regra:** Não pode ser negativo
- ✅ **Tipo:** Número não-negativo
- ✅ **Mensagem de Erro:** "Juros não podem ser negativos"

### 7. **Alíquota de Imposto**
- ✅ **Regra:** Deve estar entre 0 e 1 (0% a 100%)
- ✅ **Formato:** Decimal (ex: 0.15 = 15%)
- ✅ **Mensagem de Erro:** "Alíquota de imposto deve estar entre 0 e 1 (0% a 100%)"

### 8. **Fluxo de Caixa**
- ✅ **Regra:** Deve haver ao menos um período
- ✅ **Regra:** Cada período não pode ter valor negativo
- ✅ **Regra:** Cada período deve ser um número finito válido
- ✅ **Mensagens de Erro:** 
  - "Deve haver pelo menos um período de fluxo de caixa"
  - "Fluxo de caixa do mês X não pode ser negativo"
  - "Fluxo de caixa do mês X deve ser um número válido"

---

## Fluxo de Validação

```
Usuário Clica "Salvar"
        ↓
Valida todos os dados
        ↓
Há erros?
   ├─ SIM → Exibe erros
   │        Desabilita botão salvar
   │        Retorna (não salva)
   │
   └─ NÃO → Executa onSave
            Salva dados no banco
            Exibe mensagem de sucesso
```

---

## Feedback Visual

### **Erros de Validação**
- Card amarelo com lista de erros
- Conta total de problemas encontrados
- Campo afetado destacado em vermelho

### **Erro de Salvamento**
- Card vermelho com detalhes do erro
- Mensagem de erro específica
- Permite corrigir e tentar novamente

### **Estado do Botão Salvar**
| Estado | Habilitado | Texto |
|--------|-----------|-------|
| Normal | ✅ | "Salvar Dados Financeiros" |
| Validando | ❌ | "Validando..." |
| Salvando | ❌ | "Salvando..." |
| Com Erros | ❌ | "Salvar Dados Financeiros" |

---

## Limpeza de Erros

- Erros são **automaticamente limpos** ao editar um campo
- Usuário não precisa clicar em botão "Limpar"
- Validação é contínua durante edição

---

## Casos de Teste Cobridos

✅ Validação de investimento inicial positivo
✅ Validação de taxa de desconto (0-1)
✅ Validação de custos não-negativos
✅ Exibição de alerta de erros
✅ Desabilitação de botão com erros
✅ Limpeza de erro ao editar campo
✅ Exibição de erro de salvamento
✅ Salvamento bem-sucedido com dados válidos
✅ Validação de fluxo de caixa não vazio

---

## Tratamento de Erros em Cálculos

**Quando há dados inválidos:**
- ✅ Cálculos NÃO são executados
- ✅ Resultados são limpos
- ✅ Usuário vê área vazia em "Resultados"
- ✅ Mensagem de validação indica o problema

**Quando cálculo falha:**
- ✅ Toast de erro é exibido
- ✅ Erro é logado no console
- ✅ Resultados são limpos

---

## Integração com Backend

### Endpoint tRPC
```typescript
trpc.businessPlans.updateSection.mutate({
  id: planId,
  section: "planoFinanceiro",
  data: validatedData
})
```

### Tratamento de Erro
```typescript
try {
  await onSave(data)
  // Sucesso
} catch (error) {
  // Exibe erro na tela
  // Registra em console
}
```

---

## Boas Práticas Implementadas

1. ✅ **Validação no Cliente** - Feedback imediato
2. ✅ **Limpeza de Erros** - Ao editar campo
3. ✅ **Desabilitação de Ação** - Botão salvar bloqueado
4. ✅ **Feedback Visual** - Cards coloridos com ícones
5. ✅ **Mensagens Claras** - Em português, específicas
6. ✅ **Tratamento de Exceções** - Try-catch em salvamento
7. ✅ **Log de Erros** - Console para debug
8. ✅ **Testes Completos** - Cobrindo casos de erro

---

## Status: ✅ IMPLEMENTADO E TESTADO

Validação completa implementada com:
- 8 tipos de validação
- Feedback visual em 3 níveis (erro, aviso, sucesso)
- 9 casos de teste cobrindo validação
- Tratamento robusto de erros
