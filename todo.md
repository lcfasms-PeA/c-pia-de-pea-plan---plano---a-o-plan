# PeA-Plan - Mapa de Governanca Tecnica

Este arquivo substitui o checklist literal baseado no roteiro `docs/PeA-Plan_Completo.docx`.
O DOCX descreve uma arquitetura alvo com 85 arquivos em `backend/`, `frontend/`,
`database/` e `scripts/`, usando JavaScript/Express/PostgreSQL. A implementacao real
do repositorio usa TypeScript, React, tRPC, Drizzle e a estrutura:

- `client/`: frontend React + TypeScript
- `server/`: backend tRPC + helpers de dominio
- `shared/`: tipos, constantes e schemas compartilhados
- `drizzle/`: schema e migrations
- `docs/`: documentacao e roteiro original

Por isso, o status abaixo mede equivalencia funcional, nao igualdade literal de nomes
como `Plano.js`, `planoController.js` ou `frontend/src/components/plano/MapaPlano.jsx`.

## Validacao Atual

- [x] TypeScript: `.\node_modules\.bin\tsc.cmd --noEmit`
- [x] Testes: `.\node_modules\.bin\vitest.cmd run --cache false`
- [x] Resultado da ultima validacao: 9 arquivos de teste, 107 testes aprovados

## Equivalencias Arquiteturais

| Roteiro DOCX / TODO antigo | Implementacao real |
|---|---|
| `backend/src/server.js` | `server/_core/index.ts` |
| `backend/src/routes/*.js` | `server/routers.ts` com routers tRPC |
| `backend/src/controllers/*.js` | procedures tRPC em `server/routers.ts` |
| `backend/src/models/*.js` | `drizzle/schema.ts`, `drizzle/relations.ts` e helpers |
| `backend/src/services/exportacaoService.js` | `server/pdfExportHelper.ts`, `server/excelExportHelper.ts`, `server/wordExportHelper.ts` |
| `backend/src/services/gamificacaoService.js` | `server/gamificationHelper.ts` |
| `backend/src/services/progressoService.js` | `server/planProgressHelper.ts` |
| `frontend/src/App.jsx` | `client/src/App.tsx` |
| `frontend/src/pages/Login.jsx` | `client/src/pages/Login.tsx` |
| `frontend/src/components/dashboard/*.jsx` | `client/src/components/Dashboard*.tsx` |
| `frontend/src/components/plano/MapaPlano.jsx` | `client/src/components/MapaPlano.tsx` |
| `frontend/src/components/plano/Canvas.jsx` | `client/src/components/CanvasEditor.tsx` |
| `frontend/src/components/plano/Swot.jsx` | `client/src/components/SWOTEditor.tsx` |
| `frontend/src/components/gamificacao/Ranking.jsx` | `client/src/components/Ranking.tsx` |
| `frontend/src/components/notificacoes/Notificacao.jsx` | `client/src/components/NotificationCenter.tsx` |
| `database/pea_plan_postgresql.sql` | `drizzle/schema.ts` e migrations em `drizzle/` |

## Fase 1: Autenticacao e Controle de Permissoes

- [x] Schema de instituicoes, usuarios, turmas, planos, pontuacao e conquistas em `drizzle/schema.ts`
- [x] Middleware/procedures de autenticacao: `protectedProcedure` em `server/_core/trpc.ts`
- [x] RBAC por papel: `server/_core/roleMiddleware.ts`
- [x] Login/logout: `client/src/pages/Login.tsx` e `server/routers.ts`
- [x] Testes de autenticacao/permissao: `server/auth.logout.test.ts`, `server/auth.permissions.test.ts`
- [ ] Reforcar validacao de posse/escopo em endpoints que recebem `planId` ou `id`

## Fase 2: Dashboards Personalizados

- [x] Dashboard admin: `client/src/components/DashboardAdmin.tsx`
- [x] Dashboard professor: `client/src/components/DashboardProfessor.tsx`
- [x] Dashboard aluno: `client/src/components/DashboardAluno.tsx`
- [x] Rota: `client/src/pages/Dashboard.tsx`
- [x] Navegacao: `client/src/components/Navigation.tsx`
- [x] Testes: `client/src/components/__tests__/Dashboards.test.tsx`
- [ ] Validar se todos os cards usam dados reais, nao mocks/dados estaticos

## Fase 3: Modulo de Elaboracao do Plano

