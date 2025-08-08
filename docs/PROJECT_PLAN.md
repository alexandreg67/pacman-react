# Plan d’actions — Pacman React

Ce document est vivant. Il liste les étapes, critères d’acceptation et checklists pour garder le projet aligné.

## Stratégie de branches

- Branche par défaut: `main` (stable)
- Branche d’intégration: `dev` (intégration continue des features)
- Flux: feature branches → PR vers `dev` → CI/CD sur `dev` → merge vers `main` après validation

## 0) Pré‑requis

- Node LTS 22 (`nvm use`), npm ≥ 10
- Scripts de base opérationnels: `dev`, `build`, `lint`, `typecheck`, `test`

Etat: OK

---

## 1) Thème UI — Tailwind + DaisyUI

Objectif: base de design moderne, thèmes configurables, utilitaires CSS productifs.

Étapes:

1. Installer DaisyUI (compatible Tailwind v4)
   - `npm i -E daisyui`
   - Importer le plugin dans `tailwind.config.ts`
2. Configurer thème(s)
   - Activer 1–2 thèmes (ex: `emerald` par défaut, `dark`)
   - Définir un `data-theme` au niveau de `html` ou via un provider React
3. Utilisation
   - Remplacer styles de démonstration par classes Tailwind/DaisyUI
   - Créer un composant `ThemeToggle`

Critères d’acceptation:

- Build OK et aucun conflit PostCSS
- Au moins 2 thèmes commutables en runtime

Checklist:

- [x] `daisyui` installé
- [x] `tailwind.config.ts` mis à jour (plugins + thèmes)
- [ ] `ThemeToggle` (test unitaire minimal)

---

## 2) Structure applicative

Objectif: organiser le code pour un jeu évolutif.

Arborescence cible:

- `src/components/` — UI réutilisable (boutons, overlays, HUD)
- `src/game/` — assets, niveaux, constantes, entités
- `src/systems/` — logique (boucle de jeu, input, collisions, IA)
- `src/types/` — types globaux (ex: `Vector2D`, `EntityId`, `GameState`)

Étapes:

1. Créer dossiers + `.gitkeep`
2. Ajouter conventions (nommage fichiers, suffixes `*.system.ts`, `*.type.ts`)
3. Ajouter index de ré‑export si pertinent

Critères d’acceptation:

- Dossiers présents, importables sans erreur TS
- Conventions documentées dans ce plan

Checklist:

- [x] Dossiers créés
- [ ] Conventions écrites (section dédiée ci‑dessous)

Conventions (à compléter):

- Fichiers systèmes: `src/systems/<area>/<name>.system.ts`
- Types globaux: `src/types/<domain>.type.ts`

---

## 3) Tests E2E — Playwright

Objectif: valider interactions critiques du jeu dans un navigateur réel (CI headless).

Étapes:

1. Installer et initialiser
   - `npm i -D -E @playwright/test`
   - `npx playwright install --with-deps`
2. Configurer `playwright.config.ts`
   - `webServer`: lancer Vite (`npm run dev`) ou `vite preview` sur build
   - `use.baseURL`: `http://localhost:5173`
   - Projets: Chromium (min), Firefox/WebKit optionnels
3. Écrire 1 test de fumée
   - Vérifier que la page charge et affiche le heading
4. Scripts
   - `e2e`: `playwright test`
   - `e2e:headed`: `playwright test --headed`

Critères d’acceptation:

- `npm run e2e` passe en local et CI

Checklist:

- [x] Dépendances installées
- [x] `playwright.config.ts` prêt
- [ ] Test de fumée vert

---

## 4) CI — GitHub Actions

Objectif: pipelines distincts pour `dev` et `main`.

Workflows:

1. `ci-dev.yml` (sur `dev`, PR vers `dev`)
   - Jobs: setup Node 22 + cache npm → `npm ci` → `lint` → `typecheck` → `test` → `build` → `e2e`
   - Artefacts: rapports tests, coverage, traces Playwright
2. `ci-main.yml` (sur `main`, PR vers `main`)
   - Même steps que dev
   - Placeholder `deploy` (à définir selon cible: GH Pages/Vercel/Netlify)

Optimisations:

- Cache npm via `actions/setup-node@v4`
- Cache Playwright browsers

Critères d’acceptation:

- Deux workflows actifs et verts sur branches cibles

Checklist:

- [ ] `.github/workflows/ci-dev.yml`
- [ ] `.github/workflows/ci-main.yml`
- [x] Workflow de base présent (`.github/workflows/ci.yml`)

---

## 5) Branching & Remote

Étapes:

1. Créer branche locale `dev`
2. Pousser `main` et `dev` vers GitHub (nécessite URL du repo)
3. Protéger branches (required checks) — manuel sur GitHub

Checklist:

- [ ] Branche locale `dev`
- [ ] Remote GitHub ajouté (`git remote add origin <url>`) et push effectué
- [ ] Règles de protection configurées

---

## Journal d’avancement

- [ ] 2025‑08‑08: Plan initial créé et structure de base ajoutée
- [ ] …

---

Latest audit: see docs/AUDIT_SUMMARY.md (generated on ven. 08 août 2025 14:42:02 CEST)
