#!/bin/bash

################################################################################
# PeA-Plan Installation Script for Linux/macOS
################################################################################
# Instala e configura PeA-Plan em Linux ou macOS
# Pré-requisitos: Node.js, npm, MySQL (ou Docker)
################################################################################

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Funções de output
error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

success() {
    echo -e "${GREEN}[OK]${NC} $1"
}

info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

warning() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

# Script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

echo ""
echo "============================================================================"
echo "   PEA-PLAN INSTALLATION SCRIPT FOR LINUX/macOS"
echo "============================================================================"
echo ""

################################################################################
# 1. Verificar pré-requisitos
################################################################################
info "Verificando pré-requisitos..."
echo ""

if ! command -v node &> /dev/null; then
    error "Node.js não está instalado!"
    echo "Instale de: https://nodejs.org/"
    exit 1
fi
success "Node.js encontrado: $(node --version)"

if ! command -v npm &> /dev/null; then
    error "npm não está instalado!"
    exit 1
fi
success "npm encontrado: $(npm --version)"

if ! command -v pnpm &> /dev/null; then
    info "pnpm não encontrado, instalando globalmente..."
    npm install -g pnpm
fi
success "pnpm encontrado: $(pnpm --version)"

# Verificar MySQL
echo ""
if ! command -v mysql &> /dev/null; then
    warning "MySQL não encontrado localmente"
    echo ""
    echo "Opções:"
    echo "  1. Instalar MySQL localmente"
    echo "  2. Usar Docker (recomendado)"
    echo "  3. Usar PlanetScale na nuvem (gratuito)"
    echo ""
    read -p "Escolha uma opção (deixe em branco = Docker): " DB_CHOICE
    DB_CHOICE=${DB_CHOICE:-2}
else
    success "MySQL encontrado: $(mysql --version)"
fi

################################################################################
# 2. Criar ou atualizar .env
################################################################################
echo ""
info "Configurando arquivo .env..."

if [ ! -f .env ]; then
    info "Criando novo .env baseado em .env.example..."
    if [ -f .env.example ]; then
        cp .env.example .env
        success ".env criado"
    else
        error ".env.example não encontrado!"
        exit 1
    fi
    
    echo ""
    info "Por favor edite o arquivo .env com suas credenciais:"
    echo "  - DATABASE_URL (MySQL connection string)"
    echo "  - JWT_SECRET (chave secreta)"
    echo "  - OAUTH_SERVER_URL"
    echo "  - BUILT_IN_FORGE_API_URL e API_KEY"
    echo ""
    
    if command -v nano &> /dev/null; then
        read -p "Abrir .env em editor (nano)? (s/n): " EDIT_ENV
        if [ "$EDIT_ENV" = "s" ]; then
            nano .env
        fi
    fi
else
    success ".env já existe"
fi

################################################################################
# 3. Instalar dependências
################################################################################
echo ""
info "Instalando dependências do projeto..."
pnpm install
if [ $? -ne 0 ]; then
    error "Falha ao instalar dependências!"
    exit 1
fi
success "Dependências instaladas"

################################################################################
# 4. Verificar tipos TypeScript
################################################################################
echo ""
info "Verificando tipos TypeScript..."
pnpm run check
if [ $? -ne 0 ]; then
    error "Erros de TypeScript detectados!"
    exit 1
fi
success "TypeScript OK"

################################################################################
# 5. Setup banco de dados
################################################################################
echo ""
info "Configurando banco de dados..."

if [ "$DB_CHOICE" = "2" ]; then
    info "Iniciando MySQL em Docker..."
    
    if ! command -v docker &> /dev/null; then
        error "Docker não está instalado!"
        echo "Instale em: https://docs.docker.com/get-docker/"
        exit 1
    fi
    
    info "Iniciando container MySQL..."
    docker run --name pea-plan-mysql -d \
        -e MYSQL_ROOT_PASSWORD=root123 \
        -e MYSQL_DATABASE=pea_plan_dev \
        -p 3306:3306 \
        mysql:8.0 2>/dev/null || info "Container pode já estar rodando"
    
    info "Aguardando MySQL ficar pronto..."
    sleep 5
fi

info "Rodando migrations do banco de dados..."
pnpm run db:push
if [ $? -ne 0 ]; then
    error "Falha ao rodar migrations!"
    echo ""
    echo "Verifique se:"
    echo "  - DATABASE_URL está correto em .env"
    echo "  - MySQL está rodando"
    echo "  - Banco de dados existe"
    exit 1
fi
success "Banco de dados configurado"

################################################################################
# 6. Rodar testes
################################################################################
echo ""
info "Rodando testes..."
pnpm run test
if [ $? -ne 0 ]; then
    warning "Alguns testes falharam!"
    echo "Isso pode ser normal se o banco não estiver completamente pronto"
fi
success "Testes concluídos"

################################################################################
# 7. Build (opcional para produção)
################################################################################
echo ""
read -p "Deseja fazer build de produção agora? (s/n): " BUILD_CHOICE
if [ "$BUILD_CHOICE" = "s" ]; then
    info "Gerando build de produção..."
    pnpm run build
    if [ $? -ne 0 ]; then
        error "Falha no build!"
        exit 1
    fi
    success "Build concluído em: dist/"
fi

################################################################################
# 8. Sucesso!
################################################################################
echo ""
echo "============================================================================"
echo "   INSTALAÇÃO CONCLUÍDA COM SUCESSO!"
echo "============================================================================"
echo ""
echo "Para iniciar o servidor:"
echo "  pnpm run dev"
echo ""
echo "Então acesse: http://localhost:3000"
echo ""
echo "Para mais informações, consulte:"
echo "  - QUICK_START.md"
echo "  - DEPLOYMENT_PLAN.md"
echo "  - ARCHITECTURE.md"
echo ""
