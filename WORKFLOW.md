# 🔄 WORKFLOW DE SETUP - Fluxo Visual

## Fluxo Geral do Projeto

```
┌─────────────────────────────────────────────────────────────────────┐
│                   PeA-Plan Web Deployment Workflow                  │
└─────────────────────────────────────────────────────────────────────┘

FASE 1: PREPARAÇÃO
┌──────────────────────┐
│ Obter Credenciais    │
│ - OAuth Manus        │
│ - API Keys LLM       │
│ - Banco de dados     │
└──────────────────────┘
           ↓
┌──────────────────────┐
│ Criar .env           │
│ cp .env.example .env │
│ Editar com valores   │
└──────────────────────┘
           ↓

FASE 2: AMBIENTE
┌──────────────────────┐
│ Instalar MySQL       │
│ docker run mysql:8.0 │
│ ou local/cloud       │
└──────────────────────┘
           ↓
┌──────────────────────┐
│ Instalar Node Deps   │
│ pnpm install         │
└──────────────────────┘
           ↓
┌──────────────────────┐
│ Criar Banco de Dados │
│ pnpm run db:push     │
└──────────────────────┘
           ↓

FASE 3: VALIDAÇÃO LOCAL
┌──────────────────────┐
│ Rodar Testes         │
│ pnpm run test        │
│ (82 testes)          │
└──────────────────────┘
           ↓
┌──────────────────────┐
│ Iniciar Dev Server   │
│ pnpm run dev         │
│ localhost:3000       │
└──────────────────────┘
           ↓
┌──────────────────────┐
│ Testar Funcionalidades
│ - Login              │
│ - CRUD Planos        │
│ - Dashboards         │
└──────────────────────┘
           ↓

FASE 4: BUILD PRODUÇÃO
┌──────────────────────┐
│ Compilar             │
│ pnpm run build       │
│ Gera dist/           │
└──────────────────────┘
           ↓
┌──────────────────────┐
│ Testar Build         │
│ pnpm run start       │
│ localhost:3000       │
└──────────────────────┘
           ↓

FASE 5: DEPLOY
┌──────────────────────┐
│ Escolher Plataforma  │
│ Heroku/AWS/Azure/VPS │
└──────────────────────┘
           ↓
┌──────────────────────┐
│ Configurar CI/CD     │
│ GitHub Actions       │
│ ou similar           │
└──────────────────────┘
           ↓
┌──────────────────────┐
│ Deploy               │
│ git push → web       │
│ yourdomain.com       │
└──────────────────────┘
           ↓

FASE 6: COMPLETUDE
┌──────────────────────┐
│ Melhorias            │
│ - Gamificação UI     │
│ - Chat Real-time     │
│ - E2E Tests          │
└──────────────────────┘
           ↓
┌──────────────────────┐
│ ✅ PRODUÇÃO PRONTO   │
│ 100% Completo        │
└──────────────────────┘
```

---

## Diagrama de Decisão

```
                          COMEÇAR
                            ↓
                   ┌─────────────────┐
                   │ .env existe?    │
                   └─────────────────┘
                    SIM ↓        ↑ NÃO
                        │        │
                  [criar .env]   │
                        ↓        │
                   ┌─────────────────┐
                   │ .env validado?  │
                   └─────────────────┘
                    SIM ↓        ↑ NÃO
                        │        │
                   [validar]     │
                        ↓        │
                   ┌─────────────────┐
                   │ MySQL rodando?  │
                   └─────────────────┘
                    SIM ↓        ↑ NÃO
                        │        │
                   [instalar]    │
                        ↓        │
                   ┌─────────────────┐
                   │ npm install ok? │
                   └─────────────────┘
                    SIM ↓        ↑ NÃO
                        │        │
                   [reinstalar]  │
                        ↓        │
                   ┌─────────────────┐
                   │ db:push ok?     │
                   └─────────────────┘
                    SIM ↓        ↑ NÃO
                        │        │
                   [verificar]   │
                        ↓        │
                   ┌─────────────────┐
                   │ pnpm run dev ok?│
                   └─────────────────┘
                    SIM ↓        ↑ NÃO
                        │        │
                   [debugar]     │
                        ↓        │
                   ✅ SUCESSO ✅
```

