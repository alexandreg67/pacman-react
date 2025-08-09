# Tests des Tunnels Pac-Man

## Tests Unitaires (Jest)

Les tests unitaires pour la fonctionnalité de tunnel sont maintenant implémentés dans `src/game/__tests__/wrap.test.ts`.

### Exécution des tests

```bash
npm test src/game/__tests__/wrap.test.ts
```

### Tests implémentés

1. **Test de wrap gauche → droite sur ligne de tunnel détectée dynamiquement**
   - Sélection automatique de la première ligne de tunnel via `state.tunnelRows[0]`
   - Position Pac-Man à (0, tunnelRow) direction `left`
   - Appel de `step()`
   - Vérification qu'il se retrouve à (width-1, tunnelRow)

2. **Test de wrap droite → gauche sur ligne de tunnel détectée dynamiquement**
   - Sélection automatique de la première ligne de tunnel via `state.tunnelRows[0]`
   - Position Pac-Man à (width-1, tunnelRow) direction `right`
   - Appel de `step()`
   - Vérification qu'il se retrouve à (0, tunnelRow)

3. **Test de non-wrap sur ligne non-tunnel**
   - Position Pac-Man sur une ligne sans tunnel
   - Tentative de déplacement vers le bord
   - Vérification qu'aucun wrap ne se produit

## Tests Manuels (UI)

### Démarrage du serveur de développement

```bash
npm run dev
```

Le jeu sera accessible à `http://localhost:5173/`

### Instructions pour les tests manuels

1. **Test wrap gauche → droite (lignes de tunnel détectées automatiquement)**
   - Naviguer Pac-Man vers n'importe quelle ligne de tunnel (identifiées automatiquement par l'algorithme)
   - Utiliser les flèches directionnelles ou WASD pour déplacer Pac-Man vers la gauche
   - Continuer jusqu'à ce qu'il sorte par le côté gauche
   - **Résultat attendu**: Pac-Man réapparaît du côté droit de la même ligne

2. **Test wrap droite → gauche (lignes de tunnel détectées automatiquement)**
   - Depuis n'importe quelle ligne de tunnel, déplacer Pac-Man vers la droite
   - Continuer jusqu'à ce qu'il sorte par le côté droit
   - **Résultat attendu**: Pac-Man réapparaît du côté gauche de la même ligne

### Identification automatique des tunnels

Le système utilise maintenant la fonction `computeTunnelRows()` qui détecte automatiquement les lignes de tunnel en analysant la grille :

- **Critère**: Une ligne est considérée comme tunnel si sa première OU dernière cellule n'est pas un mur
- **Avantages**: Fonctionne avec n'importe quelle configuration de grille, pas besoin d'indices hardcodés
- **Robustesse**: S'adapte automatiquement aux changements de layout

### Contrôles du jeu

- **Flèches directionnelles** : Déplacement
- **WASD** : Déplacement alternatif
- **R** : Reset du jeu

## Vérification des Résultats

### Tests Unitaires

✅ Tous les tests passent avec succès

- Tests de wrap bidirectionnel sur ligne tunnel
- Test de non-wrap sur ligne normale
- Tests des fonctions utilitaires de détection de tunnel

### Tests Manuels

Pour valider manuellement:

1. Le wrap fonctionne uniquement sur les lignes de tunnel
2. Le mouvement est fluide et instantané
3. La position verticale reste constante lors du wrap
4. Aucun wrap ne se produit sur les autres lignes du labyrinthe
