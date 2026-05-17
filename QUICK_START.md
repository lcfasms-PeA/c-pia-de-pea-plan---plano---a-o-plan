# 🚀 QUICK START - PeA-Plan Web Deployment

> Este arquivo é um guia rápido de 10 passos para rodar a aplicação localmente

## ⚡ 10 Passos para Rodar Localmente

### 1️⃣ Preparação Inicial (5 minutos)

```bash
# Abra um terminal na raiz do projeto
cd "d:\LCFA_Diversos\GP - Grmt de Prjts\Pgrogramas PN PE GP etc\SPPLAN\Git_Hub_PeA_Plan\c-pia-de-pea-plan---plano---a-o-plan"

# Copie o template de variáveis de ambiente
cp .env.example .env

# Abra .env em um editor (ex: VS Code)
code .env
```

### 2️⃣ Configurar Variáveis de Ambiente (10 minutos)

Edite o arquivo `.env` que foi criado com:

```env
# MÍNIMO NECESSÁRIO PARA RODAR:
DATABASE_URL=mysql://root:senha123@localhost:3306/pea_plan_dev
JWT_SECRET=abc123def456ghi789jkl012mno345pqr678stu
VITE_APP_ID=pea-plan-local-dev

# Para OAuth (pode usar valores mock por enquanto):
OAUTH_SERVER_URL=http://localhost:8080
OWNER_OPEN_ID=dev-owner-001

# Para LLM (pode usar valores mock):
BUILT_IN_FORGE_API_URL=http://localhost:5000/api
BUILT_IN_FORGE_API_KEY=dev-api-key

# Servidor
NODE_ENV=development
```

> **Nota**: Se não tiver MySQL/OAuth/Forge locais, use valores genéricos por enquanto. Você pode usar um banco SQLite simulado para testes iniciais.

### 3️⃣ Instalar MySQL (se não tiver)

**Opção A: Docker (Recomendado)**
```bash
docker run --name pea-plan-mysql \
  -e MYSQL_ROOT_PASSWORD=senha123 \
  -e MYSQL_DATABASE=pea_plan_dev \
  -p 3306:3306 \
  -d mysql:8.0

# Verificar se está rodando
docker ps | grep pea-plan-mysql
```

**Opção B: Windows Native**
1. Baixe em: https://dev.mysql.com/downloads/mysql/
2. Instale com valores padrão
3. Crie banco: `CREATE DATABASE pea_plan_dev;`

**Opção C: MySQL Online (para testes rápidos)**
- Use um serviço como: PlanetScale, AWS RDS free tier

### 4️⃣ Instalar Dependências (2-3 minutos)

```bash
# Se não tiver pnpm, instale:
npm install -g pnpm

# Instalar todas as dependências
pnpm install

# Verificar se funcionou
pnpm list | head -20
```

### 5️⃣ Configurar Banco de Dados (1-2 minutos)

```bash
# Criar tabelas e rodar migrations
pnpm run db:push

# Você deve ver: "✓ Generated SQL migrations"
# Se tiver erro, verifique DATABASE_URL no .env
```

### 6️⃣ Rodar Testes (1-2 minutos - OPCIONAL mas recomendado)

```bash
# Executar suite de testes
pnpm run test

# Esperado: ✅ 82 testes passando
```

### 7️⃣ Iniciar Servidor em Desenvolvimento (5 segundos)

```bash
# Inicia backend Express + frontend Vite com hot reload
pnpm run dev

# Você deve ver:
# ✓ [1] Server running on http://localhost:3000/
# ✓ [2] VITE @ 4.x ready
```

### 8️⃣ Acessar no Navegador (1 minuto)

1. Abra: **http://localhost:3000**
2. Você deve ver a página de login
3. Credenciais de teste (após seed):
   - Email: `admin@example.com`
   - Senha: `senha123`

### 9️⃣ Testar Funcionalidades (5 minutos)

```
✓ Login funcionando
✓ Dashboard mostrando dados
✓ Criar novo plano
✓ Editar seções do plano
✓ Tema claro/escuro alternando
✓ Não há erros no console do navegador (F12)
```

### 🔟 Para Build de Produção (5 minutos)

```bash
# Compilar frontend + bundle backend
pnpm run build

# Inicia em modo produção
pnpm run start

# Acesso: http://localhost:3000 (servindo arquivos estáticos)
```

---

## ✅ Checklist Rápido

- [ ] `.env` criado e preenchido
- [ ] MySQL rodando e acessível
- [ ] `pnpm install` completado
- [ ] `pnpm run db:push` sem erros
- [ ] `pnpm run dev` rodando em localhost:3000
- [ ] Login funciona
- [ ] Nenhum erro crítico no console

## 🆘 Troubleshooting

### Erro: "DATABASE_URL is required"
```bash
# Verifique se .env existe e tem DATABASE_URL
cat .env | grep DATABASE_URL
```

### Erro: "MySQL connection refused"
```bash
# Teste conexão
mysql -h localhost -u root -p -e "USE pea_plan_dev; SHOW TABLES;"
```

### Erro: "Port 3000 already in use"
```bash
# Aplicação tentará portas 3000-3020 automaticamente
# Ou mude em .env: PORT=3001
```

### Erro: "vite build fails"
```bash
# Limpe cache
rm -rf dist node_modules/.vite
pnpm install
pnpm run build
```

### Frontend não carrega componentes
```bash
# Limpe cache do navegador
# Ctrl+Shift+Delete (em Chrome/Edge)
# Ou pressione F12 → Application → Clear Site Data
```

---

## 📚 Documentação Completa

Para mais detalhes, consulte:
- [DEPLOYMENT_PLAN.md](./DEPLOYMENT_PLAN.md) - Plano completo de deployment
- [ARCHITECTURE.md](./ARCHITECTURE.md) - Arquitetura técnica
- [ANALYSIS_REPORT.md](./ANALYSIS_REPORT.md) - Status do projeto
- [docs/manual_instalacao.md](./docs/manual_instalacao.md) - Manual original

---

## 🎯 Tempos Esperados

| Atividade | Tempo | Nota |
|-----------|-------|------|
| Leitura deste guia | 5 min | Você está aqui ✓ |
| Preparação inicial | 5 min | Clone/setup |
| Configurar `.env` | 10 min | Obter credenciais |
| Instalar MySQL | 5-20 min | Depende do método |
| `pnpm install` | 2-5 min | Primeira vez é mais lenta |
| `pnpm run db:push` | 1-2 min | Criar tabelas |
| `pnpm run dev` | 30 seg | Start |
| **TOTAL** | **~30-60 min** | Até estar 100% funcionando |

---

## 🚨 Aviso Importante

⚠️ Este é um **guia de desenvolvimento local**. Para deployment em produção, veja [DEPLOYMENT_PLAN.md](./DEPLOYMENT_PLAN.md).

**Pontos críticos em produção**:
- Use senhas fortes
- Configure HTTPS/SSL
- Ative backups automáticos
- Configure rate limiting
- Monitore logs e performance

---

**Última atualização**: 16 de maio de 2026
**Status**: ✅ Pronto para desenvolvimento local
