import { htmlToDOM } from "../../lib/utils.js";
import { Animation } from "../../lib/animation.js";
import template from "./template.html?raw";

/**
 * Composant UI tree-skills
 * Responsabilité : Afficher le SVG et gérer les interactions (pas de logique métier)
 * Suit le pattern des composants UI (comme SpinnerView, ShapesView, etc.)
 */
class TreeSkillsView {
  constructor() {
    this.root = htmlToDOM(template);
    this.animationPlayed = false;
  }

  /**
   * Retourne le template HTML
   */
  html() {
    return template;
  }

  /**
   * Retourne le DOM du composant
   */
  dom() {
    return this.root;
  }

  /**
   * Lance l'animation d'entrée du graphe
   */
  playEntryAnimation() {
    // Animations désactivées temporairement
    this.animationPlayed = true;
  }

  /**
   * Retourne tous les groupes AC
   */
  getAllACs() {
    return this.root.querySelectorAll('g[id^="AC"]');
  }

  /**
   * Retourne tous les groupes Level
   */
  getAllLevels() {
    return this.root.querySelectorAll('g[id^="level_"]');
  }

  /** 
   * Active les interactions sur les AC
   * @param {Function} onACClick - Callback appelé avec le code de l'AC cliqué
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
   * Active les interactions sur les niveaux
   * @param {Function} onLevelClick - Callback appelé avec l'ID du niveau cliqué
   */
  enableLevelInteractions(onLevelClick) {
    const allLevels = this.getAllLevels();
    
    allLevels.forEach(levelElement => {
      levelElement.style.cursor = 'pointer';
      
      levelElement.addEventListener('click', (e) => {
        e.stopPropagation();
        // Passer juste l'ID, le Controller ira chercher les données dans le Model
        onLevelClick(levelElement.id);
      });
    });
  }

  /**
   * Met à jour le visuel d'un AC selon sa progression
   * @param {string} acCode - Code de l'AC (ex: "AC11.01")
   * @param {number} progression - Valeur de 0 à 100
   */
  updateACVisual(acCode, progression) {
    const acElement = this.root.getElementById(acCode);
    if (!acElement) return;

    // Map des couleurs par niveau (utilise les variables CSS)
    const levelColors = {
      '11': 'var(--color-comprendre-1)', '21': 'var(--color-comprendre-2)', '31': 'var(--color-comprendre-3)',  // Comprendre
      '12': 'var(--color-concevoir-1)', '22': 'var(--color-concevoir-2)', '32': 'var(--color-concevoir-3)',  // Concevoir
      '13': 'var(--color-exprimer-1)', '23': 'var(--color-exprimer-2)', '33': 'var(--color-exprimer-3)',  // Exprimer
      '14': 'var(--color-developper-1)', '24': 'var(--color-developper-2)', '34': 'var(--color-developper-3)',  // Développer
      '15': 'var(--color-entreprendre-1)', '25': 'var(--color-entreprendre-2)', '35': 'var(--color-entreprendre-3)',  // Entreprendre
    };

    // Extraire le niveau (ex: AC11.01 -> "11")
    const levelCode = acCode.substring(2, 4);
    const levelColor = levelColors[levelCode] || '#6E7275';

    // Trouver le rectangle principal de l'AC
    const rect = acElement.querySelector('rect');
    if (!rect) return;

    // Récupérer les dimensions originales du rectangle
    const rectWidth = parseFloat(rect.getAttribute('width'));
    const rectX = parseFloat(rect.getAttribute('x'));
    const rectY = parseFloat(rect.getAttribute('y'));
    const rectHeight = parseFloat(rect.getAttribute('height'));
    const rectRx = rect.getAttribute('rx');
    const rectStrokeWidth = rect.getAttribute('stroke-width');

    // Calculer la largeur du remplissage en fonction de la progression
    const fillWidth = (rectWidth * progression) / 100;

    // Vérifier s'il existe déjà un rectangle de remplissage
    let fillRect = acElement.querySelector('.progress-fill');
    
    if (!fillRect) {
      // Créer le rectangle de remplissage
      fillRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      fillRect.classList.add('progress-fill');
      fillRect.setAttribute('x', rectX);
      fillRect.setAttribute('y', rectY);
      fillRect.setAttribute('height', rectHeight);
      fillRect.setAttribute('rx', rectRx);
      fillRect.setAttribute('stroke-width', rectStrokeWidth);
      
      // Insérer après le rectangle principal
      rect.parentNode.insertBefore(fillRect, rect.nextSibling);
    }

    // Mettre à jour la largeur et la couleur du rectangle de progression
    fillRect.setAttribute('width', fillWidth);
    fillRect.setAttribute('fill', levelColor);
    fillRect.setAttribute('stroke', levelColor);
    fillRect.setAttribute('opacity', '0.8');
  }