---

## Árvore de Tarefas

```
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃ 🚀 SETUP PEA-PLAN WEB                  ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

├─ FASE 1: Preparação (2h)
│  ├─ Obter credenciais OAuth (30 min)
│  ├─ Obter credenciais LLM (30 min)
│  ├─ Configurar .env (15 min)
│  └─ Verificar MySQL (15 min)
│
├─ FASE 2: Instalação (1h)
│  ├─ pnpm install (5-10 min)
│  ├─ pnpm run check (5 min)
│  └─ pnpm run db:push (5-10 min)
│
├─ FASE 3: Validação (1.5h)
│  ├─ pnpm run test (15 min)
│  ├─ pnpm run dev (5 min)
│  ├─ Testar login (10 min)
│  ├─ Testar CRUD (10 min)
│  └─ Verificar console (10 min)
│
├─ FASE 4: Build (1h)
│  ├─ pnpm run build (15 min)
│  └─ pnpm run start (30 min)
│
├─ FASE 5: Deploy (3h)
│  ├─ Setup plataforma (1h)
│  ├─ CI/CD (1h)
│  └─ Deploy + testes (1h)
│
└─ FASE 6: Completude (1-2 semanas)
   ├─ Gamificação UI (1 dia)
   ├─ Chat real-time (1 dia)
   └─ Testes + otimizações (3-4 dias)

TOTAL: 4-5 dias para produção
       2-3 semanas para 100% completo
```

---

## Mapa de Dependências

```
┌─────────────────────────────────────────┐
│  .env Configurado                       │
└─────────────────────────────────────────┘
    ↓ (obrigatório para)
┌─────────────────────────────────────────┐
│  MySQL Acessível                        │
└─────────────────────────────────────────┘
    ↓ (obrigatório para)
┌─────────────────────────────────────────┐
│  pnpm install                           │
└─────────────────────────────────────────┘
    ├─→ (necessário para) ┌──────────────┐
    │                     │ pnpm run dev │
    │                     └──────────────┘
    │
    └─→ (necessário para) ┌──────────────┐
                          │ pnpm run    │
                          │ db:push      │
                          └──────────────┘
                              ↓
                          ┌──────────────┐
                          │ pnpm run    │
                          │ test         │
                          └──────────────┘
                              ↓
                          ┌──────────────┐
                          │ pnpm run    │
                          │ build        │
                          └──────────────┘
                              ↓
                          ┌──────────────┐
                          │ pnpm run    │
                          │ start        │
                          └──────────────┘
                              ↓
                          ┌──────────────┐
                          │ Deploy       │
                          │ (produção)   │
                          └──────────────┘
```

---

## Timeline Estimado

```
DIA 1 (4-5 horas)
┌─────────────────────────────────────────┐
│ 09:00 - Preparação (.env, credenciais)  │  1.5h
│ 10:30 - Instalar dependências           │  0.5h
│ 11:00 - Setup banco de dados            │  0.5h
│ 11:30 - Testes e validação              │  1.5h
│ 13:00 - ✅ Servidor local rodando       │
└─────────────────────────────────────────┘

DIA 2 (3-4 horas)
┌─────────────────────────────────────────┐
│ 09:00 - Build de produção               │  0.5h
│ 09:30 - Testar build                    │  0.5h
│ 10:00 - Setup plataforma de deploy      │  1h
│ 11:00 - CI/CD básico                    │  1h
│ 12:00 - ✅ Deploy em staging            │
└─────────────────────────────────────────┘

DIA 3 (1-2 horas)
┌─────────────────────────────────────────┐
│ 09:00 - Testes finais                   │  1h
│ 10:00 - Deploy em produção              │  0.5h
│ 10:30 - ✅ Aplicação LIVE               │
└─────────────────────────────────────────┘

SEMANA 2-3 (Opcional - Completude 100%)
┌─────────────────────────────────────────┐
│ Componentes de gamificação      (1 dia) │
│ Chat em tempo real              (1 dia) │
│ Testes E2E                      (2 dias)│
│ Otimizações finais              (1-2d) │
└─────────────────────────────────────────┘
```

