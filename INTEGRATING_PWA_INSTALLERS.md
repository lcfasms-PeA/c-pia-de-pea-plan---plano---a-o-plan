# 🔧 INSTALADORES + PWA - Guia de Integração

Este documento explica como integrar totalmente os instaladores e PWA no seu projeto.

---

## 📋 Arquivos Criados

```text
✅ install.bat              (Instalador Windows automático)
✅ install.sh               (Instalador Linux/macOS automático)
✅ manifest.json            (Configuração PWA - já em public/)
✅ sw.ts                    (Service Worker com cache + offline)
✅ client/src/lib/pwa.ts    (Utilitários PWA)
✅ client/src/hooks/usePWA.tsx  (Hook React)
✅ client/index.html        (Atualizado com meta tags PWA)
```

---

## 🚀 PASSO 1: Confirmar Service Worker e Manifest Manual

O projeto já usa um service worker manual em `client/public/sw.js` e um manifesto PWA em `client/public/manifest.json`.

Não é necessário instalar `vite-plugin-pwa` para que a versão atual funcione. Se desejar, a integração com `vite-plugin-pwa` pode ser adicionada mais tarde como melhoria.

---

## 🚀 PASSO 2: Verifique `client/src/lib/pwa.ts`

O registro do service worker é feito diretamente no código PWA do cliente, usando:

```ts
navigator.serviceWorker.register('/sw.js', { scope: '/' })
```

Certifique-se de que o arquivo `client/public/sw.js` exista e seja servido em `https://localhost:3000/sw.js`.

Se você preferir o plugin Vite, a configuração abaixo é um ponto de partida, mas não é obrigatória para a instalação atual:

```typescript
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    // ... outros plugins ...
    
    VitePWA({
      registerType: 'prompt',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png'],
      manifest: {
        name: 'PeA-Plan',
        short_name: 'PeA',
        description: 'Plataforma Educacional para Elaboração de Planos de Negócios',
        theme_color: '#1e40af',
        background_color: '#ffffff',
        display: 'standalone',
        icons: [
          {
            src: '/icons/pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: '/icons/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: '/icons/pwa-192x192-maskable.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'maskable',
          },
          {
            src: '/icons/pwa-512x512-maskable.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        globPatterns: [
          '**/*.{js,css,html,ico,png,svg,woff2}',
        ],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/api\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24,
              },
            },
          },
          {
            urlPattern: /^https:\/\/.+\.(png|jpg|jpeg|svg|webp)$/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'image-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 30,
              },
            },
          },
        ],
      },
    }),
  ],
})
```

---

## 🚀 PASSO 3: Inicializar PWA em main.tsx

```typescript
import { usePWA } from '@/hooks/usePWA'

function App() {
  const { isOnline, installAvailable, updateAvailable, installApp } = usePWA()

  return (
    <>
      {/* Indicador Offline */}
      {!isOnline && (
        <div className="fixed top-0 left-0 right-0 bg-yellow-500 text-white p-3 text-center">
          Você está offline - Dados podem estar desatualizados
        </div>
      )}

      {/* Prompt de Instalação */}
      {installAvailable && (
        <div className="fixed bottom-4 right-4 bg-blue-500 text-white p-4 rounded shadow">
          <button 
            onClick={installApp}
            className="font-bold"
          >
            Instalar PeA-Plan
          </button>
        </div>
      )}

      {/* Notificação de Atualização */}
      {updateAvailable && (
        <div className="fixed bottom-4 left-4 bg-green-500 text-white p-4 rounded shadow">
          <button 
            onClick={() => window.location.reload()}
            className="font-bold"
          >
            Atualizar - Nova versão disponível
          </button>
        </div>
      )}

      {/* Seu app aqui */}
      <MainApp />
    </>
  )
}

export default App
```

---

## 🚀 PASSO 4: Criar Ícones PWA

### Opção A: Gerar Online (Mais fácil)

