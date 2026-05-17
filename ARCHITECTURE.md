# PeA-Plan - Arquitetura Completa

## 📋 Visão Geral

**PeA-Plan** é uma plataforma web educacional para elaboração de planos de negócios, desenvolvida com exemplo do SPPLAN (SEBRAE/FIESP). A plataforma suporta múltiplos perfis de usuários (admin, professor, aluno) com controle granular de permissões, ferramentas estratégicas integradas, gamificação e comunicação em tempo real.

### Stack Tecnológico

- **Frontend**: React 19 + Tailwind CSS 4 + TypeScript + tRPC
- **Backend**: Express.js + Node.js + tRPC
- **Banco de Dados**: PostgreSQL/MySQL com Drizzle ORM
- **Autenticação**: Manus OAuth + JWT
- **Tempo Real**: Socket.io (chat)
- **Relatórios**: PDF, Excel, Word (bibliotecas: pdfkit, exceljs, docx)
- **IA**: Integração com LLM para assistente inteligente

---

## 🗂️ Estrutura de Dados

### Tabelas Principais

#### 1. **instituicoes**
```sql
id (PK) | nome | tipo | cnpj | email | telefone | status | created_at
```
- Armazena informações de instituições de ensino
- Cada instituição tem sua própria configuração de tema

#### 2. **usuarios**
```sql
id (PK) | instituicao_id (FK) | nome | email | senha | papel | status | created_at
```
- Papéis: `admin_geral`, `coordenador`, `professor`, `aluno_individual`, `aluno_lider`, `aluno_editor`, `aluno_visualizador`
- Controle de permissões baseado em papel

#### 3. **turmas**
```sql
id (PK) | instituicao_id (FK) | professor_id (FK) | nome | tipo_inscricao | data_inicio | data_fim | status | created_at
```
- Agrupa alunos sob orientação de um professor
- Suporta diferentes tipos de inscrição

#### 4. **matriculas**
```sql
id (PK) | turma_id (FK) | aluno_id (FK) | data_matricula
```
- Relaciona alunos a turmas
- Constraint UNIQUE(turma_id, aluno_id)

#### 5. **planos**
```sql
id (PK) | usuario_id (FK) | turma_id (FK) | titulo | status | dados (JSONB) | created_at | updated_at
```
- Armazena planos de negócios (estrutura JSONB)
- 8 seções: descricao_empresa, produtos_servicos, estrutura_organizacional, plano_marketing, plano_operacional, estrutura_capitalizacao, plano_financeiro, sumario_executivo

#### 6. **pontuacao_usuarios**
```sql
id (PK) | usuario_id (FK, UNIQUE) | pontos | nivel | xp | medalhas | updated_at
```
- Gamificação: pontos, níveis, XP, medalhas

#### 7. **conquistas**
```sql
id (PK) | nome | descricao | icone | categoria | pontos_necessarios | secoes_completas | dias_antecipacao
```
- Define conquistas desbloqueáveis
- Categorias: seções_completas, pontos_atingidos, antecipação, etc.

#### 8. **usuarios_conquistas**
```sql
id (PK) | usuario_id (FK) | conquista_id (FK) | data_conquista
```
- Rastreia conquistas obtidas por usuários

#### 9. **historico_pontos**
```sql
id (PK) | usuario_id (FK) | pontos | motivo | data
```
- Auditoria de pontos ganhos/perdidos

#### 10. **temas**
```sql
id (PK) | instituicao_id (FK, UNIQUE) | cor_primaria | cor_secundaria | cor_destaque | cor_fundo | cor_texto | fonte_principal | fonte_titulos | logo_url | banner_url | created_at | updated_at
```
- Personalização visual por instituição

#### 11. **notificacoes**
```sql
id (PK) | usuario_id (FK) | titulo | mensagem | tipo | gravidade | lida | created_at
```
- Notificações automáticas ao professor

#### 12. **mensagens**
```sql
id (PK) | turma_id (FK) | usuario_id (FK) | conteudo | arquivo_url | created_at
```
- Chat em tempo real por turma

#### 13. **analise_swot**
```sql
id (PK) | plano_id (FK) | forca | fraqueza | oportunidade | ameaca | created_at | updated_at
```
- Análise SWOT interativa

#### 14. **canvas_modelo**
```sql
id (PK) | plano_id (FK) | segmento_clientes | proposta_valor | canais | relacionamento | fluxo_receita | recursos | atividades | parceiros | estrutura_custos | created_at | updated_at
```
- Business Model Canvas

#### 15. **analise_risco**
```sql
id (PK) | plano_id (FK) | descricao | probabilidade | impacto | mitigacao | created_at | updated_at
```
- Análise de riscos