---

## Checklist de Status

### ✅ Pré-requisitos
- [ ] Projeto clonado localmente
- [ ] Node.js v22+ instalado
- [ ] pnpm instalado globalmente
- [ ] Acesso a credenciais (OAuth, LLM, etc)

### 🔧 Setup Inicial
- [ ] .env criado e preenchido
- [ ] MySQL rodando
- [ ] pnpm install completado
- [ ] TypeScript check sem erros
- [ ] Migrations rodadas (pnpm run db:push)

### ✔️ Validação
- [ ] Testes passando (82/82)
- [ ] Dev server rodando
- [ ] Login funciona
- [ ] Planos CRUD funciona
- [ ] Nenhum erro no console

### 📦 Build & Deploy
- [ ] Build completado
- [ ] Start em produção funciona
- [ ] Plataforma escolhida
- [ ] CI/CD configurado
- [ ] Deploy testado em staging

### 🚀 Produção
- [ ] Deploy em produção realizado
- [ ] URL pública acessível
- [ ] SSL/TLS ativo
- [ ] Backups configurados
- [ ] Monitoramento ativo

### 🎨 Completude (Opcional)
- [ ] Componentes gamificação
- [ ] Chat real-time
- [ ] Testes E2E
- [ ] Performance otimizada
- [ ] Documentação final

---

## Instalações suportadas

- **Windows local**: `pnpm run install:windows`
- **Linux/macOS local ou VPS**: `pnpm run install:linux`
- **Verificação de ambiente**: `pnpm run install:prompt`
- **Docker**: use `docker compose up -d` quando o `docker-compose.yml` estiver configurado
- **PWA**: após iniciar a aplicação, instale pelo navegador ou use o prompt de instalação do app


## Comandos Rápidos

```bash
# Preparação
cp .env.example .env          # Criar .env
code .env                     # Editar variáveis

# Instalação local (Windows/Linux)
pnpm run install:windows      # Executar instalador Windows
pnpm run install:linux        # Executar instalador Linux/macOS
pnpm run install:prompt       # Verificar ambiente de instalação

# Instalação manual
pnpm install                  # Instalar deps
pnpm run db:push              # Criar banco

# Desenvolvimento
pnpm run dev                  # Iniciar dev
pnpm run test                 # Rodar testes
pnpm run check                # Verificar tipos

# Produção
pnpm run build                # Compilar
pnpm run start                # Iniciar prod
```


## Lista das Alterações

- Atualizado o fluxo de instalação para Windows e Linux/macOS com `install.bat` e `install.sh`.
- Adicionados scripts de instalador no `package.json`: `install:windows`, `install:linux` e `install:prompt`.
- Incluído `scripts/check-installer.js` para checar pré-requisitos sem executar o instalador completo.
- Documentação de instalação revisada em `QUICK_START.md`, `README_DOCUMENTATION.md` e `INTEGRATING_PWA_INSTALLERS.md`.
- Verificada a integração do PWA e a consistência do service worker/manifest com a estrutura atual do frontend.
- Confirmado que `pnpm exec vite build` gera `dist/public` e que o backend serve esses arquivos em produção.
- Validado o processo de banco de dados: criação/copiar `.env`, `pnpm run db:push`, e testes básicos após setup.
---

**Última atualização**: 20 de maio de 2026  
**Versão**: 1.1
