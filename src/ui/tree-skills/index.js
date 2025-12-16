import { htmlToDOM } from "../../lib/utils.js";
import template from "./template.html?raw";

/**
 * TreeSkillsView - Composant UI pour l'arbre de compétences
 * 
 * Responsabilités :
 * - Afficher le SVG de l'arbre de compétences
 * - Gérer les interactions utilisateur (clics sur AC et niveaux)
 * - Mettre à jour visuellement les progressions
 * 
 * Pattern : Composant UI simple avec méthodes publiques claires
 */
class TreeSkillsView {
  constructor() {
    this.root = htmlToDOM(template);
    
    // Table de correspondance : niveau → couleur CSS
    this.LEVEL_COLORS = {
      // Comprendre (BUT1, BUT2, BUT3)
      '11': 'var(--color-comprendre-1)',
      '21': 'var(--color-comprendre-2)',
      '31': 'var(--color-comprendre-3)',
      
      // Concevoir (BUT1, BUT2, BUT3)
      '12': 'var(--color-concevoir-1)',
      '22': 'var(--color-concevoir-2)',
      '32': 'var(--color-concevoir-3)',
      
      // Exprimer (BUT1, BUT2, BUT3)
      '13': 'var(--color-exprimer-1)',
      '23': 'var(--color-exprimer-2)',
      '33': 'var(--color-exprimer-3)',
      
      // Développer (BUT1, BUT2, BUT3)
      '14': 'var(--color-developper-1)',
      '24': 'var(--color-developper-2)',
      '34': 'var(--color-developper-3)',
      
      // Entreprendre (BUT1, BUT2, BUT3)
      '15': 'var(--color-entreprendre-1)',
      '25': 'var(--color-entreprendre-2)',
      '35': 'var(--color-entreprendre-3)',
    };
  }

  /**
   * Retourne le DOM du composant (méthode standard des composants UI)
   */
  dom() {
    return this.root;
  }

  /**
   * Retourne tous les éléments AC du SVG
   */
  getAllACs() {
    return this.root.querySelectorAll('g[id^="AC"]');
  }

  /**
   * Retourne tous les éléments de niveau (cercles) du SVG
   */
  getAllLevels() {
    return this.root.querySelectorAll('g[id^="level_"]');
  }


  /**
   * INTERACTIONS : Active les clics sur les AC
   * @param {Function} onACClick - Callback appelé avec le code AC (ex: "AC11.01")
   */
  enableACInteractions(onACClick) {
    const allACs = this.getAllACs();
    
    allACs.forEach(acElement => {
      acElement.style.cursor = 'pointer';
      acElement.addEventListener('click', () => {
        onACClick(acElement.id);
      });
    });
  }

  /**
   * INTERACTIONS : Active les clics sur les niveaux (cercles)
   * @param {Function} onLevelClick - Callback appelé avec l'ID du niveau
   */
  enableLevelInteractions(onLevelClick) {
    const allLevels = this.getAllLevels();
    
    allLevels.forEach(levelElement => {
      levelElement.style.cursor = 'pointer';
      levelElement.addEventListener('click', (e) => {
        e.stopPropagation(); // Empêche la propagation vers les AC
        onLevelClick(levelElement.id);
      });
    });
  }


  /**
   * AFFICHAGE : Affiche les labels sous tous les AC
   * @param {Object} progressions - Objet {acCode: progression} (ex: {"AC11.01": 75})
   * 
   * Logique de couleur :
   * - Si progression > 0 : couleur du niveau (rouge, orange, vert selon niveau)
   * - Si progression = 0 : gris par défaut
   */
  showAllACLabels(progressions = {}) {
    const allACs = this.getAllACs();
    
    allACs.forEach(acElement => {
      const acCode = acElement.id; // Ex: "AC11.01"
      const rect = acElement.querySelector('rect');
      if (!rect) return;
      
      // Récupérer la progression de cet AC
      const progression = progressions[acCode] || 0;
      
      // Déterminer la couleur du label
      const labelColor = this._getLabelColor(acCode, progression);
      
      // Créer ou mettre à jour le label
      this._createACLabel(acElement, acCode, rect, labelColor);
    });
  }

