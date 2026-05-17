# Manual de Instalação e Operação

## 1. Instalação
1. Abra o terminal na raiz do projeto.
2. Execute:

```bash
pnpm install
```

## 2. Desenvolvimento
Execute o servidor em modo de desenvolvimento:

```bash
pnpm run dev
```

Isso inicia o backend Express e o frontend Vite juntos, com hot reload.

## 3. Build de produção
Gera a aplicação pronta para deploy:

```bash
pnpm run build
```

Isso produz:
- frontend compilado em `dist/public`
- backend bundlado em `dist/index.js`

## 4. Iniciar em produção
Após o build, execute:

```bash
pnpm run start
```

O servidor irá servir o frontend estático de `dist/public` e a API tRPC em `/api/trpc`.

## 5. Ajustes aplicados
- Adicionado `cross-env` aos scripts para compatibilidade entre Windows e Linux.
- Corrigido o caminho de produção em `server/_core/vite.ts` para sempre servir `dist/public`.

## 6. Recomendações
- Em Windows, use `pnpm run dev` e `pnpm run start` com `cross-env`.
- Se faltar `node_modules`, rode `pnpm install` antes de qualquer comando.
