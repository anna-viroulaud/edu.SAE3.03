import { htmlToDOM } from "../../lib/utils.js";
import template from "./template.html?raw";

/**
 * Composant UI tree-skills
 * Responsabilité : Afficher le SVG et gérer les interactions (pas de logique métier)
 * Suit le pattern des composants UI (comme SpinnerView, ShapesView, etc.)
 */
class TreeSkillsView {
  constructor() {
    this.root = htmlToDOM(template);
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
        // Passer juste l'ID, le Controller ira chercher les données dans le Model
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

    // Trouver le rectangle principal de l'AC
    const rect = acElement.querySelector('rect');
    if (!rect) return;

    // Récupérer les dimensions originales du rectangle
    const rectWidth = parseFloat(rect.getAttribute('width')); // 36.003
    const rectX = parseFloat(rect.getAttribute('x'));
    const rectY = parseFloat(rect.getAttribute('y'));
    const rectHeight = parseFloat(rect.getAttribute('height'));
    const rectRx = rect.getAttribute('rx');
    const rectStroke = rect.getAttribute('stroke');
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
      fillRect.setAttribute('fill', '#6E7275');
      fillRect.setAttribute('stroke', rectStroke);
      fillRect.setAttribute('stroke-width', rectStrokeWidth);
      
      // Insérer après le rectangle noir
      rect.parentNode.insertBefore(fillRect, rect.nextSibling);
    }

    // Mettre à jour la largeur du remplissage avec animation
    fillRect.setAttribute('width', fillWidth);

    // Supprimer les anciennes classes de progression
    acElement.classList.remove('prog-0', 'prog-25', 'prog-50', 'prog-75', 'prog-100');

    // Appliquer la classe selon la progression
    if (progression === 0) {
      acElement.classList.add('prog-0');
    } else if (progression < 50) {
      acElement.classList.add('prog-25');
    } else if (progression < 75) {
      acElement.classList.add('prog-50');
    } else if (progression < 100) {
      acElement.classList.add('prog-75');
    } else {
      acElement.classList.add('prog-100');
    }

    console.log(`🎨 Visuel mis à jour : ${acCode} = ${progression}% (width: ${fillWidth.toFixed(1)}px)`);
  }
}

export { TreeSkillsView };