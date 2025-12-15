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

    // Map des couleurs par niveau
    const levelColors = {
      '11': '#EE6E6E', '21': '#F13434', '31': '#FF2722',  // Comprendre
      '12': '#FFA758', '22': '#F78B4A', '32': '#FF5F00',  // Concevoir
      '13': '#E2D19B', '23': '#FFDA41', '33': '#EFBA11',  // Exprimer
      '14': '#D8FFAE', '24': '#B7FF6B', '34': '#48D57C',  // Développer
      '15': '#C8D8EF', '25': '#89ADD9', '35': '#19C8BA',  // Entreprendre
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
    // Pour chaque AC avec progression, trouver et mettre à jour son cercle level
    for (const acCode in progressions) {
      if (progressions[acCode] <= 0) continue;
      
      const acElement = this.root.getElementById(acCode);
      if (!acElement) continue;
      
      const levelCircle = this._findLevelCircleForAC(acElement);
      if (levelCircle) {
        this._setLevelActive(levelCircle);
      }
    }
  }

  /**
   * Trouve le cercle de niveau associé à un AC
   * @param {Element} acElement - Élément AC du DOM
   * @returns {Element|null} - Le cercle (circle ou ellipse) du niveau
   * @private
   */
  _findLevelCircleForAC(acElement) {
    // Remonter jusqu'au groupe "niveau_X" qui contient les AC et leur level
    let niveauGroup = acElement.parentElement;
    while (niveauGroup && !niveauGroup.id.startsWith('niveau_')) {
      niveauGroup = niveauGroup.parentElement;
    }
    
    if (!niveauGroup) return null;
    
    // Trouver le groupe level dans ce même groupe niveau
    const levelGroup = niveauGroup.querySelector('g[id^="level_"]');
    if (!levelGroup) return null;
    
    // Retourner le cercle ou ellipse
    return levelGroup.querySelector('circle, ellipse');
  }

  /**
   * Active visuellement un cercle de niveau (stroke blanc)
   * @param {Element} circle - Le cercle à activer
   * @private
   */
  _setLevelActive(circle) {
    circle.setAttribute('stroke', '#FFFFFF');
    circle.setAttribute('stroke-width', '3');
  }

  /**
   * Désactive visuellement un cercle de niveau (stroke gris)
   * @param {Element} circle - Le cercle à désactiver
   * @private
   */
  _setLevelInactive(circle) {
    circle.setAttribute('stroke', '#6E7275');
    circle.setAttribute('stroke-width', '2.69903');
  }
}

export { TreeSkillsView };