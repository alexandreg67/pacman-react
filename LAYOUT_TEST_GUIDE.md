# 📋 Guide de Test - Nouveau Layout avec Sidebars

## 🎯 Objectif

Vérifier que le nouveau layout 16:9 avec sidebars fonctionne correctement sur différentes tailles d'écran.

## 🖥️ Breakpoints de Test

### ✅ Layout avec Sidebars (>= 1200px)

**Sur ces résolutions, vous devriez voir :**

- **Sidebar Gauche** : Titre PAC-MAN, mode/niveau, instructions, contrôles, theme toggle
- **Zone Centrale** : Board de jeu uniquement
- **Sidebar Droite** : Statistiques, progression, timer (speedrun), infos niveau

**Résolutions à tester :**

- 1200px × 800px (minimum)
- 1400px × 900px
- 1920px × 1080px (Full HD)
- 2560px × 1440px (2K)
- 3840px × 2160px (4K)

### ✅ Layout Vertical (< 1200px)

**Sur ces résolutions, vous devriez voir l'ancien layout :**

- Header avec titre et infos compact
- Stats en ligne
- Board centré
- Contrôles en bas

**Résolutions à tester :**

- 1024px × 768px (Tablet landscape)
- 768px × 1024px (Tablet portrait)
- 375px × 667px (Mobile)

## 🧪 Tests à Effectuer

### 1. Test de Breakpoint

1. Ouvrir l'application en développement : `npm run dev`
2. Aller dans le jeu (sélectionner mode + niveau)
3. Redimensionner la fenêtre du navigateur
4. **À 1200px** : les sidebars doivent apparaître
5. **En dessous de 1200px** : retour au layout vertical

### 2. Test de Contenu des Sidebars

#### Sidebar Gauche ✅

- [ ] Titre "PAC-MAN" visible et stylé
- [ ] Mode de jeu affiché (CLASSIC, SPEEDRUN, etc.)
- [ ] Niveau actuel affiché
- [ ] Instructions de contrôles claires
- [ ] Boutons RESTART et QUITTER fonctionnels
- [ ] Theme Toggle présent

#### Sidebar Droite ✅

- [ ] Statistiques colorées et lisibles (Score, Level, Lives, Pellets)
- [ ] Timer visible pour le mode SPEEDRUN uniquement
- [ ] Barre de progression des pellets animée
- [ ] Informations du niveau en bas
- [ ] États visuels (Game Over, Niveau Complété)

### 3. Test de Responsive Design

- [ ] Transitions fluides entre les breakpoints
- [ ] Pas de contenu coupé ou débordant
- [ ] Lisibilité maintenue sur toutes les tailles
- [ ] Performance stable (pas de lag)

### 4. Test de Gameplay

- [ ] Contrôles clavier fonctionnent normalement
- [ ] Board de jeu reste centré et jouable
- [ ] Modals (Game Over, Level Complete) s'affichent correctement
- [ ] Statistiques se mettent à jour en temps réel

## 🐛 Problèmes Connus à Vérifier

1. **Sidebars ne s'affichent pas** → Vérifier que l'écran fait plus de 1200px
2. **Contenu coupé** → Vérifier les largeurs fixes des colonnes
3. **Layout cassé** → Vérifier les classes CSS Grid
4. **Performance dégradée** → Vérifier les re-rendus inutiles

## 🚀 Commandes de Test

```bash
# Développement avec hot reload
npm run dev

# Build de production
npm run build

# Preview de la version de production
npm run preview
```

## ✨ Fonctionnalités Spéciales

### Mode Speedrun

- Timer affiché dans la sidebar droite (desktop) ou header (mobile)
- Chronomètre avec millisecondes
- Performance monitoring en développement

### Responsive

- Layout automatique selon la taille d'écran
- Dégradation gracieuse vers mobile
- Conservation de toutes les fonctionnalités

---

**Status** : ✅ Layout implémenté et fonctionnel  
**Breakpoint** : 1200px (sidebars) / <1200px (vertical)  
**Compatibilité** : Tous écrans 16:9 et formats standards
