# PeA-Plan - TODO List

## Fase 1: Autenticação e Controle de Permissões

- [x] Estender schema Drizzle com tabelas de instituição, turma, plano, pontuação, conquistas
- [x] Criar migration SQL para PostgreSQL
- [x] Implementar middleware de autenticação por papel (admin, professor, aluno)
- [x] Criar procedures tRPC protegidas: protectedProcedure, adminProcedure, professorProcedure, alunoProcedure
- [x] Implementar verificação de permissões em cada endpoint
- [x] Criar página de Login com formulário
- [x] Testar fluxo de login e logout
- [x] Implementar persistência de sessão

## Fase 2: Dashboards Personalizados

- [x] Criar DashboardAdmin.tsx com estatísticas gerais (instituições, usuários, turmas, planos, pontos)
- [x] Criar DashboardProfessor.tsx com turmas e alunos
- [x] Criar DashboardAluno.tsx com planos e pontuação
- [x] Implementar roteamento condicional baseado em papel
- [x] Criar componente de navegação por perfil
- [x] Implementar cards de estatísticas com dados em tempo real
- [x] Adicionar ações rápidas em cada dashboard
- [x] Criar testes vitest para dashboards

## Fase 3: Módulo de Elaboração do Plano

- [x] Criar schema para tabela planos com 8 seções (JSONB)
- [x] Implementar endpoint trpc.planos.criar
- [x] Implementar endpoint trpc.planos.listar
- [x] Implementar endpoint trpc.planos.obterPorId
- [x] Implementar endpoint trpc.planos.atualizar
- [x] Criar componente MapaPlano.tsx (visualização de progresso)
- [x] Criar componente EditorPlano.tsx com 8 seções
- [x] Implementar cálculo de progresso (percentual de seções preenchidas)
- [x] Criar formulários para cada seção do plano
- [x] Implementar validação de campos obrigatórios
- [x] Adicionar auto-save a cada 30 segundos
- [x] Criar testes vitest para planos

## Fase 4: Ferramentas Estratégicas

### SWOT
- [x] Criar schema para tabela analise_swot
- [x] Implementar endpoint trpc.swot.obter
- [x] Implementar endpoint trpc.swot.salvar
- [x] Criar componente Swot.tsx com matriz interativa
- [x] Implementar drag-and-drop para itens SWOT (usando react-beautiful-dnd)
- [x] Adicionar validação de preenchimento

### Business Model Canvas
- [x] Criar schema para tabela canvas_modelo
- [x] Implementar endpoint trpc.canvas.obter
- [x] Implementar endpoint trpc.canvas.salvar
- [x] Criar componente Canvas.tsx com 9 blocos
- [x] Implementar edição inline dos blocos
- [x] Adicionar visualização de relacionamentos

### Análise de Risco
- [x] Criar schema para tabela analise_risco
- [x] Implementar endpoint trpc.risco.listar
- [x] Implementar endpoint trpc.risco.criar
- [x] Implementar endpoint trpc.risco.atualizar
- [x] Criar componente de matriz de risco (probabilidade x impacto)
- [x] Implementar cálculo de risco total

### Cronograma
- [x] Criar schema para tabela cronograma
- [x] Implementar endpoints CRUD para cronograma
- [x] Criar componente de timeline/gantt (TimelineGantt.tsx)
- [x] Implementar rastreamento de tarefas

## Fase 5: Módulo Financeiro

- [x] Criar schema para tabela dados_financeiros
- [x] Implementar cálculo de VPL (Valor Presente Líquido)
- [x] Implementar cálculo de TIR (Taxa Interna de Retorno)
- [x] Implementar cálculo de Payback
- [x] Implementar cálculo de Fluxo de Caixa
- [x] Implementar cálculo de DRE (Demonstração de Resultado)
- [x] Implementar cálculo de Balanço Patrimonial
- [ ] Criar componente SecaoFinanceira.tsx
- [ ] Implementar gráficos de projeção financeira
- [x] Criar testes vitest para cálculos financeiros

## Fase 6: Gamificação

