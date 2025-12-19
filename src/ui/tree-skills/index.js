import { htmlToDOM } from "../../lib/utils.js";
import template from "./template.html?raw";
import { Animation } from "../../lib/animation.js";

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
  /**
   * @param {Object} levelColors - Table de correspondance niveau → couleur CSS (optionnel)
   */
  constructor(levelColors = null) {
    this.root = htmlToDOM(template);
    
    // Utiliser les couleurs fournies ou les couleurs par défaut
    this.LEVEL_COLORS = levelColors || this.getDefaultLevelColors();
  }

  /**
   * Retourne les couleurs par défaut si aucune n'est fournie
   * @returns {Object} Table de correspondance niveau → couleur CSS
   */
  getDefaultLevelColors() {
    return {
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
   * Retourne le template HTML (méthode standard des composants UI)
   */
  html() {
    return template;
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
   * Affiche les labels sous tous les AC
   */
  showAllACLabels(progressions = {}) {
    this.getAllACs().forEach(acElement => {
      const rect = acElement.querySelector('rect');
      if (!rect) return;
      
      const acCode = acElement.id;
      const progression = progressions[acCode] || 0;
      const labelColor = this.getLabelColor(acCode, progression);
      
      this.createACLabel(acElement, acCode, rect, labelColor);
    });
  }

  /**
   * Met à jour visuellement un AC selon sa progression
   */
  updateACVisual(acCode, progression) {
    const acElement = this.root.getElementById(acCode);
    if (!acElement) return;

    const rect = acElement.querySelector('rect');
    if (!rect) return;

    const levelColor = this.getLevelColor(acCode);
    this.updateProgressRect(acElement, rect, progression, levelColor);
    
    const labelColor = this.getLabelColor(acCode, progression);
    this.createACLabel(acElement, acCode, rect, labelColor);
  }

  /**
   * Ajoute un indicateur visuel pour les AC avec preuve
   */
  setProofIndicator(acCode, proof) {
    const acElement = this.root.getElementById(acCode);
    if (!acElement) return;

    // Retirer l'indicateur existant
    const existing = acElement.querySelector('.proof-indicator');
    if (existing) existing.remove();
    if (!proof) return;

    // Positionner le cercle en haut à droite du rectangle
    const rect = acElement.querySelector('rect');
    const x = rect ? parseFloat(rect.getAttribute('x')) || 0 : 0;
    const y = rect ? parseFloat(rect.getAttribute('y')) || 0 : 0;
    const w = rect ? parseFloat(rect.getAttribute('width')) || 0 : 0;

    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.classList.add('proof-indicator');
    circle.setAttribute('cx', String(x + w - 6));
    circle.setAttribute('cy', String(y + 6));
    circle.setAttribute('r', '4');
    circle.setAttribute('fill', '#ffffffff');
    circle.setAttribute('stroke', '#ffffff');
    circle.setAttribute('stroke-width', '0.8');

    acElement.appendChild(circle);
  }

  /**
   * Convertit un code niveau ('11', '21', '31', etc.) en ID SVG
   * Table de correspondance basée sur l'analyse du template.html
   */
  levelCodeToSvgId(levelCode) {
    const mapping = {
      // Compétence 1 - Comprendre
      '11': 'level_1',        // niveau_1 (BUT1)
      '21': 'level_1_2',      // niveau_2 (BUT2)
      '31': 'level_1_5',      // niveau_3 (BUT3)
      
      // Compétence 2 - Concevoir  
      '12': 'level_1_3',      // niveau_1_2 (BUT1)
      '22': 'level_1_4',      // niveau_2_2 (BUT2)
      '32': 'level_1_8',      // niveau_3_2 (BUT3)
      
      // Compétence 3 - Exprimer
      '13': 'level_1_6',      // niveau_1_3 (BUT1)
      '23': 'level_1_7',      // niveau_2_3 (BUT2)
      '33': 'level_1_11',     // niveau_3_3 (BUT3)
      
      // Compétence 4 - Développer
      '14': 'level_1_9',      // niveau_1_4 (BUT1)
      '24': 'level_1_10',     // niveau_2_4 (BUT2)
      '34': 'level_1_14',     // niveau_3_4 (BUT3)
      
      // Compétence 5 - Entreprendre
      '15': 'level_1_12',     // niveau_1_5 (BUT1)
      '25': 'level_1_13',     // niveau_2_5 (BUT2)
      '35': null,             // niveau_3_5 n'existe pas dans le SVG
    };
    
    return mapping[levelCode] || null;
  }

  /**
   * Met à jour un cercle de niveau (méthode pure - pas de calcul)
   */
  updateLevelVisuals(levelId, progression) {
    // Si levelId commence par 'level_', c'est déjà un ID SVG
    let svgId = levelId;
    if (!levelId.startsWith('level_')) {
      // Sinon, c'est un code niveau ('11', '21', etc.) qu'il faut convertir
      svgId = this.levelCodeToSvgId(levelId);
    }
    if (!svgId) {
      return;
    }
    
    const levelElement = this.root.querySelector(`g[id="${svgId}"]`);
    if (!levelElement) {
      console.warn(`Niveau non trouvé dans le DOM: ${svgId} (depuis ${levelId})`);
      return;
    }
    
    const circle = levelElement.querySelector('circle, ellipse');
    if (!circle) {
      console.warn(`Circle/ellipse non trouvé dans ${svgId}`);
      return;
    }
    
    // Extraire le code niveau original pour trouver la couleur
    let levelCode = levelId.startsWith('level_') ? levelId.replace('level_', '').replace('_', '') : levelId;
    const levelColor = this.LEVEL_COLORS[levelCode] || 'var(--color-stroke-default)';
    
    this.updateLevelCircle(levelElement, circle, progression, levelColor);
  }

  /**
   * Récupère la couleur d'un niveau depuis le code AC
   */
  getLevelColor(acCode) {
    const levelCode = acCode.substring(2, 4);
    return this.LEVEL_COLORS[levelCode] || 'var(--color-stroke-default)';
  }

  /**
   * Détermine la couleur du label selon la progression
   */
  getLabelColor(acCode, progression) {
    return progression > 0 ? this.getLevelColor(acCode) : 'var(--color-stroke-default)';
  }

  /**
   * Convertit une variable CSS en couleur hex
   */
  cssVarToHex(cssVar) {
    if (!cssVar.startsWith('var(')) return cssVar;
    
    const varName = cssVar.match(/var\((--[\w-]+)\)/)?.[1];
    if (!varName) return cssVar;
    
    const color = getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
    return color || '#6E7275';
  }


  /**
   * Crée ou met à jour le label d'un AC
   */
  createACLabel(acElement, acCode, rect, color) {
    let label = acElement.querySelector('.ac-label');
    
    if (!label) {
      label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      label.classList.add('ac-label');
      label.textContent = acCode;
      
      const rectX = parseFloat(rect.getAttribute('x'));
      const rectWidth = parseFloat(rect.getAttribute('width'));
      const rectY = parseFloat(rect.getAttribute('y'));
      const rectHeight = parseFloat(rect.getAttribute('height'));
      
      label.setAttribute('x', rectX + (rectWidth / 2));
      label.setAttribute('y', rectY + rectHeight + 8);
      label.setAttribute('text-anchor', 'middle');
      label.setAttribute('opacity', '0.95');
      label.style.fontSize = '7px';
      
      try { 
        label.style.transformBox = 'fill-box'; 
        label.style.transformOrigin = '50% 50%'; 
      } catch (e) {}
      
      acElement.appendChild(label);
    }
    
    label.setAttribute('fill', this.cssVarToHex(color));
  }

  /**
   * Met à jour le rectangle de progression
   */
  updateProgressRect(acElement, rect, progression, color) {
    let fillRect = acElement.querySelector('.progress-fill');
    
    if (!fillRect) {
      fillRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      fillRect.classList.add('progress-fill');
      fillRect.setAttribute('x', rect.getAttribute('x'));
      fillRect.setAttribute('y', rect.getAttribute('y'));
      fillRect.setAttribute('height', rect.getAttribute('height'));
      fillRect.setAttribute('rx', rect.getAttribute('rx'));
      fillRect.setAttribute('stroke-width', rect.getAttribute('stroke-width'));
      fillRect.setAttribute('opacity', '0.8');
      
      rect.parentNode.insertBefore(fillRect, rect.nextSibling);
    }
    
    const rectWidth = parseFloat(rect.getAttribute('width'));
    const fillWidth = (rectWidth * progression) / 100;
    
    fillRect.setAttribute('fill', color);
    fillRect.setAttribute('stroke', color);
    fillRect.setAttribute('width', String(fillWidth));
  }

  /**
   * Met à jour le cercle de niveau avec un arc de progression
   */
  updateLevelCircle(levelGroup, circle, progression, color) {
    const isEllipse = circle.tagName.toLowerCase() === 'ellipse';
    let progressCircle = levelGroup.querySelector('.level-progress-circle');
    
    if (!progressCircle) {
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
      
      circle.parentNode.insertBefore(progressCircle, circle.nextSibling);
    }
    
    if (progression <= 0) {
      progressCircle.setAttribute('stroke-dasharray', '0 9999');
      return;
    }
    
    progressCircle.setAttribute('stroke', color);
    
    try {
      Animation.animateLevelArc(levelGroup, progression, 1.0);
    } catch (e) {
      const rx = isEllipse ? parseFloat(circle.getAttribute('rx')) : parseFloat(circle.getAttribute('r'));
      const ry = isEllipse ? parseFloat(circle.getAttribute('ry')) : parseFloat(circle.getAttribute('r'));
      const circumference = Math.PI * (3 * (rx + ry) - Math.sqrt((3 * rx + ry) * (rx + 3 * ry)));
      const arcLength = (circumference * progression) / 100;
      const gapLength = circumference - arcLength;
      progressCircle.setAttribute('stroke-dasharray', `${arcLength} ${gapLength}`);
    }
  }
}

export { TreeSkillsView };