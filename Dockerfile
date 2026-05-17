FROM node:20-alpine

# Instalar pnpm
RUN npm install -g pnpm

WORKDIR /app

# Copiar arquivos de dependência
COPY package.json pnpm-lock.yaml ./

# Instalar dependências
RUN pnpm install --frozen-lockfile

# Copiar código-fonte
COPY . .

# Buildar aplicação
RUN pnpm run build

# Expor porta
EXPOSE 3000

# Iniciar em produção
CMD ["pnpm", "run", "start"]