#### 16. **cronograma**
```sql
id (PK) | plano_id (FK) | tarefa | data_inicio | data_fim | responsavel_id (FK) | status | created_at
```
- Cronograma de implementação

#### 17. **captacao_recursos**
```sql
id (PK) | plano_id (FK) | tipo | nome | descricao | valor | link | created_at
```
- Fontes de financiamento (editais, Lei Rouanet, etc.)

---

## 🔐 Modelo de Permissões

### Papéis e Permissões

| Papel | Permissões |
|-------|-----------|
| **admin_geral** | Acesso total ao sistema, gerenciar instituições, usuários, turmas |
| **coordenador** | Gerenciar instituição, turmas, usuários |
| **professor** | Criar/editar turmas, acompanhar alunos, avaliar planos |
| **aluno_individual** | Criar/editar seu próprio plano |
| **aluno_lider** | Editar plano do grupo, coordenar alunos |
| **aluno_editor** | Editar plano do grupo |
| **aluno_visualizador** | Visualizar plano do grupo (somente leitura) |

### Middleware de Autenticação

```typescript
// publicProcedure: sem autenticação
// protectedProcedure: requer usuário autenticado
// adminProcedure: requer papel admin_geral
// professorProcedure: requer papel professor
// alunoProcedure: requer papel aluno_*
```

---

## 📊 Fluxos Principais

### 1. Autenticação e Login
```
Usuário → Login → OAuth Manus → JWT + Session Cookie → Dashboard
```

### 2. Elaboração do Plano
```
Aluno → Criar Plano → Preencher 8 Seções → Calcular Progresso → Salvar
```

### 3. Gamificação
```
Ação (seção concluída) → +Pontos → Verificar Nível → Verificar Conquistas → Notificar
```

### 4. Notificação ao Professor
```
Aluno Conclui Seção → Trigger → Criar Notificação → Professor Recebe
```

### 5. Chat em Tempo Real
```
Aluno/Professor → Enviar Mensagem → Socket.io → Broadcast → Atualizar UI
```

---

## 🎨 Componentes Frontend

### Estrutura de Diretórios

```
client/src/
├── pages/
│   ├── Home.tsx
│   ├── Login.tsx
│   ├── Dashboard.tsx
│   ├── PlanoEditor.tsx
│   ├── Turmas.tsx
│   └── Relatorios.tsx
├── components/
│   ├── DashboardLayout.tsx (layout principal)
│   ├── layout/
│   │   ├── Header.tsx
│   │   ├── Sidebar.tsx
│   │   └── Footer.tsx
│   ├── dashboard/
│   │   ├── DashboardAdmin.tsx
│   │   ├── DashboardProfessor.tsx
│   │   └── DashboardAluno.tsx
│   ├── plano/
│   │   ├── MapaPlano.tsx (visualização de progresso)
│   │   ├── Canvas.tsx (Business Model Canvas)
│   │   ├── Swot.tsx (Análise SWOT)
│   │   ├── SecaoFinanceira.tsx
│   │   └── EditorPlano.tsx
│   ├── gamificacao/
│   │   ├── Ranking.tsx
│   │   ├── Conquistas.tsx
│   │   └── Pontuacao.tsx
│   ├── captacao/
│   │   └── CaptacaoRecursos.tsx
│   ├── colaboracao/
│   │   └── Chat.tsx
│   ├── relatorios/
│   │   └── Exportacao.tsx
│   ├── notificacoes/
│   │   └── Notificacao.tsx
│   ├── theme/
│   │   └── ThemeConfig.tsx
│   └── ui/ (shadcn/ui components)
├── hooks/
│   ├── useAuth.ts
│   ├── usePlano.ts
│   ├── useGamificacao.ts
│   └── useNotificacoes.ts
├── contexts/
│   ├── ThemeContext.tsx
│   └── PlanoContext.tsx
├── lib/
│   └── trpc.ts
└── services/
    ├── api.ts
    └── auth.ts
```

---

## 🔌 Endpoints da API (tRPC)

### Autenticação
- `auth.me` - Obter usuário logado
- `auth.login` - Login
- `auth.logout` - Logout

### Usuários
- `usuarios.listar` - Listar usuários da instituição
- `usuarios.criar` - Criar novo usuário
- `usuarios.atualizar` - Atualizar usuário
- `usuarios.deletar` - Deletar usuário

### Turmas
- `turmas.listar` - Listar turmas
- `turmas.criar` - Criar turma
- `turmas.obterPorId` - Obter turma
- `turmas.matricular` - Matricular aluno
- `turmas.removerAluno` - Remover aluno

### Planos
- `planos.listar` - Listar planos do usuário
- `planos.criar` - Criar novo plano
- `planos.atualizar` - Atualizar plano
- `planos.obterPorId` - Obter plano
- `planos.progresso` - Calcular progresso
- `planos.exportar` - Exportar em PDF/Excel/Word

