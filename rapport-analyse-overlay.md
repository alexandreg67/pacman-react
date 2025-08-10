# Rapport d'Analyse : Overlay Game Over - Conteneur limité vs Viewport

## 🎯 Hypothèse Testée

**Hypothèse** : L'overlay Game Over est positionné `absolute` à l'intérieur de `.maze-container`, dont la hauteur est égale seulement au labyrinthe (et non à la fenêtre).

**Conséquences attendues** :

- Centrage visuel trompé si le labyrinthe n'est pas lui-même centré
- Fond semi-transparent limité à la zone du labyrinthe → impression de transparence

## ✅ Confirmation de l'Hypothèse

### Analyse du Code Actuel

Dans `/src/components/Board.tsx` (lignes 297-314), l'overlay Game Over est implémenté ainsi :

```tsx
{/* Overlay opaque + modale centrée sur la board */}
{state.gameStatus === 'game-over' && onRestart && (
  <>
    <div className="absolute inset-0 bg-black/90 z-40 pointer-events-auto backdrop-blur-sm" />
    <div className="absolute inset-0 flex items-center justify-center z-50 p-4">
      <GameOverScreen
        score={state.score}
        onRestart={onRestart}
        level={state.level}
        timeElapsed={...}
      />
    </div>
  </>
)}
```

### Structure HTML Analysée

```tsx
<div className="flex flex-col items-center gap-4">  // Conteneur principal page
  <div className="relative ... maze-container"      // Conteneur limité au labyrinthe
       style={{
         width: w * tileSize,                        // ⚠️ Largeur = labyrinthe uniquement
         height: h * tileSize,                       // ⚠️ Hauteur = labyrinthe uniquement
       }}>

    {/* Contenu du jeu */}
    {/* ... */}

    {/* ❌ PROBLÈME : Overlay limité au maze-container */}
    <div className="absolute inset-0 bg-black/90 z-40" />  // Couvre seulement le labyrinthe
    <div className="absolute inset-0 flex items-center justify-center z-50">
      <GameOverScreen />
    </div>
  </div>

  {/* Interface utilisateur (Score, Vies) */}  // ⚠️ Reste visible lors du Game Over
  <div className="flex justify-between items-center w-full max-w-md">
    <!-- ... -->
  </div>
</div>
```

## 🔍 Problèmes Identifiés

### 1. **Conteneur de Référence Limité**

- **Situation** : `.maze-container` a une taille fixe de `w * tileSize × h * tileSize`
- **Conséquence** : L'overlay `absolute inset-0` ne couvre que cette zone restreinte
- **Impact** : Le reste de l'interface reste visible et interactive

### 2. **Fausse Transparence**

- **Mécanisme** : `bg-black/90` (90% opacité) sur zone limitée
- **Effet visuel** : L'utilisateur voit encore l'interface autour du labyrinthe
- **Perception** : L'overlay semble "transparent" alors qu'il devrait être modal

### 3. **Centrage Visuel Trompé**

- **Problème** : La modal se centre dans le maze-container, pas dans la fenêtre
- **Résultat** : Si le labyrinthe n'est pas centré dans la fenêtre, la modal non plus
- **UX** : Centrage visuellement décalé pour l'utilisateur

## 📊 Preuves Techniques

### Dimensions Calculées

```tsx
// Dans Board.tsx
const h = state.grid.length        // Ex: 21 rangées
const w = state.grid[0]?.length    // Ex: 19 colonnes
// avec tileSize = 28px

// Taille du maze-container:
width: 19 * 28 = 532px              // ⚠️ Seulement 532px de large
height: 21 * 28 = 588px             // ⚠️ Seulement 588px de haut

// Taille typique d'écran: 1920×1080px
// Zone non couverte: 1388×492px reste visible !
```

### Classe CSS Confirmée

```css
/* Dans App.css - ligne 21 */
.maze-container {
  contain: layout style paint;
  overflow: hidden;
  will-change: auto;
  transform: translateZ(0);
}
```

## 🎯 Test de Validation

Un fichier de test (`test-overlay.html`) a été créé démontrant :

1. **Scenario A** : Overlay dans conteneur limité (problème actuel)
   - Background semi-transparent limité à 400×300px
   - Reste de l'écran visible = impression de transparence

2. **Scenario B** : Overlay couvrant tout le viewport (solution)
   - Background semi-transparent sur toute la zone visible
   - Vraie modalité, pas d'impression de transparence

## 📋 Conclusion

### ✅ Hypothèse **CONFIRMÉE**

L'overlay Game Over est effectivement :

1. **Positionné `absolute inset-0`** à l'intérieur du `.maze-container`
2. **Limité aux dimensions du labyrinthe** (532×588px typiquement)
3. **Ne couvre pas tout l'écran** → impression de transparence
4. **Centré dans le maze-container** et non dans la fenêtre

### 🎯 Impact UX

- **Modalité compromise** : l'utilisateur voit encore l'interface autour
- **Perception de "bug"** : l'overlay semble dysfonctionnel
- **Expérience incohérente** : pas de vraie interruption du jeu

### 🔧 Solutions Identifiées

1. **Position fixed** : `fixed inset-0` au lieu de `absolute inset-0`
2. **Conteneur parent élargi** : Remonter l'overlay d'un niveau dans la hiérarchie DOM
3. **Portal React** : Utiliser un portail pour rendre l'overlay au niveau `body`

L'analyse confirme que le problème est architectural : l'overlay doit sortir du scope du maze-container pour couvrir tout l'écran.