- [x] Criar schema para tabelas pontuacao_usuarios, conquistas, usuarios_conquistas, historico_pontos
- [x] Implementar endpoint trpc.gamificacao.pontuacao
- [x] Implementar endpoint trpc.gamificacao.ranking
- [x] Implementar endpoint trpc.gamificacao.conquistas
- [x] Implementar lógica de adição de pontos (interno)
- [x] Criar sistema de níveis (1000 XP por nível)
- [x] Criar 10+ conquistas (ex: "Primeira Seção", "Plano Completo", "Líder de Turma")
- [ ] Implementar trigger de conquistas ao concluir seções
- [ ] Criar componente Ranking.tsx
- [ ] Criar componente Conquistas.tsx
- [ ] Criar componente Pontuacao.tsx (exibição de pontos/nível)
- [ ] Implementar animações ao ganhar pontos
- [x] Criar testes vitest para gamificação

## Fase 7: Gestão de Turmas

- [ ] Criar schema para tabelas turmas e matriculas
- [ ] Implementar endpoint trpc.turmas.criar (apenas professor)
- [ ] Implementar endpoint trpc.turmas.listar
- [ ] Implementar endpoint trpc.turmas.obterPorId
- [ ] Implementar endpoint trpc.turmas.atualizar
- [ ] Implementar endpoint trpc.turmas.matricular
- [ ] Implementar endpoint trpc.turmas.removerAluno
- [ ] Criar página de Gerenciamento de Turmas
- [ ] Criar formulário de criação de turma
- [ ] Criar lista de alunos por turma
- [ ] Implementar importação em lote de alunos (CSV/Excel)
- [ ] Criar testes vitest para turmas

## Fase 8: Notificações Automáticas

- [x] Criar schema para tabela notificacoes
- [x] Implementar endpoint trpc.notificacoes.listar
- [x] Implementar endpoint trpc.notificacoes.marcarComoLida
- [ ] Implementar trigger de notificação ao concluir seção
- [ ] Implementar trigger de notificação ao ganhar conquista
- [x] Criar componente Notificacao.tsx (NotificationCenter.tsx com dropdown)
- [ ] Implementar Socket.io para notificações em tempo real
- [x] Implementar badge de notificações não lidas
- [ ] Criar testes vitest para notificações

## Fase 9: Chat em Tempo Real

- [ ] Criar schema para tabela mensagens
- [ ] Implementar Socket.io para chat
- [ ] Implementar endpoint trpc.chat.listar
- [ ] Implementar endpoint trpc.chat.enviar
- [ ] Implementar endpoint trpc.chat.deletar
- [ ] Criar componente Chat.tsx
- [ ] Implementar scroll automático para mensagens novas
- [ ] Implementar indicador de digitação
- [ ] Implementar upload de arquivos em mensagens
- [ ] Implementar reações a mensagens
- [ ] Criar testes vitest para chat

## Fase 10: Exportação de Relatórios

- [x] Implementar exportação em PDF (docx)
- [ ] Implementar exportação em Excel (exceljs)
- [ ] Implementar exportação em Word (docx)
- [x] Criar endpoint trpc.relatorios.exportarPDF
- [ ] Criar endpoint trpc.relatorios.exportarExcel
- [ ] Criar endpoint trpc.relatorios.exportarWord
- [ ] Criar componente Exportacao.tsx
- [x] Implementar opções de exportação (incluir capa, sumário, gráficos, tabelas)
- [ ] Implementar fila de processamento para relatórios grandes
- [x] Criar testes vitest para exportação

## Fase 11: Captação de Recursos

- [ ] Criar schema para tabela captacao_recursos
- [ ] Implementar endpoint trpc.captacao.listar
- [ ] Implementar endpoint trpc.captacao.criar
- [ ] Implementar endpoint trpc.captacao.atualizar
- [ ] Criar componente CaptacaoRecursos.tsx
- [ ] Implementar filtros por tipo (edital, Lei Rouanet, crowdfunding, etc.)
- [ ] Implementar integração com APIs de editais (SALIC, etc.)
- [ ] Criar testes vitest para captação

## Fase 12: Tema Institucional

- [ ] Criar schema para tabela temas
- [ ] Implementar endpoint trpc.tema.obter
- [ ] Implementar endpoint trpc.tema.salvar
- [ ] Criar componente ThemeConfig.tsx
- [ ] Implementar seletor de cores (primária, secundária, destaque, fundo, texto)
- [ ] Implementar seletor de fontes (principal, títulos)
- [ ] Implementar upload de logotipo
- [ ] Implementar upload de banner
- [ ] Implementar aplicação dinâmica de tema em toda a aplicação
- [ ] Implementar geração de CSS dinâmico
- [ ] Criar testes vitest para tema

