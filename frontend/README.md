# Arithmetic Pairing Frontend

Bu klasor, Aritmetik Mahjong MVP icin Next.js frontend uygulamasini icerir.

## Gereksinimler

- Node.js 20+ (onerilir)
- npm 10+

## Kurulum

```bash
npm install
```

## Gelistirme Modu

```bash
npm run dev
```

Varsayilan adres: `http://localhost:3000`

## Diger Komutlar

```bash
npm run build
npm run start
npm run lint
```

## Klasor Yapisi

```txt
frontend/
  app/
    globals.css
    layout.tsx
    page.tsx
  next.config.ts
  postcss.config.js
  tailwind.config.ts
  tsconfig.json
  package.json
```

## Design System

Bu proje UI gelistirmelerinde asagidaki kaynaklari referans alir:

- `../design-system.md`
- `../mahjong-design-system.html`

Projede tanimli Cursor rule: `.cursor/rules/frontend-design-system.mdc`