  /**
   * MISE À JOUR : Met à jour visuellement un AC selon sa progression
   * @param {string} acCode - Code de l'AC (ex: "AC11.01")
   * @param {number} progression - Valeur de 0 à 100
   * 
   * Actions :
   * 1. Met à jour le rectangle de progression (remplissage coloré)
   * 2. Met à jour la couleur du label
   */
  updateACVisual(acCode, progression) {
    const acElement = this.root.getElementById(acCode);
    if (!acElement) return;

    const rect = acElement.querySelector('rect');
    if (!rect) return;

    // 1. Mettre à jour le rectangle de progression
    const levelColor = this._getLevelColor(acCode);
    this._updateProgressRect(acElement, rect, progression, levelColor);

    // 2. Mettre à jour le label
    const labelColor = this._getLabelColor(acCode, progression);
    this._createACLabel(acElement, acCode, rect, labelColor);
  }

  /**
   * MISE À JOUR : Met à jour tous les cercles de niveau selon les progressions
   * @param {Object} progressions - Objet {acCode: progression}
   * 
   * Calcule la progression moyenne de tous les AC d'un niveau
   * et met à jour le cercle avec un arc de progression
   */
  updateAllLevels(progressions) {
    const allLevels = this.getAllLevels();
    
    allLevels.forEach(levelElement => {
      // Trouver tous les AC de ce niveau
      const levelACs = this._findACsForLevel(levelElement);
      if (levelACs.length === 0) return;
      
      // Calculer la progression moyenne
      const averageProgression = this._calculateAverageProgression(levelACs, progressions);
      
      // Récupérer la couleur du premier AC
      const firstACCode = levelACs[0].id;
      const levelColor = this._getLevelColor(firstACCode);
      
      // Mettre à jour le cercle de progression
      const circle = levelElement.querySelector('circle, ellipse');
      if (circle) {
        this._updateLevelCircle(levelElement, circle, averageProgression, levelColor);
      }
    });
  }


  /**
   * Récupère la couleur CSS d'un niveau à partir du code AC
   * Ex: "AC11.01" → extrait "11" → retourne 'var(--color-comprendre-1)'
   */
  _getLevelColor(acCode) {
    const levelCode = acCode.substring(2, 4); // "AC11.01" → "11"
    return this.LEVEL_COLORS[levelCode] || 'var(--color-stroke-default)';
  }

  /**
   * Détermine la couleur du label selon la progression
   * - 0% → gris
   * - >0% → couleur du niveau
   */
  _getLabelColor(acCode, progression) {
    if (progression > 0) {
      return this._getLevelColor(acCode);
    }
    return 'var(--color-stroke-default)'; // Gris par défaut
  }

  /**
   * Convertit une variable CSS (ex: 'var(--color-comprendre-1)') en couleur hex
   * Nécessaire car SVG ne comprend pas les variables CSS dans setAttribute()
   */
  _cssVarToHex(cssVar) {
    if (!cssVar.startsWith('var(')) return cssVar;
    
    // Extraire le nom de la variable : 'var(--color-name)' → '--color-name'
    const varName = cssVar.match(/var\((--[\w-]+)\)/)?.[1];
    if (!varName) return cssVar;
    
    // Lire la valeur calculée depuis le CSS
    const color = getComputedStyle(document.documentElement)
      .getPropertyValue(varName)
      .trim();
    
    return color || '#6E7275'; // Fallback gris
  }


  /**
   * Crée ou met à jour le texte du code AC sous le rectangle
   * Ex: Affiche "AC11.01" en dessous du rectangle avec la bonne couleur
   */
  _createACLabel(acElement, acCode, rect, color) {
    // Chercher si le label existe déjà
    let label = acElement.querySelector('.ac-label');
    
    if (!label) {
      // Créer un nouveau label SVG
      label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      label.classList.add('ac-label');
      label.textContent = acCode;
      
      // Position : centré horizontalement, 8px sous le rectangle
      const rectX = parseFloat(rect.getAttribute('x'));
      const rectWidth = parseFloat(rect.getAttribute('width'));
      const rectY = parseFloat(rect.getAttribute('y'));
      const rectHeight = parseFloat(rect.getAttribute('height'));
      
      label.setAttribute('x', rectX + (rectWidth / 2));
      label.setAttribute('y', rectY + rectHeight + 8);
      label.setAttribute('text-anchor', 'middle');
      
      // Ajouter au groupe AC
      acElement.appendChild(label);
    }
    
    // Mettre à jour la couleur (conversion CSS var → hex)
    const hexColor = this._cssVarToHex(color);
    label.setAttribute('fill', hexColor);
  }

