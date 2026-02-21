# Setting up shadcn/ui, Tailwind, and TypeScript

This project **already uses**:
- **Tailwind CSS** (configured in `tailwind.config.js`)
- **Component path** `src/components/ui` for shared UI (Card, Spotlight, SplineScene/splite)
- **Utility** `src/lib/utils.js` with `cn()` for class merging (shadcn-style)

It is currently **JavaScript (JS/JSX)**. To add **TypeScript** and/or the full **shadcn CLI** workflow, follow below.

---

## Why `src/components/ui`?

shadcn/ui expects components to live in a single place (default `components/ui`) so that:
- All primitives (Button, Card, etc.) are in one folder
- You can override or add components without touching `node_modules`
- The CLI can add/update components in a predictable path

This project uses **`src/components/ui`** (under `src/` because Create React App uses `src` as the entry). If you run shadcn CLI, set the component path to `src/components/ui` when prompted.

---

## Adding TypeScript to this CRA project

1. **Install types**
   ```bash
   npm install --save-dev typescript @types/react @types/react-dom @types/node
   ```

2. **Add `tsconfig.json`** in `client/`:
   ```json
   {
     "compilerOptions": {
       "target": "ES2020",
       "lib": ["dom", "dom.iterable", "esnext"],
       "allowJs": true,
       "skipLibCheck": true,
       "esModuleInterop": true,
       "allowSyntheticDefaultImports": true,
       "strict": true,
       "forceConsistentCasingInFileNames": true,
       "noFallthroughCasesInSwitch": true,
       "module": "esnext",
       "moduleResolution": "node",
       "resolveJsonModule": true,
       "isolatedModules": true,
       "noEmit": true,
       "jsx": "react-jsx",
       "baseUrl": "src"
     },
     "include": ["src"]
   }
   ```

3. **Rename files** from `.js`/`.jsx` to `.ts`/`.tsx` gradually and add types.

---

## Adding shadcn/ui via CLI

If you want the full shadcn CLI (add components, init theme):

1. **Initialize (in `client/`)**
   ```bash
   npx shadcn@latest init
   ```
   - Style: Default or New York
   - Base color: Slate or Zinc
   - CSS variables: Yes
   - Component path: **`src/components/ui`** (or `@/components/ui` with `baseUrl: "src"`)
   - Tailwind config: use existing
   - `components.json` will be created.

2. **Add components**
   ```bash
   npx shadcn@latest add card
   npx shadcn@latest add button
   ```
   They will be placed in `src/components/ui`.

3. **Path alias**  
   Ensure `tsconfig.json` (or your bundler) has `"@/*": ["src/*"]` so imports like `@/components/ui/card` resolve. With CRA you may need `craco` or `react-app-rewired` for path aliases, or use relative imports.

---

## Dependencies already installed

- `tailwindcss`, `postcss`, `autoprefixer`
- `@splinetool/react-spline`, `@splinetool/runtime`
- `framer-motion`
- `lucide-react`

No extra install is required for the current UI components (Card, Spotlight, SplineScene).