- [x] Schema de planos: `businessPlans` em `drizzle/schema.ts`
- [x] Endpoints equivalentes a `trpc.planos.*`: `businessPlans.*` em `server/routers.ts`
- [x] Editor: `client/src/components/EditorPlano.tsx`
- [x] Mapa do plano: `client/src/components/MapaPlano.tsx`
- [x] Pagina de edicao: `client/src/pages/PlanEditor.tsx`
- [x] Calculo de progresso: `server/planProgressHelper.ts`
- [x] Testes: `server/businessPlans.test.ts`
- [ ] Integrar triggers de progresso com gamificacao/notificacoes
- [ ] Reforcar autorizacao por dono/turma/professor/admin em leitura, edicao e exportacao

## Fase 4: Ferramentas Estrategicas

### SWOT

- [x] Schema: `swotAnalysis` em `drizzle/schema.ts`
- [x] Componente: `client/src/components/SWOTEditor.tsx`
- [x] Helper de analise: `server/strategicHelper.ts`
- [ ] Confirmar persistencia CRUD dedicada ou consolidar formalmente no JSON do plano

### Business Model Canvas

- [x] Schema: `canvasModels` em `drizzle/schema.ts`
- [x] Componente: `client/src/components/CanvasEditor.tsx`
- [x] Validacao/helper: `server/strategicHelper.ts`
- [ ] Confirmar endpoints dedicados `canvas.obter/salvar` ou documentar equivalencia atual

### Analise de Risco

- [x] Schema: `riskAnalysis` em `drizzle/schema.ts`
- [x] Componente: `client/src/components/RiskMatrix.tsx`
- [x] Helper: `server/strategicHelper.ts`
- [ ] Expor/listar CRUD dedicado para riscos, se a decisao for tabela propria

### Cronograma

- [x] Schema: `schedules` em `drizzle/schema.ts`
- [x] Componente: `client/src/components/TimelineGantt.tsx`
- [ ] Expor CRUD dedicado para cronograma

## Fase 5: Modulo Financeiro

- [x] Calculos VPL, TIR, Payback, DRE, Balanco e indicadores: `server/financialHelper.ts`
- [x] Componente financeiro: `client/src/components/SecaoFinanceira.tsx`
- [x] Dashboard financeiro: `client/src/components/FinancialDashboard.tsx`
- [x] Pagina/rota: `client/src/pages/FinancialAnalysis.tsx`, rota `/financial-analysis`
- [x] Testes financeiros: `server/strategic.financial.test.ts`, `client/src/components/__tests__/SecaoFinanceira.test.tsx`
- [x] Validacao de dados financeiros no componente

## Fase 6: Gamificacao

- [x] Schemas: `userScores`, `achievements`, `userAchievements`, `pointsHistory`
- [x] Helper: `server/gamificationHelper.ts`
- [x] Router: `gamification` em `server/routers.ts`
- [x] Componentes: `Ranking.tsx`, `Conquistas.tsx`, `Pontuacao.tsx`
- [x] Sistema de niveis/conquistas em helper
- [ ] Trigger real ao concluir secoes do plano
- [ ] Criar notificacao ao ganhar conquista
- [ ] Revisar ranking para considerar todos os alunos da turma, nao apenas primeiro ID
- [ ] Adicionar testes de integracao plano -> pontos -> conquistas

## Fase 7: Gestao de Turmas

- [x] Schemas: `classes`, `enrollments`
- [x] Router: `classes` em `server/routers.ts`
- [x] Pagina: `client/src/pages/ClassManagement.tsx`
- [x] Componentes: `ClassForm.tsx`, `ClassList.tsx`, `ClassStudents.tsx`, `BulkEnrollDialog.tsx`
- [x] Parser de importacao: `client/src/lib/parseBulkEnroll.ts`
- [x] Testes: `client/src/components/__tests__/ClassManagement.test.tsx`
- [ ] Implementar endpoint de delecao/arquivamento de turma, se necessario

## Fase 8: Notificacoes Automaticas

- [x] Schema: `notifications` em `drizzle/schema.ts`
- [x] Router: `notifications.list`, `notifications.markAsRead`
- [x] Componente: `client/src/components/NotificationCenter.tsx`
- [x] Service worker/PWA com base para push: `client/public/sw.ts`
- [ ] Substituir simulacao do `NotificationCenter` por dados reais do backend
- [ ] Trigger ao concluir secao
- [ ] Trigger ao ganhar conquista
- [ ] Tempo real via Socket.io, SSE ou polling governado
- [ ] Testes de notificacoes

## Fase 9: Chat em Tempo Real

- [x] Schema inicial: `messages` em `drizzle/schema.ts`
- [ ] Router `chat.listar/enviar/deletar`
- [ ] Componente `Chat.tsx` ou adaptar `AIChatBox.tsx` se for chat assistivo
- [ ] Tempo real via Socket.io/SSE
- [ ] Upload de arquivos em mensagens
- [ ] Indicador de digitacao
- [ ] Reacoes a mensagens
- [ ] Testes de chat