  /**
   * Met à jour le rectangle de progression (remplissage coloré)
   * Crée un second rectangle par-dessus le premier avec une largeur proportionnelle
   */
  _updateProgressRect(acElement, rect, progression, color) {
    // Récupérer ou créer le rectangle de progression
    let fillRect = acElement.querySelector('.progress-fill');
    
    if (!fillRect) {
      // Créer un nouveau rectangle identique au premier
      fillRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      fillRect.classList.add('progress-fill');
      fillRect.setAttribute('x', rect.getAttribute('x'));
      fillRect.setAttribute('y', rect.getAttribute('y'));
      fillRect.setAttribute('height', rect.getAttribute('height'));
      fillRect.setAttribute('rx', rect.getAttribute('rx'));
      fillRect.setAttribute('stroke-width', rect.getAttribute('stroke-width'));
      fillRect.setAttribute('opacity', '0.8');
      
      // Insérer juste après le rectangle de base
      rect.parentNode.insertBefore(fillRect, rect.nextSibling);
    }
    
    // Calculer la largeur en fonction de la progression
    const rectWidth = parseFloat(rect.getAttribute('width'));
    const fillWidth = (rectWidth * progression) / 100;
    
    // Appliquer
    fillRect.setAttribute('width', fillWidth);
    fillRect.setAttribute('fill', color);
    fillRect.setAttribute('stroke', color);
  }


  /**
   * Trouve tous les AC appartenant à un niveau (cercle)
   * Remonte dans le DOM jusqu'au groupe "niveau_X" parent
   */
  _findACsForLevel(levelElement) {
    // Remonter jusqu'au groupe parent "niveau_1", "niveau_2", etc.
    let niveauGroup = levelElement.parentElement;
    while (niveauGroup && !niveauGroup.id.startsWith('niveau_')) {
      niveauGroup = niveauGroup.parentElement;
    }
    
    if (!niveauGroup) return [];
    
    // Retourner tous les groupes AC enfants
    return Array.from(niveauGroup.querySelectorAll('g[id^="AC"]'));
  }

  /**
   * Calcule la progression moyenne de plusieurs AC
   */
  _calculateAverageProgression(acElements, progressions) {
    let total = 0;
    let count = 0;
    
    acElements.forEach(acElement => {
      const acCode = acElement.id;
      const progression = progressions[acCode] || 0;
      total += progression;
      count++;
    });
    
    return count > 0 ? total / count : 0;
  }

  /**
   * Met à jour le cercle de niveau avec un arc de progression
   * Utilise stroke-dasharray pour créer un arc proportionnel à la progression
   */
  _updateLevelCircle(levelGroup, circle, progression, color) {
    const isEllipse = circle.tagName === 'ellipse';
    
    // Récupérer ou créer le cercle de progression
    let progressCircle = levelGroup.querySelector('.level-progress-circle');
    
    if (!progressCircle) {
      // Créer un cercle identique au premier
      progressCircle = document.createElementNS('http://www.w3.org/2000/svg', circle.tagName);
      progressCircle.classList.add('level-progress-circle');
      
      const cx = circle.getAttribute('cx');
      const cy = circle.getAttribute('cy');
      
      progressCircle.setAttribute('cx', cx);
      progressCircle.setAttribute('cy', cy);
      
      if (isEllipse) {
        progressCircle.setAttribute('rx', circle.getAttribute('rx'));
        progressCircle.setAttribute('ry', circle.getAttribute('ry'));
      } else {
        progressCircle.setAttribute('r', circle.getAttribute('r'));
      }
      
      progressCircle.setAttribute('fill', 'none');
      progressCircle.setAttribute('stroke-width', '4');
      progressCircle.setAttribute('stroke-linecap', 'round');
      progressCircle.setAttribute('transform', `rotate(-90 ${cx} ${cy})`);
      
      // Insérer après le cercle de base
      circle.parentNode.insertBefore(progressCircle, circle.nextSibling);
    }
    
    // Si pas de progression, masquer l'arc
    if (progression <= 0) {
      progressCircle.setAttribute('stroke-dasharray', '0 9999');
      return;
    }
    
    // Calculer la circonférence (formule d'approximation pour ellipse)
    const rx = isEllipse ? parseFloat(circle.getAttribute('rx')) : parseFloat(circle.getAttribute('r'));
    const ry = isEllipse ? parseFloat(circle.getAttribute('ry')) : parseFloat(circle.getAttribute('r'));
    const circumference = Math.PI * (3 * (rx + ry) - Math.sqrt((3 * rx + ry) * (rx + 3 * ry)));
    
    // Calculer la longueur de l'arc selon la progression
    const arcLength = (circumference * progression) / 100;
    const gapLength = circumference - arcLength;
    
    // Appliquer (dasharray = "longueur_trait longueur_espace")
    progressCircle.setAttribute('stroke-dasharray', `${arcLength} ${gapLength}`);
    progressCircle.setAttribute('stroke', color);
  }
}

export { TreeSkillsView };