### Gamificação
- `gamificacao.pontuacao` - Obter pontuação do usuário
- `gamificacao.ranking` - Obter ranking da turma
- `gamificacao.conquistas` - Listar conquistas
- `gamificacao.adicionarPontos` - Adicionar pontos (interno)

### Tema
- `tema.obter` - Obter tema da instituição
- `tema.salvar` - Salvar tema

### Notificações
- `notificacoes.listar` - Listar notificações
- `notificacoes.marcarComoLida` - Marcar como lida
- `notificacoes.deletar` - Deletar notificação

### Chat
- `chat.listar` - Listar mensagens da turma
- `chat.enviar` - Enviar mensagem
- `chat.deletar` - Deletar mensagem

### Relatórios
- `relatorios.exportarPDF` - Exportar plano em PDF
- `relatorios.exportarExcel` - Exportar em Excel
- `relatorios.exportarWord` - Exportar em Word

### Ferramentas Estratégicas
- `swot.obter` - Obter análise SWOT
- `swot.salvar` - Salvar análise SWOT
- `canvas.obter` - Obter Business Model Canvas
- `canvas.salvar` - Salvar Canvas
- `risco.listar` - Listar análises de risco
- `risco.criar` - Criar análise de risco

### Captação de Recursos
- `captacao.listar` - Listar fontes de financiamento
- `captacao.criar` - Criar fonte
- `captacao.atualizar` - Atualizar fonte

### Assistente Inteligente
- `assistente.sugerir` - Sugerir conteúdo
- `assistente.analisar` - Analisar consistência
- `assistente.feedback` - Gerar feedback

---

## 🔄 Fluxo de Dados

### Criação de Plano
```
1. Aluno clica "Novo Plano"
2. Frontend chama trpc.planos.criar
3. Backend cria registro em planos (JSONB vazio)
4. Retorna plano_id
5. Frontend redireciona para editor
6. Aluno preenche seções
7. Frontend salva cada seção via trpc.planos.atualizar
8. Backend atualiza dados JSONB
9. Backend calcula progresso
10. Se seção completa → trigger notificação ao professor
```

### Gamificação
```
1. Aluno conclui seção
2. Backend dispara trpc.gamificacao.adicionarPontos
3. Sistema adiciona pontos
4. Verifica se atingiu novo nível
5. Verifica se desbloqueou conquista
6. Se conquista → cria notificação
7. Frontend atualiza pontuação em tempo real
```

### Notificações
```
1. Evento disparado (seção concluída, conquista)
2. Backend cria registro em notificacoes
3. Socket.io emite evento para professor conectado
4. Professor recebe notificação em tempo real
5. Professor pode marcar como lida
```

---

## 📱 Responsividade

- **Desktop**: Layout completo com sidebar
- **Tablet**: Sidebar colapsável
- **Mobile**: Sidebar em drawer, navegação em hamburger menu

---

## 🔒 Segurança

1. **Autenticação**: Manus OAuth + JWT
2. **Autorização**: Middleware de permissões por papel
3. **Validação**: Zod schemas em tRPC
4. **CORS**: Configurado para domínios permitidos
5. **HTTPS**: Obrigatório em produção
6. **Senhas**: Hash com bcrypt (10 rounds)
7. **Dados Sensíveis**: Não armazenar em localStorage

---

## 🚀 Deployment

- **Frontend**: Vercel, Netlify ou Manus Hosting
- **Backend**: Node.js em container Docker
- **Banco de Dados**: PostgreSQL gerenciado
- **Storage**: S3 para uploads (logotipo, relatórios)

---

## �️ Instalação e execução

- `pnpm install` — instalar dependências
- `pnpm run dev` — iniciar em modo desenvolvimento (Vite + servidor Express)
- `pnpm run build` — gerar `dist/public` e `dist/index.js`
- `pnpm run start` — iniciar em produção e servir o frontend estático de `dist/public`

Observações:
- os scripts usam `cross-env` para compatibilidade Windows/Linux
- `server/_core/vite.ts` foi ajustado para servir `dist/public` em produção

---

## 📈 Escalabilidade

1. **Índices de BD**: Criar índices em instituicao_id, usuario_id, turma_id
2. **Cache**: Redis para sessões e ranking
3. **Queue**: Bull para processamento de relatórios
4. **CDN**: CloudFlare para assets estáticos
5. **Load Balancer**: Nginx para múltiplas instâncias

---

## 📚 Documentação Adicional

- [Guia de Instalação](./docs/manual_instalacao.md)

> Outros manuais planejados: `manual_usuario.md`, `api_reference.md`, `manual_tema.md`

---

**Versão**: 1.0.0  
**Licença**: CC BY-SA 4.0  
**Última Atualização**: Maio 2026
