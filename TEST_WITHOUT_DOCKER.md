# ⚡ ALTERNATIVA: Testar SEM Docker (Local)

> Se Docker não está disponível, use este guia para testar PeA-Plan localmente

## 🎯 Objetivo

Testar a aplicação sem Docker, usando MySQL local ou online.

---

## 📋 Opção 1: Usar MySQL Local (Windows)

### Passo 1: Instalar MySQL

**Via Chocolatey** (se tiver):
```bash
choco install mysql
```

**Ou baixar direto**:
1. Acesse: https://dev.mysql.com/downloads/mysql/
2. Baixe MySQL Server 8.0
3. Execute instalador
4. Configure com senha padrão: `root`

### Passo 2: Criar banco de dados

```bash
# Conectar ao MySQL
mysql -u root -p
# Digite a senha: root

# Criar banco
CREATE DATABASE pea_plan_dev;
EXIT;
```

### Passo 3: Criar .env

```bash
# Na raiz do projeto
cp .env.example .env
```

Edite `.env` com:
```env
DATABASE_URL=mysql://root:root@localhost:3306/pea_plan_dev
JWT_SECRET=teste-local-secret-key-change-in-production
VITE_APP_ID=pea-plan-local-test
OAUTH_SERVER_URL=http://localhost:8080
OWNER_OPEN_ID=local-test-owner
BUILT_IN_FORGE_API_URL=http://localhost:5000/api
BUILT_IN_FORGE_API_KEY=teste-api-key
NODE_ENV=development
```

### Passo 4: Rodar aplicação

```bash
# Instalar dependências
pnpm install

# Criar tabelas
pnpm run db:push

# Iniciar
pnpm run dev
```

**Acesso**: http://localhost:3000

---

## 📋 Opção 2: Usar MySQL em Nuvem (Sem instalação local)

### Usando PlanetScale (Recomendado)

**Passo 1**: Criar conta gratuita em https://planetscale.com

**Passo 2**: Criar banco
1. New Database → `pea-plan-dev`
2. Copie a conexão MySQL

**Passo 3**: Configurar .env

```env
DATABASE_URL=mysql://[user]:[password]@[host]/pea-plan-dev?sslaccept=strict
JWT_SECRET=teste-nuvem-secret-key
VITE_APP_ID=pea-plan-cloud-test
OAUTH_SERVER_URL=http://localhost:8080
OWNER_OPEN_ID=cloud-test-owner
BUILT_IN_FORGE_API_URL=http://localhost:5000/api
BUILT_IN_FORGE_API_KEY=teste-api-key
NODE_ENV=development
```

**Passo 4**: Rodar

```bash
pnpm install
pnpm run db:push
pnpm run dev
```

---

## 📋 Opção 3: Usar Docker Compose sem Docker Desktop

Se você tem Docker mas não quer Docker Desktop:

```bash
# Instale Docker Engine diretamente (Linux/WSL)
# Ou use Podman como alternativa

podman-compose up --build
```

---

## ✅ Checklist Local

- [ ] MySQL está rodando
- [ ] `.env` configurado com DATABASE_URL
- [ ] `pnpm install` completado
- [ ] `pnpm run db:push` rodou sem erros
- [ ] `pnpm run test` passou (82 testes)
- [ ] `pnpm run dev` iniciou em localhost:3000
- [ ] Login page apareceu no navegador

---

## 🧪 Testar Funcionalidades

Quando local estiver rodando:

1. **Abra** http://localhost:3000
2. **Você deve ver** página de login
3. **Dados iniciais**: Sem seed, banco vazio (OK)
4. **Console**: Sem erros críticos
5. **API**: Endpoints em `/api/trpc/*` devem responder

---

## 🔄 Workflow Desenvolvimento Local

```bash
# Terminal 1 - Banco de dados
# (deixe rodando)
# Se usando Docker local:
docker run -d -e MYSQL_ROOT_PASSWORD=root \
  -e MYSQL_DATABASE=pea_plan_dev \
  -p 3306:3306 mysql:8.0

# Terminal 2 - Aplicação
cd pea-plan
pnpm run dev

# Terminal 3 - Outro projeto (opcional)
# Use livremente
```

---

## 📊 Comparação: Local vs Docker

| Aspecto | Local | Docker |
|---------|-------|--------|
| **Setup** | 10-15 min | 20-30 min |
| **Velocidade** | ⚡ Rápido | 🔻 Mais lento |
| **Isolamento** | ❌ Não | ✅ Sim |
| **Produção** | ⚠️ Diferente | ✅ Igual |
| **Diskspace** | Menos | Mais (imagens) |
| **Fácil cleanup** | ⚠️ Manual | ✅ `down -v` |

---

## 🆘 Problemas Comuns

### "MySQL connection refused"
```bash
# Verifique se MySQL está rodando
mysql --version
mysql -u root -p -e "SELECT 1;"
```

### "database doesn't exist"
```bash
# Crie o banco
mysql -u root -p -e "CREATE DATABASE pea_plan_dev;"
```

### "pnpm: command not found"
```bash
npm install -g pnpm
pnpm --version
```

### "Port 3000 already in use"
```bash
# Use outra porta
PORT=3001 pnpm run dev
# Acesse: http://localhost:3001
```

---

## ✨ Próximos Passos

1. ✅ Escolher Opção 1, 2 ou 3 acima
2. ✅ Seguir passos
3. ✅ Verificar http://localhost:3000
4. ✅ Reportar sucesso

**Tempo total**: 15-30 min (primeiro setup)

---

**Quando pronto para produção**: Volte ao Docker (DOCKER_SETUP.md)
