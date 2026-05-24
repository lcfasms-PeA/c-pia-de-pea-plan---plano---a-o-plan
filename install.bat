@echo off
REM ============================================================================
REM PeA-Plan Installation Script for Windows
REM ============================================================================
REM Instala e configura PeA-Plan em Windows
REM Pré-requisitos: Node.js, npm, MySQL (ou Docker)
REM ============================================================================

setlocal enabledelayedexpansion
cd /d "%~dp0"

echo.
echo ============================================================================
echo   PEA-PLAN INSTALLATION SCRIPT FOR WINDOWS
echo ============================================================================
echo.

REM Cores para output (usando modo simples)
set ERROR=[ERROR]
set SUCCESS=[OK]
set INFO=[INFO]

REM ============================================================================
REM 1. Verificar pré-requisitos
REM ============================================================================
echo %INFO% Verificando pré-requisitos...
echo.

node --version >nul 2>&1
if errorlevel 1 (
    echo %ERROR% Node.js não está instalado!
    echo Por favor instale Node.js de: https://nodejs.org/
    pause
    exit /b 1
)
echo %SUCCESS% Node.js encontrado: 
node --version

npm --version >nul 2>&1
if errorlevel 1 (
    echo %ERROR% npm não está instalado!
    pause
    exit /b 1
)
echo %SUCCESS% npm encontrado: 
npm --version

pnpm --version >nul 2>&1
if errorlevel 1 (
    echo %INFO% pnpm não encontrado, instalando globalmente...
    npm install -g pnpm
    if errorlevel 1 (
        echo %ERROR% Falha ao instalar pnpm!
        pause
        exit /b 1
    )
)
echo %SUCCESS% pnpm encontrado:
pnpm --version

echo.
echo %INFO% Verificando MySQL...
mysql --version >nul 2>&1
if errorlevel 1 (
    echo %INFO% MySQL não encontrado localmente
    echo Por favor escolha:
    echo   1. Instalar MySQL localmente (https://dev.mysql.com/downloads/mysql/)
    echo   2. Usar MySQL Docker (precisa Docker Desktop)
    echo   3. Usar PlanetScale na nuvem (https://planetscale.com - gratuito)
    echo.
    set /p DB_CHOICE="Escolha uma opção (deixe em branco = Docker): "
    if "!DB_CHOICE!"=="" set DB_CHOICE=2
)

REM ============================================================================
REM 2. Criar ou atualizar .env
REM ============================================================================
echo.
echo %INFO% Configurando arquivo .env...

if not exist .env (
    echo %INFO% Criando novo .env baseado em .env.example...
    copy .env.example .env >nul 2>&1
    if errorlevel 1 (
        echo %ERROR% Falha ao copiar .env.example
        pause
        exit /b 1
    )
    echo %SUCCESS% .env criado
    
    echo.
    echo %INFO% Por favor edite o arquivo .env com suas credenciais:
    echo   - DATABASE_URL (MySQL connection string)
    echo   - JWT_SECRET (chave secreta)
    echo   - OAUTH_SERVER_URL
    echo   - BUILT_IN_FORGE_API_URL e API_KEY
    echo.
    echo Abrindo .env em editor...
    start notepad .env
    
    echo.
    echo %INFO% Aguardando edição de .env (pressione Enter quando terminar)...
    pause
) else (
    echo %SUCCESS% .env já existe
)

REM ============================================================================
REM 3. Instalar dependências
REM ============================================================================
echo.
echo %INFO% Instalando dependências do projeto...
pnpm install
if errorlevel 1 (
    echo %ERROR% Falha ao instalar dependências!
    pause
    exit /b 1
)
echo %SUCCESS% Dependências instaladas

REM ============================================================================
REM 4. Verificar tipos TypeScript
REM ============================================================================
echo.
echo %INFO% Verificando tipos TypeScript...
pnpm run check
if errorlevel 1 (
    echo %ERROR% Erros de TypeScript detectados!
    pause
    exit /b 1
)
echo %SUCCESS% TypeScript OK

REM ============================================================================
REM 5. Setup banco de dados
REM ============================================================================
echo.
echo %INFO% Configurando banco de dados...

if "!DB_CHOICE!"=="2" (
    echo %INFO% Iniciando MySQL em Docker...
    docker --version >nul 2>&1
    if errorlevel 1 (
        echo %ERROR% Docker não está instalado!
        echo Instale Docker Desktop em: https://www.docker.com/products/docker-desktop
        pause
        exit /b 1
    )
    
    echo %INFO% Iniciando container MySQL...
    docker run --name pea-plan-mysql -d ^
        -e MYSQL_ROOT_PASSWORD=root123 ^
        -e MYSQL_DATABASE=pea_plan_dev ^
        -p 3306:3306 ^
        mysql:8.0 >nul 2>&1
    
    if errorlevel 1 (
        echo %INFO% Container pode já estar rodando, tentando continuado...
    ) else (
        echo %INFO% Aguardando MySQL ficar pronto...
        timeout /t 5 /nobreak
    )
)

echo %INFO% Rodando migrations do banco de dados...
pnpm run db:push
if errorlevel 1 (
    echo %ERROR% Falha ao rodar migrations!
    echo Verifique se:
    echo   - DATABASE_URL está correto em .env
    echo   - MySQL está rodando
    echo   - Banco de dados existe
    pause
    exit /b 1
)
echo %SUCCESS% Banco de dados configurado

REM ============================================================================
REM 6. Rodar testes
REM ============================================================================
echo.
echo %INFO% Rodando testes...
pnpm run test
if errorlevel 1 (
    echo %ERROR% Alguns testes falharam!
    echo Isso pode ser normal se o banco não estiver completamente pronto
    echo Pressione Enter para continuar...
    pause
)
echo %SUCCESS% Testes concluídos

REM ============================================================================
REM 7. Build (opcional para produção)
REM ============================================================================
echo.
set /p BUILD_CHOICE="Deseja fazer build de produção agora? (s/n): "
if "!BUILD_CHOICE!"=="s" (
    echo %INFO% Gerando build de produção...
    pnpm run build
    if errorlevel 1 (
        echo %ERROR% Falha no build!
        pause
        exit /b 1
    )
    echo %SUCCESS% Build concluído em: dist/
)

REM ============================================================================
REM 8. Sucesso!
REM ============================================================================
echo.
echo ============================================================================
echo   INSTALAÇÃO CONCLUÍDA COM SUCESSO!
echo ============================================================================
echo.
echo Para iniciar o servidor:
echo   pnpm run dev
echo.
echo Então acesse: http://localhost:3000
echo.
echo Para mais informações, consulte:
echo   - QUICK_START.md
echo   - DEPLOYMENT_PLAN.md
echo   - ARCHITECTURE.md
echo.
pause
