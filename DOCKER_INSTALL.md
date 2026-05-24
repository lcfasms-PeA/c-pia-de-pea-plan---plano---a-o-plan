# 🐳 GUIA: Instalar Docker para Windows

Se você quer testar PeA-Plan em Docker, siga este guia.

## ❌ Problema

Docker não está instalado ou não está no PATH do sistema.

## ✅ Solução: Instalar Docker Desktop para Windows

### Opção 1: Docker Desktop (Recomendado)

#### Passo 1: Baixar

1. Acesse: [Docker Desktop](https://www.docker.com/products/docker-desktop)
2. Clique em "Download for Windows"
3. Escolha a versão para seu Windows:
   - **Windows 11/10 Pro/Enterprise**: use a versão padrão
   - **Windows 10 Home**: use a versão WSL2

#### Passo 2: Instalar

1. Execute o instalador
2. Siga os passos (aceite termos padrão)
3. Se pedido, ative WSL2 (Windows Subsystem for Linux)
4. Reinicie o computador se necessário

#### Passo 3: Verificar

```bash
docker --version
# Esperado: Docker version XX.X.X, build XXXXX
```

### Opção 2: Docker via WSL2 (Se Windows 10 Home)

Se seu Windows é Home Edition, use WSL2:

1. Instale WSL2: [documentação do WSL2](https://learn.microsoft.com/pt-br/windows/wsl/install)
2. Instale Docker Desktop para Windows
3. Ative WSL2 no Docker Desktop (Preferências → Resources → WSL 2)

### Opção 3: Usar Linux natively (Se tiver Linux/Ubuntu)

```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
```

---

## 🚀 Depois de Instalar

### Verificar instalação

```bash
docker --version
docker-compose --version
docker run hello-world
# Deve aparecer: "Hello from Docker!"
```

### Iniciar PeA-Plan no Docker

```bash
cd "caminho/para/pea-plan"
docker-compose up --build
```

Aguarde 2-3 minutos e acesse: [http://localhost:3000](http://localhost:3000)

---

## ⚠️ Se Tiver Problemas

### Docker Desktop não inicia

- Verifique se Virtualization está habilitada no BIOS
- Reinicie o computador
- Desinstale e reinstale completamente

### WSL2 erro

```bash
# Atualize WSL2
wsl --update
wsl --set-default-version 2
```

### Permissões no Windows

- Execute PowerShell como Administrador
- Tente novamente

---

## 📊 Requisitos do Sistema

| Requisito | Mínimo | Recomendado |
|-----------|--------|-------------|
| RAM | 4 GB | 8+ GB |
| Disco | 5 GB | 20+ GB |
| Windows | 10 (build 19041+) | 11 |
| Processador | 64-bit | 64-bit com Virtualization |

---

## ⏱️ Tempo esperado

- Download: 5-10 min (depende da internet)
- Instalação: 5-10 min
- Primeira inicialização: 2-3 min
- **Total**: ~15-25 minutos

---

## 🎯 Próximos passos após instalar

1. ✅ Docker Desktop aberto e rodando
2. ✅ Terminal: `docker --version`
3. ✅ Volte ao projeto PeA-Plan
4. ✅ Execute: `docker-compose up --build`
5. ✅ Acesse: [http://localhost:3000](http://localhost:3000)

---

Se Docker não é viável agora, **use a alternativa local** (próximo arquivo).