## Fase 10: Exportacao de Relatorios

- [x] PDF: `server/pdfExportHelper.ts`, endpoint `businessPlans.exportPDF`
- [x] Excel: `server/excelExportHelper.ts`, endpoint `businessPlans.exportExcel`
- [x] Word: `server/wordExportHelper.ts`, endpoint `businessPlans.exportWord`
- [x] Testes: `server/pdfExport.test.ts`
- [x] Personalizacao de capa: `server/coverCustomization.ts`
- [x] Testes de capa: `server/coverCustomization.test.ts`
- [ ] Componente `Exportacao.tsx`
- [ ] Fila/processamento assincrono para relatorios grandes
- [ ] Validar posse do plano antes de exportar
- [ ] Endpoint/upload real de logotipo
- [ ] Preview de capa

## Fase 11: Captacao de Recursos

- [x] Schema inicial: `resourceCapture` em `drizzle/schema.ts`
- [ ] Router `captacao.listar/criar/atualizar`
- [ ] Componente `CaptacaoRecursos.tsx`
- [ ] Filtros por tipo de recurso
- [ ] Integracao externa com APIs/editais, quando houver fonte oficial definida
- [ ] Testes de captacao

## Fase 12: Tema Institucional

- [x] Schema: `themes` em `drizzle/schema.ts`
- [x] Router: `theme.get`, `theme.save`
- [x] Contexto base: `client/src/contexts/ThemeContext.tsx`
- [ ] Componente `ThemeConfig.tsx`
- [ ] Aplicacao dinamica das cores/fontes institucionais no app
- [ ] Upload de logotipo/banner
- [ ] Geracao/aplicacao de CSS dinamico
- [ ] Testes de tema

## Fase 13: Assistente Inteligente

- [x] Infraestrutura LLM: `server/_core/llm.ts`
- [x] Componente base de chat IA: `client/src/components/AIChatBox.tsx`
- [ ] Router `assistente.sugerir`
- [ ] Router `assistente.analisar`
- [ ] Router `assistente.feedback`
- [ ] Streaming de respostas
- [ ] Historico de conversa
- [ ] Testes de assistente

## Fase 14: Acompanhamento de Progresso do Professor

- [ ] Dashboard dedicado de progresso por aluno
- [ ] Graficos de secoes completas, pontos e nivel
- [ ] Filtros por turma
- [ ] Exportacao de relatorio de progresso
- [ ] Testes de acompanhamento

## Fase 15: Testes e Qualidade

- [x] Suite Vitest executando com sucesso
- [x] TypeScript sem erros
- [x] Testes de auth/permissao
- [x] Testes de dashboards
- [x] Testes de turmas
- [x] Testes financeiros
- [x] Testes de exportacao/capa
- [ ] Testes para todos os endpoints tRPC
- [ ] Testes de integracao entre modulos
- [ ] Testes de permissao por posse/tenant
- [ ] Testes de performance
- [ ] CI/CD com GitHub Actions

## Fase 16: Documentacao e Deploy

- [x] `docker-compose.yml`
- [x] `Dockerfile`
- [x] `.env.example`
- [x] `install.sh`
- [x] `install.bat`
- [x] Documentacao parcial em `docs/`, `DOCKER_INSTALL.md`, `README_DOCUMENTATION.md`
- [ ] README principal completo e alinhado a TypeScript/tRPC/Drizzle
- [ ] Manual do usuario final
- [ ] Referencia da API tRPC
- [ ] Manual de tema
- [ ] Deploy em staging
- [ ] Deploy em producao

## Gaps Prioritarios De Governanca

1. [ ] Validar posse/escopo em endpoints de planos e exportacoes.
2. [ ] Implementar triggers reais de gamificacao e notificacoes ao concluir secoes.
3. [ ] Atualizar documentacao final para a arquitetura real, evitando a cobranca literal dos 85 arquivos JS do DOCX.
4. [ ] Remover/evitar versionamento de `.env` real; manter apenas `.env.example`.
5. [ ] Decidir formalmente se SWOT/Canvas/Risco/Cronograma usam tabelas dedicadas ou JSON do plano.

## Proxima Acao Recomendada

Executar a etapa 3 do plano: fechar lacunas de seguranca e integracao, comecando por
validacao de posse em `businessPlans.getById`, `businessPlans.update`,
`businessPlans.updateSection`, `businessPlans.getProgress`, `businessPlans.exportPDF`,
`businessPlans.exportExcel` e `businessPlans.exportWord`.
