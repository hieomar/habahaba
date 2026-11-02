# NASFAM IPC Grain Traceability System

Internal platform for grain traceability, warehouse operations, and supply chain oversight operated by the National Smallholder Farmers' Association of Malawi (NASFAM).

---

## Technology Stack

| Layer | Technology |
|---|---|
| Framework | [Next.js 16](https://nextjs.org) — App Router |
| Language | TypeScript 5 |
| Styling | Tailwind CSS v4 |
| Runtime | Node.js 20+ |

---

## Getting Started

### Prerequisites

- Node.js 20 or later
- npm 10 or later

### Install dependencies

```bash
npm install
```

### Start the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Project Structure

```
src/
├── app/
│   ├── login/
│   │   └── page.tsx        # /login route
│   ├── favicon.ico
│   ├── globals.css         # Design tokens and base styles
│   ├── layout.tsx          # Root layout (font, metadata)
│   └── page.tsx            # / route → renders SplashScreen
└── components/
    ├── LoginPage.tsx        # Login form component
    └── SplashScreen.tsx    # Animated splash screen component
public/
└── branding/
    └── nasfam-logo.png     # Official NASFAM logo (source of truth)
```

---

## Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server with Turbopack |
| `npm run build` | Build the production bundle |
| `npm run start` | Start the production server |
| `npm run lint` | Run ESLint |

---

## Branding

The official NASFAM logo is located at `public/branding/nasfam-logo.png`. This is the single source of truth for all brand usage within this application. Do not recreate, redraw, recolour, or replace this asset.

The application colour palette is derived from the NASFAM logo:

| Token | Hex | Usage |
|---|---|---|
| `--nasfam-green` | `#1a5c2a` | Primary brand colour |
| `--nasfam-green-dark` | `#134520` | Hover/active states |
| `--nasfam-green-light` | `#e8f1ea` | Subtle backgrounds |

---

## Licence

Proprietary — NASFAM. All rights reserved.
