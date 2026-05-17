# 📋 RELATÓRIO DE VERIFICAÇÃO - PeA-Plan Web Deployment

**Data**: 16 de maio de 2026  
**Projeto**: PeA-Plan - Plataforma Educacional para Elaboração de Planos de Negócios  
**Status**: 60% Completo | Pronto para correções e execução

---

## 1️⃣ VERIFICAÇÃO - O QUE FALTA PARA RODAR VIA WEB

### 🔴 **BLOQUEADORES CRÍTICOS** (Impedem execução)

#### 1.1 - Variáveis de Ambiente Não Configuradas
**Severidade**: 🔴 CRÍTICA  
**Impacto**: Aplicação não inicia

| Variável | Tipo | Descrição | Status |
|----------|------|-----------|--------|
| `DATABASE_URL` | Obrigatória | Conexão MySQL (mysql://user:pass@host:port/db) | ❌ **FALTANDO** |
| `JWT_SECRET` / `VITE_APP_ID` | Obrigatória | Chave para assinar tokens JWT | ❌ **FALTANDO** |
| `OAUTH_SERVER_URL` | Obrigatória | URL do servidor Manus OAuth | ❌ **FALTANDO** |
| `OWNER_OPEN_ID` | Obrigatória | ID do proprietário no Manus | ❌ **FALTANDO** |
| `BUILT_IN_FORGE_API_URL` | Obrigatória | URL da API Forge/LLM | ❌ **FALTANDO** |
| `BUILT_IN_FORGE_API_KEY` | Obrigatória | Chave de API do Forge | ❌ **FALTANDO** |
| `LLM_MODEL` | Opcional | Modelo LLM (padrão: gemini-2.5-flash) | ⚠️ HÁ PADRÃO |
| `PORT` | Opcional | Porta do servidor (padrão: 3000) | ⚠️ HÁ PADRÃO |
| `NODE_ENV` | Obrigatória | Ambiente (development/production) | ⚠️ HÁ PADRÃO |

**Arquivo Afetado**: `server/_core/env.ts`  
**Consequência**: Aplicação quebra no startup sem essas variáveis

---

#### 1.2 - Banco de Dados Não Inicializado
**Severidade**: 🔴 CRÍTICA  
**Impacto**: Endpoints não funcionam, erros ao consultar dados

**Situação Atual**:
- ❌ Schema Drizzle definido em `drizzle/schema.ts`
- ❌ Migrations SQL não rodadas
- ❌ Tabelas não criadas no MySQL

**Tabelas Necessárias** (17 total):
```
✓ instituicoes          - Organizações/escolas
✓ usuarios              - Contas de usuários (7 papéis)
✓ turmas                - Grupos de alunos
✓ matriculas            - Relacionamento turma-aluno
✓ planos                - Planos de negócios (JSONB)
✓ analise_swot          - Análises SWOT
✓ pontuacao_usuarios    - Gamificação
✓ conquistas            - Badges e prêmios
✓ usuarios_conquistas   - Histórico de conquistas
✓ historico_pontos      - Auditoria de pontos
✓ temas                 - Personalização de cores
✓ notificacoes          - Alertas do sistema
✓ ... (mais 5 tabelas)
```

---

### 🟡 **PROBLEMAS MEDIANOS** (Afetam funcionalidade)

#### 2.1 - Dependências Não Instaladas
**Severidade**: 🟡 MÉDIA  
**Status**: `node_modules/` existe no workspace, mas não há confirmação de sincronização

**Verificação Necessária**:
- [ ] `pnpm-lock.yaml` está sincronizado
- [ ] Todos os 80+ pacotes instalados
- [ ] Versões corretas

---

#### 2.2 - Componentes Gamificação Não Criados
**Severidade**: 🟡 MÉDIA  
**Impacto**: Funcionalidade incompleta (mas a API funciona)

**Componentes Faltando**:
- ❌ `client/src/components/Ranking.tsx` - Visualização de rankings
- ❌ `client/src/components/Conquistas.tsx` - Exibição de badges
- ❌ `client/src/components/Pontuacao.tsx` - Dashboard de pontos

**Nota**: Endpoints tRPC existem, apenas a UI está incompleta

---

#### 2.3 - Chat em Tempo Real Não Implementado
**Severidade**: 🟡 MÉDIA  
**Impacto**: Comunicação é apenas mock, sem Socket.io

**Situação**: 
- ❌ Socket.io não configurado
- ✓ Endpoints tRPC para mensagens existem
- ✓ Schema de banco pronto

---

### 🟢 **AVISOS LEVES** (Otimizações)

#### 3.1 - Arquivo `.env.example` Não Existe
**Severidade**: 🟢 LEVE  
**Impacto**: Desenvolvedores não sabem quais variáveis configurar

---

#### 3.2 - Pasta `.manus/` Sem Configuração Completa
**Severidade**: 🟢 LEVE  
**Impacto**: Debug/logging pode não funcionar totalmente

---

#### 3.3 - Build de Produção Não Testado
**Severidade**: 🟢 LEVE  
**Impacto**: Desconhecido se `pnpm build` funciona corretamente

---

## 2️⃣ SOLUÇÕES PARA PROBLEMAS ENCONTRADOS

### ✅ **SOLUÇÃO 1: Configurar Variáveis de Ambiente**

#### Passo 1.1 - Criar arquivo `.env.example`
```bash
# .env.example (exemplo/template)
DATABASE_URL=mysql://user:password@localhost:3306/pea_plan
JWT_SECRET=sua-chave-secreta-muito-longa-e-aleatoria-32-chars-min
VITE_APP_ID=seu-app-id-unico

# Manus OAuth
OAUTH_SERVER_URL=https://manus.seu-dominio.com
OWNER_OPEN_ID=seu-owner-id

# LLM / IA
BUILT_IN_FORGE_API_URL=https://forge.seu-dominio.com/api
BUILT_IN_FORGE_API_KEY=sua-chave-api
LLM_MODEL=gemini-2.5-flash

# Servidor
PORT=3000
NODE_ENV=development
```

#### Passo 1.2 - Criar arquivo `.env` (não commitar)
Copiar `.env.example` e preencher com valores reais:
```bash
DATABASE_URL=mysql://root:senha123@localhost:3306/pea_plan_dev
JWT_SECRET=abc123xyz789abc123xyz789abc123xyz789abc
VITE_APP_ID=pea-plan-dev-001
OAUTH_SERVER_URL=http://localhost:8080/oauth
OWNER_OPEN_ID=manus-owner-001
BUILT_IN_FORGE_API_URL=http://localhost:5000/api
BUILT_IN_FORGE_API_KEY=test-api-key-123
NODE_ENV=development
```

#### Passo 1.3 - Atualizar `.gitignore` (verificar se já existe)
```
.env
.env.local
.env.*.local
```

---

### ✅ **SOLUÇÃO 2: Inicializar Banco de Dados**

#### Passo 2.1 - Instalar/Configurar MySQL
**Windows com Docker**:
```bash
docker run --name pea-plan-mysql \
  -e MYSQL_ROOT_PASSWORD=senha123 \
  -e MYSQL_DATABASE=pea_plan_dev \
  -p 3306:3306 \
  -d mysql:8.0
```

**Windows nativo**: Baixar em [mysql.com](https://dev.mysql.com/downloads/mysql/)

#### Passo 2.2 - Rodas Migrations
```bash
pnpm run db:push
```

Isso vai:
1. Executar `drizzle-kit generate` - cria SQL das schemas
2. Executar `drizzle-kit migrate` - aplica ao banco

---

### ✅ **SOLUÇÃO 3: Instalar Dependências**

#### Passo 3.1 - Verificar e Reinstalar (se necessário)
```bash
pnpm install
```

#### Passo 3.2 - Verificar Tipos TypeScript
```bash
pnpm run check
```

Não deve haver erros.

---

### ✅ **SOLUÇÃO 4: Criar Componentes Gamificação** (Opcional - Fase 2)

Criar os 3 componentes que faltam:

1. **`client/src/components/Ranking.tsx`**
   ```typescript
   // Listar top 10 alunos por pontos
   // Usar endpoint: trpc.gamification.getRanking()
   ```

2. **`client/src/components/Conquistas.tsx`**
   ```typescript
   // Grid de badges desbloqueadas
   // Usar endpoint: trpc.gamification.getUserAchievements()
   ```

3. **`client/src/components/Pontuacao.tsx`**
   ```typescript
   // Dashboard com pontos, nível, XP
   // Usar endpoint: trpc.gamification.getUserScore()
   ```

---

### ✅ **SOLUÇÃO 5: Testar Aplicação**

#### Passo 5.1 - Rodar Testes
```bash
pnpm run test
```

Deve resultar em ✅ 82 testes passando

#### Passo 5.2 - Rodar em Desenvolvimento
```bash
pnpm run dev
```

Acesso em: `http://localhost:3000`

#### Passo 5.3 - Build de Produção
```bash
pnpm run build
pnpm run start
```

---

## 3️⃣ PLANEJAMENTO PARA EXECUÇÃO

### 📅 **FASE 1: PREPARAÇÃO (Dia 1 - ~2h)**

| # | Tarefa | Responsável | Tempo | Prioridade |
|---|--------|-------------|-------|-----------|
| 1.1 | Criar `.env.example` | Dev | 15 min | 🔴 CRÍTICA |
| 1.2 | Obter credenciais Manus/OAuth | Admin | 30 min | 🔴 CRÍTICA |
| 1.3 | Obter credenciais LLM/Forge | Admin | 30 min | 🟡 MÉDIA |
| 1.4 | Criar `.env` com valores reais | Dev | 15 min | 🔴 CRÍTICA |
| 1.5 | Verificar MySQL disponível | DevOps | 30 min | 🔴 CRÍTICA |

**Saída Esperada**: 
- ✓ `.env` configurado e testável
- ✓ MySQL rodando e acessível
- ✓ Todas as credenciais obtidas

---

### 📅 **FASE 2: INSTALAÇÃO (Dia 1 - ~1h)**

| # | Tarefa | Responsável | Tempo | Prioridade |
|---|--------|-------------|-------|-----------|
| 2.1 | Executar `pnpm install` | Dev | 10 min | 🔴 CRÍTICA |
| 2.2 | Executar `pnpm run check` (TypeScript) | Dev | 5 min | 🟡 MÉDIA |
| 2.3 | Executar `pnpm run db:push` (migrations) | Dev | 5 min | 🔴 CRÍTICA |
| 2.4 | Seed de dados iniciais (opcional) | Dev | 30 min | 🟢 LEVE |

**Saída Esperada**:
- ✓ Dependências instaladas
- ✓ 17 tabelas criadas no MySQL
- ✓ Schema validado
- ✓ (Opcional) Dados de teste carregados

---

### 📅 **FASE 3: VALIDAÇÃO LOCAL (Dia 1 - ~1h30)**

| # | Tarefa | Responsável | Tempo | Prioridade |
|---|--------|-------------|-------|-----------|
| 3.1 | Executar `pnpm run test` | Dev | 15 min | 🔴 CRÍTICA |
| 3.2 | Executar `pnpm run dev` | Dev | 5 min | 🔴 CRÍTICA |
| 3.3 | Testar login no navegador | QA | 15 min | 🔴 CRÍTICA |
| 3.4 | Testar CRUD básico (planos) | QA | 15 min | 🔴 CRÍTICA |
| 3.5 | Verificar modo dark/light | QA | 10 min | 🟢 LEVE |
| 3.6 | Documentar achados | QA | 30 min | 🟢 LEVE |

**Saída Esperada**:
- ✓ Servidor rodando em `localhost:3000`
- ✓ Login funcionando
- ✓ CRUD de planos testado
- ✓ Nenhum erro crítico no console

---

### 📅 **FASE 4: BUILD PARA PRODUÇÃO (Dia 2 - ~1h)**

| # | Tarefa | Responsável | Tempo | Prioridade |
|---|--------|-------------|-------|-----------|
| 4.1 | Executar `pnpm run build` | Dev | 15 min | 🔴 CRÍTICA |
| 4.2 | Verificar `dist/public` (frontend compilado) | Dev | 5 min | 🔴 CRÍTICA |
| 4.3 | Verificar `dist/index.js` (backend bundled) | Dev | 5 min | 🔴 CRÍTICA |
| 4.4 | Testar com `pnpm run start` | Dev | 15 min | 🔴 CRÍTICA |
| 4.5 | Verificar servir assets estáticos | QA | 10 min | 🔴 CRÍTICA |

**Saída Esperada**:
- ✓ Pasta `dist/` criada com todos os arquivos
- ✓ Servidor de produção funcional
- ✓ Assets carregando corretamente

---

### 📅 **FASE 5: DEPLOYMENT (Dia 2-3 - ~2h)**

| # | Tarefa | Responsável | Tempo | Prioridade |
|---|--------|-------------|-------|-----------|
| 5.1 | Escolher plataforma (Heroku/AWS/Azure/VPS) | DevOps | 30 min | 🔴 CRÍTICA |
| 5.2 | Configurar CI/CD (GitHub Actions) | DevOps | 1h | 🟡 MÉDIA |
| 5.3 | Deploy inicial | DevOps | 30 min | 🔴 CRÍTICA |
| 5.4 | Testes em staging | QA | 1h | 🔴 CRÍTICA |
| 5.5 | Deploy em produção | DevOps | 30 min | 🔴 CRÍTICA |

**Saída Esperada**:
- ✓ Aplicação rodando em URL pública (ex: `https://pea-plan.example.com`)
- ✓ SSL/TLS ativo
- ✓ Logs centralizados
- ✓ Backups automáticos ativados

---

### 📅 **FASE 6: MELHORIAS E COMPLETUDE (Semana 2)**

| # | Tarefa | Responsável | Tempo | Prioridade |
|---|--------|-------------|-------|-----------|
| 6.1 | Criar componentes: Ranking.tsx | Dev | 2h | 🟡 MÉDIA |
| 6.2 | Criar componentes: Conquistas.tsx | Dev | 2h | 🟡 MÉDIA |
| 6.3 | Criar componentes: Pontuacao.tsx | Dev | 2h | 🟡 MÉDIA |
| 6.4 | Implementar Socket.io para chat real-time | Dev | 4h | 🟡 MÉDIA |
| 6.5 | Testes E2E (Playwright) | QA | 2h | 🟡 MÉDIA |
| 6.6 | Otimizações de performance | Dev | 2h | 🟢 LEVE |

**Saída Esperada**:
- ✓ 100% de completude no frontend
- ✓ Chat em tempo real funcional
- ✓ Projeto em versão 1.0 pronta para produção

---

## 📊 **RESUMO EXECUTIVO**

### ✅ O que PODE rodar agora:
- ✓ Backend tRPC (50+ endpoints)
- ✓ Autenticação e permissões
- ✓ Dashboards (Admin, Professor, Aluno)
- ✓ Editor de Planos com auto-save
- ✓ SWOT, Canvas, Financeiro, Risco
- ✓ Gamificação (API pronta)
- ✓ Exportação PDF/Excel/Word

### ⚠️ O que FALTA para web:
1. **CRÍTICO**: Variáveis de ambiente (`.env`)
2. **CRÍTICO**: Banco de dados MySQL inicializado
3. **CRÍTICO**: Dependências instaladas
4. **MÉDIO**: Componentes de gamificação UI
5. **MÉDIO**: Chat em tempo real

### 📈 Estimativa:
- **Dias até web funcional**: 1-2 dias (fase 1-4)
- **Dias até 100% completo**: 2-3 semanas (incluindo fase 6)

---

## 🔗 Próximos Passos Imediatos

```bash
# 1. Criar arquivo .env
cp .env.example .env
# Editar .env com credenciais reais

# 2. Instalar dependências
pnpm install

# 3. Inicializar banco de dados
pnpm run db:push

# 4. Rodar testes
pnpm run test

# 5. Iniciar desenvolvimento
pnpm run dev

# Acessar em: http://localhost:3000
```

**Status Final**: 🟡 **AGUARDANDO CONFIGURAÇÃO** → Após `.env` + MySQL, será 🟢 **PRONTO**

---

*Relatório gerado em 16 de maio de 2026*  
*Para mais detalhes, consulte: ARCHITECTURE.md | ANALYSIS_REPORT.md*