1. Acesse: [favicon-generator.org](https://www.favicon-generator.org/)
2. Faça upload da sua logo
3. Exporte para `/client/public/icons/`:
   - `pwa-192x192.png`
   - `pwa-512x512.png`
   - (Opcional) versões maskable para Android

### Opção B: Gerar com CLI
```bash
npm install -g pwa-asset-generator

pwa-asset-generator logo.png ./client/public/icons -b "#1e40af" -p "10%"
```

### Estrutura final

```text
client/public/
├─ icons/
│  ├─ pwa-192x192.png
│  ├─ pwa-512x512.png
│  ├─ pwa-192x192-maskable.png (recomendado)
│  ├─ pwa-512x512-maskable.png (recomendado)
│  └─ shortcut-*.png (opcional)
└─ screenshots/ (opcional)
   ├─ screenshot-narrow-1.png (540x720)
   └─ screenshot-wide-1.png (1280x720)
```

---

## 🚀 PASSO 5: Adicionar Scripts ao package.json

```json
{
  "scripts": {
    "dev": "cross-env NODE_ENV=development tsx watch server/_core/index.ts",
    "build": "vite build && esbuild server/_core/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist",
    "start": "cross-env NODE_ENV=production node dist/index.js",
    "check": "tsc --noEmit",
    "format": "prettier --write .",
    "test": "vitest run",
    "db:push": "drizzle-kit generate && drizzle-kit migrate",
    "install:windows": "powershell -ExecutionPolicy Bypass -File install.bat",
    "install:linux": "bash install.sh",
    "install:prompt": "node scripts/check-installer.js"
  }
}
```

---

## 🖼️ PASSO 6: Criar Ícone Alternativo (Metadata)

Opcionalmente, crie `/client/public/icon.svg` para compatibilidade:

```svg
<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
  <circle cx="100" cy="100" r="100" fill="#1e40af"/>
  <text x="100" y="115" font-size="120" font-weight="bold" fill="white" text-anchor="middle">P</text>
</svg>
```

---

## 🧪 PASSO 7: Testar PWA Localmente

### Build de teste
```bash
pnpm run build
pnpm run start
```

Acesse `http://localhost:3000`

### Chrome DevTools
1. Pressione F12
2. Vá para **Application** (ou **Storage**)
3. **Service Workers** - Deve ver seu SW registrado ✓
4. **Manifest** - Deve carregar com ícones ✓
5. **Storage** - Cache deve estar preenchido ✓

### Testar Offline
1. DevTools → Network → Throttling
2. Selecione "Offline"
3. Recarregue página
4. Deve ver conteúdo em cache ✓

### Instalar como App
1. Chrome: Clique ícone "+" na barra de endereço
2. Firefox: Menu → "Instalar aplicativo web"
3. Safari: Share → "Adicionar à Tela Inicial"

---

## 📱 PASSO 8: Testar no Celular

### Via ngrok (expor localhost)
```bash
npm install -g ngrok

# Terminal 1
pnpm run dev

# Terminal 2
ngrok http 3000
# Copia URL: https://xxx.ngrok.io
```

### Abrir no celular
- Android: Chrome → URL ngrok → Menu → "Instalar"
- iOS: Safari → URL ngrok → Share → "Adicionar à Tela Inicial"

---

## ✅ Checklist de Integração

- [ ] `vite-plugin-pwa` instalado
- [ ] `vite.config.ts` atualizado com VitePWA
- [ ] `client/index.html` tem meta tags PWA
- [ ] `client/public/manifest.json` existe
- [ ] Ícones em `client/public/icons/` (192x192, 512x512)
- [ ] Hook `usePWA` integrado em `main.tsx`
- [ ] PWA testada em Chrome DevTools
- [ ] Offline mode testado
- [ ] Instalador Windows (`install.bat`) testado
- [ ] Instalador Linux (`install.sh`) testado

---

## 🎯 Próximos Passos

1. ✅ Seguir os 8 passos acima
2. ✅ Testar com `pnpm run build && pnpm run start`
3. ✅ Verificar Chrome DevTools
4. ✅ Testar offline
5. ✅ Testar instalação no celular
6. ✅ Fazer commit para GitHub

---

## 🆘 Troubleshooting

### "Service Worker não registra"
- Verificar se site usa HTTPS (ou localhost)
- Limpar cache: DevTools → Application → Clear

### "Ícones não aparecem"
- Verificar caminho em `manifest.json`
- Tamanho deve ser exato: 192x192, 512x512
- Formato: PNG com fundo transparente

### "Offline não funciona"
- Verificar Workbox cache patterns
- Verificar se Assets estão sendo cacheados
- Testar em DevTools → Network → Offline

### "Instalador não roda"
- Windows: Executar PowerShell como Admin
- Linux: `chmod +x install.sh` primeiro
- Verificar Node.js path

---

**Status**: ✅ Pronto para Integração  
**Tempo estimado**: 30-45 minutos