## Fase 13: Assistente Inteligente

- [ ] Implementar integração com LLM (OpenAI/Anthropic)
- [ ] Criar endpoint trpc.assistente.sugerir (sugerir conteúdo para seção)
- [ ] Criar endpoint trpc.assistente.analisar (analisar consistência do plano)
- [ ] Criar endpoint trpc.assistente.feedback (gerar feedback personalizado)
- [ ] Criar componente de chat com assistente
- [ ] Implementar streaming de respostas
- [ ] Implementar histórico de conversa
- [ ] Criar testes vitest para assistente

## Fase 14: Acompanhamento de Progresso (Professor)

- [ ] Criar dashboard de progresso por aluno
- [ ] Implementar gráficos de progresso (seções completas, pontos, nível)
- [ ] Implementar filtros por turma
- [ ] Implementar exportação de relatório de progresso
- [ ] Criar testes vitest para acompanhamento

## Fase 15: Testes e Qualidade

- [ ] Criar testes vitest para todos os endpoints tRPC
- [ ] Criar testes vitest para componentes principais
- [ ] Implementar testes de integração
- [ ] Implementar testes de permissões
- [ ] Implementar testes de validação de dados
- [ ] Criar testes de performance
- [ ] Configurar CI/CD (GitHub Actions)

## Fase 16: Documentação e Deploy

- [ ] Criar manual do usuário (PDF)
- [ ] Criar guia de instalação
- [ ] Criar referência da API
- [ ] Criar manual de tema
- [ ] Preparar scripts de instalação (Linux, Windows)
- [ ] Preparar docker-compose.yml
- [ ] Preparar .env.example
- [ ] Criar README.md completo
- [ ] Fazer deploy em staging
- [ ] Fazer deploy em produção

---

## Resumo de Funcionalidades

| Funcionalidade | Status | Prioridade |
|---|---|---|
| Autenticação e Permissões | ⬜ | 🔴 Alta |
| Dashboards por Perfil | ⬜ | 🔴 Alta |
| Elaboração do Plano (8 seções) | ⬜ | 🔴 Alta |
| Mapa de Progresso | ⬜ | 🔴 Alta |
| SWOT | ⬜ | 🟡 Média |
| Business Model Canvas | ⬜ | 🟡 Média |
| Módulo Financeiro (VPL, TIR, etc.) | ⬜ | 🔴 Alta |
| Gamificação | ⬜ | 🟡 Média |
| Gestão de Turmas | ⬜ | 🔴 Alta |
| Notificações Automáticas | ⬜ | 🟡 Média |
| Chat em Tempo Real | ⬜ | 🟡 Média |
| Exportação de Relatórios | ⬜ | 🟡 Média |
| Captação de Recursos | ⬜ | 🟢 Baixa |
| Tema Institucional | ⬜ | 🟡 Média |
| Assistente Inteligente | ⬜ | 🟢 Baixa |

---

**Legenda**: ⬜ Não iniciado | 🟨 Em progresso | ✅ Completo


## Fase 10: Gráficos Financeiros Interativos

- [x] Criar componente FinancialDashboard com Recharts
- [x] Implementar gráfico de Fluxo de Caixa (AreaChart)
- [x] Implementar gráfico de DRE (BarChart)
- [x] Implementar gráfico de Indicadores (BarChart)
- [x] Implementar gráfico de Composição de Custos (PieChart)
- [x] Adicionar análise de cenários (Pessimista, Base, Otimista)
- [x] Criar página FinancialAnalysis.tsx
- [x] Adicionar rota /financial-analysis
- [x] Criar testes para componentes
- [x] Implementar indicadores de saúde financeira

## Fase 10.1: Personalização de Capa de Relatórios

- [x] Criar schema para armazenar URLs de logótipos (empresa e instituição)
- [ ] Implementar endpoint para upload de logótipo
- [x] Integrar logótipos na capa do documento Word
- [x] Adicionar opções de personalização (cores, fontes, posição do logo)
- [x] Implementar validação de imagens (tamanho, formato)
- [ ] Criar componente de preview de capa
- [x] Adicionar suporte a temas de capa (padrão, minimalista, corporativo)
- [x] Criar testes vitest para personalização de capa