  /**
   * Met à jour TOUS les cercles de niveau selon les progressions
   * @param {Object} progressions - Objet {acCode: progression}
   */
  updateAllLevels(progressions) {
    const allLevels = this.getAllLevels();
    
    allLevels.forEach(levelElement => {
      // Trouver tous les AC de ce niveau
      const levelACs = this._findACsForLevel(levelElement);
      
      if (levelACs.length === 0) return;
      
      // Calculer la progression moyenne des AC de ce niveau
      let totalProgression = 0;
      let acCount = 0;
      let firstACCode = null;
      
      levelACs.forEach(acElement => {
        const acCode = acElement.id;
        if (!firstACCode) firstACCode = acCode;
        const progression = progressions[acCode] || 0;
        totalProgression += progression;
        acCount++;
      });
      
      const averageProgression = acCount > 0 ? totalProgression / acCount : 0;
      
      // Déterminer la couleur selon le premier AC du niveau
      const levelColor = this._getLevelColorFromAC(firstACCode);
      
      // Mettre à jour le cercle de niveau avec la progression moyenne
      const levelCircle = levelElement.querySelector('circle, ellipse');
      if (levelCircle) {
        this._updateLevelProgress(levelElement, levelCircle, averageProgression, levelColor);
      }
    });
  }

  /**
   * Récupère la couleur d'un niveau à partir d'un code AC
   * @param {string} acCode - Code de l'AC (ex: "AC11.01")
   * @returns {string} - Couleur hexadécimale
   * @private
   */
  _getLevelColorFromAC(acCode) {
    if (!acCode) return '#6E7275';
    
    const levelColors = {
      '11': 'var(--color-comprendre-1)', '21': 'var(--color-comprendre-2)', '31': 'var(--color-comprendre-3)',  // Comprendre
      '12': 'var(--color-concevoir-1)', '22': 'var(--color-concevoir-2)', '32': 'var(--color-concevoir-3)',  // Concevoir
      '13': 'var(--color-exprimer-1)', '23': 'var(--color-exprimer-2)', '33': 'var(--color-exprimer-3)',  // Exprimer
      '14': 'var(--color-developper-1)', '24': 'var(--color-developper-2)', '34': 'var(--color-developper-3)',  // Développer
      '15': 'var(--color-entreprendre-1)', '25': 'var(--color-entreprendre-2)', '35': 'var(--color-entreprendre-3)',  // Entreprendre
    };
    
    const levelCode = acCode.substring(2, 4);
    return levelColors[levelCode] || '#6E7275';
  }

  /**
   * Trouve tous les AC associés à un niveau
   * @param {Element} levelElement - Élément level du DOM
   * @returns {Array<Element>} - Liste des éléments AC
   * @private
   */
  _findACsForLevel(levelElement) {
    // Remonter jusqu'au groupe "niveau_X" qui contient les AC et leur level
    let niveauGroup = levelElement.parentElement;
    while (niveauGroup && !niveauGroup.id.startsWith('niveau_')) {
      niveauGroup = niveauGroup.parentElement;
    }
    
    if (!niveauGroup) return [];
    
    // Retourner tous les groupes AC de ce niveau
    return Array.from(niveauGroup.querySelectorAll('g[id^="AC"]'));
  }

  /**
   * Met à jour le cercle de progression d'un niveau
   * @param {Element} levelGroup - Groupe contenant le level
   * @param {Element} circle - Le cercle (circle ou ellipse)
   * @param {number} progression - Progression de 0 à 100
   * @param {string} color - Couleur de l'arc
   * @private
   */
  _updateLevelProgress(levelGroup, circle, progression, color) {
    const isEllipse = circle.tagName === 'ellipse';
    const strokeWidth = 4;
    
    // Vérifier si un cercle de progression existe déjà
    let progressCircle = levelGroup.querySelector('.level-progress-circle');
    
    if (!progressCircle) {
      // Créer un cercle/ellipse de progression identique
      progressCircle = document.createElementNS('http://www.w3.org/2000/svg', circle.tagName);
      progressCircle.classList.add('level-progress-circle');
      
      // Copier tous les attributs de position et taille
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
      progressCircle.setAttribute('stroke-width', strokeWidth);
      progressCircle.setAttribute('stroke-linecap', 'round');
      progressCircle.setAttribute('transform', 'rotate(-90 ' + cx + ' ' + cy + ')');
      
      // Insérer après le cercle de base
      circle.parentNode.insertBefore(progressCircle, circle.nextSibling);
    }
    
    if (progression <= 0) {
      progressCircle.setAttribute('stroke-dasharray', '0 9999');
      return;
    }
    
    // Calculer la circonférence
    const rx = isEllipse ? parseFloat(circle.getAttribute('rx')) : parseFloat(circle.getAttribute('r'));
    const ry = isEllipse ? parseFloat(circle.getAttribute('ry')) : parseFloat(circle.getAttribute('r'));
    const circumference = Math.PI * (3 * (rx + ry) - Math.sqrt((3 * rx + ry) * (rx + 3 * ry)));
    
    // Calculer le dasharray pour la progression
    const dashLength = (circumference * progression) / 100;
    const gapLength = circumference - dashLength;
    
    progressCircle.setAttribute('stroke-dasharray', dashLength + ' ' + gapLength);
    progressCircle.setAttribute('stroke', color);
  }
}

export { TreeSkillsView };