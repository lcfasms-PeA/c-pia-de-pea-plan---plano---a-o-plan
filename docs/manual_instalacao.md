# Manual de Instalação e Operação

Este guia apresenta 4 formas de instalar e executar o PeA-Plan:

1. Instalação em Windows (local)
2. Instalação online em VPS (Linux)
3. Instalação via Docker
4. Instalação/uso PWA

> Todas as opções assumem que o repositório está clonado na máquina onde a aplicação será instalada.

---

## Pré-requisitos comuns

- Node.js 22.x ou superior
- npm 10.x ou superior
- pnpm 10.x ou superior
- MySQL 8.x ou compatível
- Git (para clonar o repositório)

> O instalador automático do projeto também copia `.env.example` para `.env` e verifica se o ambiente está pronto.

---

## 1. Instalação em Windows (local)

### Passo 1: Abrir PowerShell na raiz do projeto

```powershell
cd "<caminho-do-projeto>"
```

### Passo 2: Executar o instalador automático

```powershell
pnpm run install:windows
```

### O que o instalador faz

- Verifica Node.js, npm e pnpm
- Cria `.env` a partir de `.env.example` se não existir
- Instala dependências com `pnpm install`
- Verifica tipos TypeScript com `pnpm run check`
- Configura banco de dados local ou escolhe instalação via Docker
- Executa `pnpm run db:push` para aplicar migrations
- Executa `pnpm run test` (opcional)

### Se preferir executar manualmente

```powershell
pnpm install
pnpm run db:push
pnpm run dev
```

### Iniciar em produção

```powershell
pnpm run build
pnpm run start
```

---

## 2. Instalação online em VPS (Linux)

### Cenário típico

- Servidor VPS Linux (Ubuntu, Debian, CentOS)
- Acesso SSH
- MySQL local ou remoto disponível
- Node.js, npm e pnpm instalados

### Passo 1: Conectar ao VPS

```bash
ssh usuario@seu-vps
```

### Passo 2: Preparar o servidor

```bash
sudo apt update
sudo apt install -y git curl build-essential
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs
npm install -g pnpm
```

### Passo 3: Clonar o repositório

```bash
cd /opt
sudo git clone <url-do-repositorio> pea-plan
cd pea-plan
```

### Passo 4: Copiar e editar `.env`

```bash
cp .env.example .env
nano .env
```

Preencha ao menos:

- `DATABASE_URL=mysql://user:senha@host:3306/pea_plan`
- `JWT_SECRET=<token-secreto-forte>`
- `VITE_APP_ID=pea-plan-app-id`
- `OAUTH_SERVER_URL=<url-do-oauth>`
- `OWNER_OPEN_ID=<owner-id>`
- `BUILT_IN_FORGE_API_URL=<url-do-forge>`
- `BUILT_IN_FORGE_API_KEY=<api-key>`

### Passo 5: Instalar dependências

```bash
pnpm install
```

### Passo 6: Aplicar migrations

```bash
pnpm run db:push
```

### Passo 7: Verificar TypeScript

```bash
pnpm run check
```

### Passo 8: Gerar build de produção

```bash
pnpm run build
```

### Passo 9: Iniciar em produção

```bash
pnpm run start
```

### Passo 10: Usar process manager (opcional)

```bash
npm install -g pm2
pm2 start npm --name pea-plan -- run start
pm2 save
```

> Use Nginx ou Apache como proxy reverso para rotear tráfego para `http://127.0.0.1:3000`.

---

## 3. Instalação via Docker

### Passo 1: Instalar Docker

- Windows: Docker Desktop
- Linux: `sudo apt install docker.io docker-compose`

### Passo 2: Verificar Docker

```bash
docker --version
docker compose version
```

### Passo 3: Copiar `.env`

```bash
cp .env.example .env
```

### Passo 4: Ajustar `DATABASE_URL`

Se usar container MySQL ou banco remoto, edite `.env`.

### Passo 5: Iniciar containers

```bash
docker compose up -d
```

### Passo 6: Verificar containers

```bash
docker ps
```

### Passo 7: Acessar aplicação

Abra no navegador:

- `http://localhost:3000`

### Observação

- Se o `docker-compose.yml` não estiver configurado para a aplicação e banco, inicie o MySQL em Docker e rode o app localmente com `pnpm`.
- O instalador automático usa Docker para MySQL se o MySQL local não estiver disponível.

---

## 4. Instalação PWA

### Pré-requisitos PWA

Verifique se os arquivos abaixo existem:

- `client/public/manifest.json`
- `client/public/sw.js`
- `client/public/icons/pwa-192x192.png`
- `client/public/icons/pwa-512x512.png`
- `client/index.html` com `<link rel="manifest" href="/manifest.json" />`

### Passo 1: Iniciar o app

```bash
pnpm run dev
```

### Passo 2: Acessar no navegador

```bash
http://localhost:3000
```

### Passo 3: Instalar o PWA

- Chrome/Edge: menu do navegador > "Instalar" / "Apps" > "Instalar PeA"
- Safari iOS: botão Compartilhar > "Adicionar à Tela de Início"

### Passo 4: Testar offline

1. Abra o app PWA instalado.
2. Desconecte a internet ou use o DevTools em modo Offline.
3. Verifique que o app ainda carrega e que o recurso offline funciona.

### Como o PWA funciona no projeto

- O service worker é registrado em `client/src/lib/pwa.ts`
- O manifesto está em `client/public/manifest.json`
- O service worker manual está em `client/public/sw.js`
- O prompt de instalação é gerenciado por `beforeinstallprompt`

---

## Comandos úteis

```bash
pnpm run install:windows   # instalador Windows
pnpm run install:linux     # instalador Linux/macOS
pnpm run install:prompt    # verifica ambiente de instalação
pnpm run dev               # desenvolvimento local
pnpm run build             # build de produção
pnpm run start             # iniciar servidor de produção
pnpm run db:push           # aplicar migrations
pnpm run check             # verificar TypeScript
```

## Observações importantes

- Não comite `.env` no repositório.
- Use chaves e senhas fortes em produção.
- Em VPS, prefira `pm2`, `systemd` ou Docker para manter o app ativo.
- O instalador automático cria `.env` baseado em `.env.example` e pode iniciar MySQL via Docker quando necessário.
