# Instructions Copilot - Projet SAE3.03

## Vue d'ensemble du projet

Ce projet est une **application SPA (Single Page Application)** éducative pour visualiser et gérer un référentiel de compétences du BUT MMI (Métiers du Multimédia et de l'Internet). Il permet aux étudiants de suivre leur progression sur les différents Apprentissages Critiques (AC).

### Stack technique
- **Frontend Framework**: Vanilla JavaScript (ES6+)
- **Build Tool**: Vite 7.x
- **Animations**: GSAP 3.x
- **Structure**: Architecture modulaire avec Layouts, Pages et UI Components
- **Styling**: CSS natif avec design moderne

---

## Architecture du projet

### Structure des dossiers

```
src/
├── layouts/           # Structures de page réutilisables (header, footer, sidebar)
│   └── root/
│       ├── layout.js
│       ├── style.css
│       └── template.html
│
├── pages/            # Pages de l'application (une par route)
│   ├── 404/
│   ├── svg-demo1/
│   ├── svg-demo2/
│   ├── svg-demo3/
│   ├── svg-demo4/
│   ├── svg-demo5/
│   └── svg-ma-demo/
│       ├── page.js
│       ├── style.css
│       └── template.html
│
├── ui/               # Composants UI réutilisables
│   ├── BarbaMe/
│   ├── flower/
│   ├── footer/
│   ├── header/
│   ├── popup-ac/      # Popup pour afficher les détails des AC
│   ├── shapes/
│   ├── spinner/
│   ├── star/
│   └── tree-skills/   # Composant principal de l'arbre de compétences
│       ├── index.js
│       ├── style.css
│       └── template.html (SVG)
│
├── data/             # Données JSON
│   ├── stars.json
│   └── tree.json     # Référentiel des compétences et AC
│
├── lib/              # Utilitaires et helpers
│   ├── animation.js  # Animations GSAP
│   ├── router.js     # Système de routing SPA
│   └── utils.js      # Fonctions utilitaires
│
└── main.js          # Point d'entrée (configuration des routes)
```

---

## Patterns et conventions

### 1. Pattern MVC pour les composants

Les composants UI suivent le pattern **MVC** :

```javascript
// Model - Données
let M = {
  treeData: null,
  selectedAC: null
};

// Controller - Logique métier
let C = {};
C.init = async function() {
  M.treeData = await loadData();
  return V.init(M.treeData);
}

// View - Génération DOM et événements
let V = {};
V.init = function(data) {
  let fragment = V.createFragment(data);
  V.attachEvents(fragment);
  return fragment;
}
```

### 2. Classes pour les composants UI

Les composants UI utilisent des **classes ES6** :

```javascript
class MonComposantView {
  constructor() {
    this.root = htmlToDOM(template);
    this.data = null;
    this.init();
  }

  async init() {
    await this.loadData();
    this.attachEvents();
  }

  html() {
    return template;
  }

  dom() {
    return this.root;
  }
}

export { MonComposantView };
```

### 3. Gestion des slots

Les templates utilisent des **slots** pour l'injection de contenu :

```html
<!-- Template avec slots -->
<div class="container">
  <slot name="header"></slot>
  <slot></slot> <!-- slot par défaut -->
  <slot name="footer"></slot>
</div>
```

```javascript
// Remplacement des slots
fragment.querySelector('slot[name="header"]').replaceWith(headerDOM);
fragment.querySelector('slot').replaceWith(contentDOM);
```

### 4. Utilitaires standards

```javascript
// Conversion HTML string → DocumentFragment
import { htmlToDOM, htmlToFragment } from "../../lib/utils.js";

// Rendu avec placeholders {{key}}
import { genericRenderer } from "../../lib/utils.js";
let html = genericRenderer(template, { title: "Titre", content: "Contenu" });
```

---

## Composants clés du projet

### 1. tree-skills (Arbre de compétences)

**Localisation**: `src/ui/tree-skills/`

**Responsabilité**: Afficher l'arbre SVG des compétences et gérer les interactions

**Fonctionnalités**:
- Chargement des données depuis `tree.json`
- Rendu du SVG avec les 5 compétences (c1-c5)
- Gestion des clics sur les éléments AC (groupes SVG avec id="ACxx.xx")
- Effets hover sur les AC (opacity)
- Ouverture de la popup avec les détails de l'AC

**Méthodes importantes**:
```javascript
loadData()              // Charge tree.json via fetch
attachEventListeners()  // Rend les AC cliquables
openACPopup(acCode)     // Affiche la popup avec les données de l'AC
```

### 2. popup-ac (Popup de détails AC)

**Localisation**: `src/ui/popup-ac/`

**Responsabilité**: Afficher les détails d'un AC et permettre de saisir la progression

**Design actuel**:
- Fond blanc/gris clair (`#FFFFFF` / `#F5F5F5`)
- Badges verts turquoise (`#1DD1A1`)
- Slider de progression personnalisé
- Boutons "Valider" (vert) et "Annuler" (blanc avec bordure)
- Position: top-right avec 40px de marge
- Dimensions: 280px × 400px max
- Animation: slide-in depuis la droite

**Éléments du template**:
```html
<div id="acPopup">
  <div class="popup-header">
    <h1 id="popupCode">AC25.01</h1>
    <p id="popupLibelle">Description...</p>
    <span id="popupAnnee">BUT1</span>
    <span id="popupCompetence">Comprendre</span>
  </div>
  <div class="popup-body">
    <input type="range" id="progressSlider" min="0" max="100" value="50">
    <span id="progressValue">50%</span>
    <button id="validateBtn">Valider</button>
    <button id="closePopupBtn">Annuler</button>
  </div>
</div>
```

---

## Structure des données (tree.json)

Le fichier `src/data/tree.json` contient le référentiel complet :

```json
[{
  "competenceId": {
    "nom_court": "Comprendre",
    "numero": 1,
    "libelle_long": "Comprendre les écosystèmes...",
    "couleur": "c1",
    "niveaux": [
      {
        "ordre": 1,
        "libelle": "Comprendre les éléments de communication...",
        "annee": "BUT1",
        "acs": [
          {
            "code": "AC11.01",
            "libelle": "Présenter une organisation..."
          }
        ]
      }
    ]
  }
}]
```

**Structure**:
- 5 compétences (c1 à c5)
- Chaque compétence a 3 niveaux (BUT1, BUT2, BUT3)
- Chaque niveau contient plusieurs AC (Apprentissages Critiques)

**Accès aux données**:
```javascript
// Parcourir toutes les compétences
for (const competenceId in treeData) {
  const competence = treeData[competenceId];
  
  // Parcourir tous les niveaux
  for (const niveau of competence.niveaux) {
    
    // Parcourir tous les AC
    for (const ac of niveau.acs) {
      console.log(ac.code, ac.libelle);
    }
  }
}
```

---

## User Stories en cours

### US002: Chargement du Référentiel (JSON) ✅ COMPLÈTE

**Objectif**: Charger le fichier JSON fourni pour connaître la liste des compétences et des AC

**Implémentation**:
- ✅ Fetch du fichier `/src/data/tree.json`
- ✅ Stockage dans `this.treeData`
- ✅ Gestion d'erreur avec try/catch
- ✅ Affichage console des données
- ✅ Données exploitables pour mapping

**Branche**: `US002-Initialisation-json`

### US003: Interaction avec les AC (EN COURS)

**Objectif**: Rendre les éléments AC cliquables et afficher une popup avec leurs détails

**Implémentation actuelle**:
- ✅ Tous les AC (`<g id="ACxx.xx">`) sont cliquables
- ✅ Popup affiche les données de l'AC sélectionné
- ✅ Design moderne blanc/gris/vert
- ✅ Slider de progression (0-100%)
- 🔄 Sauvegarde de la progression (TODO)

---

## Conventions de code

### Nommage

- **Classes**: `PascalCase` (ex: `TreeSkillsView`)
- **Fichiers**: `kebab-case` (ex: `tree-skills/`, `popup-ac/`)
- **Variables/Fonctions**: `camelCase` (ex: `loadData`, `attachEvents`)
- **Event handlers**: Préfixe `handler_` (ex: `handler_clickOnAC`)
- **Constantes**: `UPPER_SNAKE_CASE` (ex: `API_BASE_URL`)

### Imports

```javascript
// Utilitaires
import { htmlToDOM, htmlToFragment } from "../../lib/utils.js";

// Templates (utiliser ?raw pour Vite)
import template from "./template.html?raw";

// CSS
import "./style.css";

// Composants
import { HeaderView } from "../../ui/header/index.js";
```

### Exports

```javascript
// Export nommé (préféré)
export { MonComposantView };

// Export de fonction
export function MaPage(params) { ... }
```

### Événements DOM

```javascript
// Attacher les événements APRÈS la création du fragment
V.attachEvents = function(fragment) {
  const root = fragment.firstElementChild;
  
  root.addEventListener('click', (e) => {
    if (e.target.dataset.action === 'submit') {
      C.handler_submit(e);
    }
  });
  
  return fragment;
}
```

---

## Bonnes pratiques spécifiques

### 1. Chargement asynchrone des données

```javascript
async loadData() {
  try {
    const response = await fetch('/src/data/tree.json');
    const data = await response.json();
    this.treeData = data[0]; // Premier élément du tableau
    console.log('Données chargées avec succès', this.treeData);
  } catch (error) {
    console.error('Erreur lors du chargement des données:', error);
  }
}
```

### 2. Gestion des IDs SVG

Les AC dans le SVG ont des IDs au format `ACxx-xx` (avec tiret), mais dans les données JSON c'est `ACxx.xx` (avec point).

**Conversion**:
```javascript
// SVG → JSON
const acCode = element.id.replace('-', '.'); // "AC11-01" → "AC11.01"

// JSON → SVG (si besoin)
const svgId = acCode.replace('.', '-'); // "AC11.01" → "AC11-01"
```

### 3. Manipulation de la popup

```javascript
// Ouvrir la popup
const popup = document.getElementById('acPopup');
popup.classList.add('active');

// Fermer la popup
popup.classList.remove('active');

// Remplir les données
document.getElementById('popupCode').textContent = acData.code;
document.getElementById('popupLibelle').textContent = acData.libelle;
```

### 4. Slider de progression

```javascript
// Mettre à jour la valeur affichée
progressSlider.addEventListener('input', (e) => {
  const value = e.target.value;
  progressValue.textContent = value + '%';
  
  // Mettre à jour le gradient du slider
  e.target.style.background = `linear-gradient(to right, #1DD1A1 0%, #1DD1A1 ${value}%, #D0D0D0 ${value}%, #D0D0D0 100%)`;
});
```

---

## Style Guide

### Couleurs du projet

```css
/* Compétences */
--c1-gradient: linear-gradient(135deg, #667eea 0%, #764ba2 100%); /* Comprendre */
--c2-gradient: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); /* Concevoir */
--c3-gradient: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); /* Exprimer */
--c4-gradient: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%); /* Développer */
--c5-gradient: linear-gradient(135deg, #fa709a 0%, #fee140 100%); /* Entreprendre */

/* Popup */
--popup-primary: #1DD1A1;      /* Vert turquoise */
--popup-primary-dark: #10AC84; /* Vert turquoise foncé */
--popup-bg: #FFFFFF;           /* Blanc */
--popup-bg-alt: #F5F5F5;       /* Gris très clair */
--popup-text: #333333;         /* Gris foncé */
--popup-border: #D0D0D0;       /* Gris clair */
```

### Spacing

```css
--spacing-xs: 8px;
--spacing-sm: 12px;
--spacing-md: 16px;
--spacing-lg: 20px;
--spacing-xl: 25px;
```

### Border Radius

```css
--radius-sm: 15px;
--radius-md: 20px;
--radius-lg: 25px;
```

---

## Tests et validation

### Checklist avant commit

- [ ] Pas d'erreur dans la console
- [ ] Les données se chargent correctement
- [ ] Les événements fonctionnent (clics, hover)
- [ ] La popup s'ouvre et se ferme correctement
- [ ] Le slider de progression fonctionne
- [ ] Design responsive (mobile)
- [ ] Code formatté (Prettier)

### Commandes utiles

```bash
# Démarrer le serveur de dev
npm run dev

# Build de production
npm run build

# Prévisualiser le build
npm run preview

# Formatter le code
npx prettier --write src/
```

---

## Points d'attention

### 1. Timing du DOM

Utiliser `setTimeout` pour s'assurer que le SVG est bien chargé avant d'attacher les événements :

```javascript
attachEventListeners() {
  setTimeout(() => {
    const acElements = this.root.querySelectorAll('g[id^="AC"]');
    // ... attacher les événements
  }, 100);
}
```

### 2. Popup dans le body

La popup est injectée dans le `<body>` (pas dans le composant) pour éviter les problèmes de z-index et positionnement :

```javascript
initPopup() {
  if (!document.getElementById('acPopup')) {
    document.body.insertAdjacentHTML('beforeend', popupTemplate);
    this.attachPopupEvents();
  }
}
```

### 3. Gestion des slots

Toujours vérifier qu'un slot existe avant de le remplacer :

```javascript
const slot = fragment.querySelector('slot[name="header"]');
if (slot) {
  slot.replaceWith(headerDOM);
}
```

---

## Ressources et références

### Documentation
- **Architecture**: `/docs/ARCHITECTURE.md`
- **Router**: `/docs/router.md`

### Dépendances principales
- **Vite**: https://vitejs.dev/
- **GSAP**: https://greensock.com/gsap/

### Convention Git
- Branches: `US00X-nom-de-la-feature`
- Commits: Messages clairs et descriptifs
- Fusion: Branches fusionnées après validation des critères d'acceptation

---

## Contact et contexte pédagogique

**Projet**: SAE3.03 - Développer pour le web et les médias numériques
**Formation**: BUT MMI (Métiers du Multimédia et de l'Internet)
**Objectif**: Créer une application web pour visualiser et suivre la progression sur le référentiel de compétences du BUT

---

## Instructions pour GitHub Copilot

Quand tu génères du code pour ce projet :

1. **Respecte l'architecture MVC** avec Model, Controller, View séparés
2. **Utilise les utilitaires existants** (`htmlToDOM`, `genericRenderer`, etc.)
3. **Suis les conventions de nommage** établies (camelCase, PascalCase, kebab-case)
4. **Importe les templates avec `?raw`** pour Vite
5. **Utilise des classes ES6** pour les composants UI
6. **Gère les erreurs** avec try/catch pour les appels async
7. **Commente le code** en français pour les parties complexes
8. **Pense mobile-first** pour le responsive
9. **Utilise le pattern slot** pour les layouts et templates
10. **Retourne toujours des DocumentFragment** pour les composants

**Couleurs préférées**: Vert turquoise `#1DD1A1` pour les actions principales, fond blanc/gris clair pour les conteneurs.

**Design moderne**: Coins arrondis, ombres légères, animations fluides, espaces généreux.
