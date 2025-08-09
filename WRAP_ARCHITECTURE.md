# Architecture du Wrap Horizontal/Vertical

## Vue d'ensemble

Le système de wrap dans ce jeu Pac-Man est conçu pour être robuste et extensible, avec une séparation claire entre la logique horizontal et verticale.

## État actuel - Gameplay Classique

### Wrap Horizontal ✅ ACTIVÉ

- **Fonctionnalité** : Pac-Man peut traverser d'un côté à l'autre de l'écran sur certaines lignes
- **Détection** : Les "tunnels horizontaux" sont identifiés par `computeTunnelRows()`
- **Logique** : Implémentée dans `handleHorizontalWrap()` dans `src/game/entities/pacman.ts`
- **Comportement** : Si Pac-Man sort par le côté gauche d'une ligne tunnel, il réapparaît à droite (et vice versa)

### Wrap Vertical ❌ DÉSACTIVÉ (Gameplay classique)

- **Fonctionnalité** : Désactivé pour respecter le gameplay classique Pac-Man
- **Logique** : Préparée dans `handleVerticalWrap()` mais retourne `null` pour les positions hors limites
- **Comportement** : Pac-Man ne peut pas sortir par le haut ou le bas de l'écran

## Architecture pour Extension Future

### Code encapsulé en blocs séparés :

1. **`handleHorizontalWrap(state, nx, ny)`**
   - Gère uniquement la logique de wrap horizontal
   - Utilise `state.tunnelRows` pour identifier les lignes de tunnel
   - Retourne la position X ajustée ou `null`

2. **`handleVerticalWrap(state, nx, ny)`** 🔧 PRÊT POUR EXTENSION
   - Gère la logique de wrap vertical (actuellement désactivée)
   - Peut être activée en modifiant la condition `ny < 0 || ny >= h`
   - Retourne la position Y ajustée ou `null`

3. **`computeTunnelCols(grid)`** 🔧 PRÊT POUR EXTENSION
   - Fonction utilitaire pour identifier les colonnes de tunnel vertical
   - Suit la même logique que `computeTunnelRows()` mais en vertical
   - Pas utilisée actuellement mais testée et fonctionnelle

## Tests de Robustesse

### Tests existants :

- ✅ `prevents vertical wrap (classic gameplay behavior)`
- ✅ `allows horizontal wrap on tunnel rows`
- ✅ `correctly identifies horizontal tunnel rows`
- ✅ `correctly identifies vertical tunnel columns (for future extension)`

## Activation du Wrap Vertical (Instructions futures)

Pour activer le wrap vertical dans le futur :

1. **Modifier GameState** :

   ```typescript
   export type GameState = {
     // ... autres propriétés
     tunnelRows: number[]
     tunnelCols: number[] // Ajouter cette ligne
   }
   ```

2. **Calculer les tunnels verticaux** :

   ```typescript
   // Dans src/game/state.ts
   const tunnelCols = computeTunnelCols(grid)
   ```

3. **Modifier handleVerticalWrap** :

   ```typescript
   function handleVerticalWrap(state: GameState, nx: number, ny: number): number | null {
     const h = state.grid.length

     // Vérifier si on est sur une colonne de tunnel
     if (!state.tunnelCols?.includes(nx)) {
       return ny < 0 || ny >= h ? null : ny
     }

     if (ny < 0) {
       if (!isWall(state.grid, nx, h - 1)) return h - 1
     } else if (ny >= h) {
       if (!isWall(state.grid, nx, 0)) return 0
     }

     return ny
   }
   ```

## Avantages de cette Architecture

1. **Séparation des responsabilités** : Chaque fonction a un rôle spécifique
2. **Extensibilité** : Le wrap vertical peut être activé sans casser l'existant
3. **Testabilité** : Chaque comportement peut être testé indépendamment
4. **Maintenabilité** : La logique est claire et documentée
5. **Robustesse** : Gestion des cas limites et validation des entrées

## Conclusion

Le système actuel respecte le gameplay classique Pac-Man (wrap horizontal uniquement) tout en préparant le terrain pour des extensions futures. La logique est encapsulée dans des blocs séparés, facilitant la maintenance et l'évolution du code.
