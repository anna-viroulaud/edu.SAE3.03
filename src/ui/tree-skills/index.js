import { htmlToDOM } from "../../lib/utils.js";
import template from "./template.html?raw";
import { Animation } from "../../lib/animation.js";
import { gsap } from "gsap";

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
   * Lance l'animation d'entrée de l'arbre (dessin progressif)
   */
  animateEntry() {
    const svgRoot = this.root.querySelector('#skills_tree') || this.root;

    // background stars
    Animation.starrySky(svgRoot, { count: 80 });

    // draw the tree (returns a timeline)
    const tl = Animation.treeBuild(svgRoot, { duration: 1.0, stagger: 0.035 }) || null;

    // subtle breath for the five central bubbles
    const centers = ['Comprendre','Concevoir','Exprimer','Developper','Entreprendre']
      .map(id => this.root.querySelector(`#${id}`))
      .filter(Boolean);
    if (centers.length) Animation.subtleBreath(centers, { minOpacity: 0.97, maxOpacity: 1.0, duration: 10 });

    // occasional shooting stars (recursively scheduled)
    const fire = () => { Animation.shootStar(svgRoot); gsap.delayedCall(Math.random() * 12 + 8, fire); };
    gsap.delayedCall(4 + Math.random() * 3, fire);

    return tl;
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

      // Hover: add/remove a class to control opacity only (no scaling)
      acElement.addEventListener('mouseenter', () => {
        try { acElement.classList.add('ac-hover'); } catch (e) {}
      });
      acElement.addEventListener('mouseleave', () => {
        try { acElement.classList.remove('ac-hover'); } catch (e) {}
      });

      // Click: ripple along connection and call external handler
      acElement.addEventListener('click', () => {
        try { Animation.connectionRipple(acElement.id, { color: '#ffffffff' }); } catch (e) {}
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
      const labelColor = this.getLabelColor(acCode, progression);
      
      // Créer ou mettre à jour le label
      this.createACLabel(acElement, acCode, rect, labelColor);
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
    const levelColor = this.getLevelColor(acCode);
    this.updateProgressRect(acElement, rect, progression, levelColor);

    // 2. Mettre à jour le label
    const labelColor = this.getLabelColor(acCode, progression);
    this.createACLabel(acElement, acCode, rect, labelColor);
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
      const levelACs = this.findACsForLevel(levelElement);
      if (levelACs.length === 0) return;
      
      // Calculer la progression moyenne
      const averageProgression = this.calculateAverageProgression(levelACs, progressions);
      
      // Récupérer la couleur du premier AC
      const firstACCode = levelACs[0].id;
      const levelColor = this.getLevelColor(firstACCode);
      
      // Mettre à jour le cercle de progression
      const circle = levelElement.querySelector('circle, ellipse');
      if (circle) {
        this.updateLevelCircle(levelElement, circle, averageProgression, levelColor);
      }
    });
  }


  /**
   * Récupère la couleur CSS d'un niveau à partir du code AC
   * Ex: "AC11.01" → extrait "11" → retourne 'var(--color-comprendre-1)'
   */
  getLevelColor(acCode) {
    const levelCode = acCode.substring(2, 4); // "AC11.01" → "11"
    return this.LEVEL_COLORS[levelCode] || 'var(--color-stroke-default)';
  }

  /**
   * Détermine la couleur du label selon la progression
   * - 0% → gris
   * - >0% → couleur du niveau
   */
  getLabelColor(acCode, progression) {
    if (progression > 0) {
      return this.getLevelColor(acCode);
    }
    return 'var(--color-stroke-default)'; // Gris par défaut
  }

  /**
   * Convertit une variable CSS (ex: 'var(--color-comprendre-1)') en couleur hex
   * Nécessaire car SVG ne comprend pas les variables CSS dans setAttribute()
   */
  cssVarToHex(cssVar) {
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
  createACLabel(acElement, acCode, rect, color) {
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
      // Enable SVG transforms on the label for hover effects
      try { label.style.transformBox = 'fill-box'; label.style.transformOrigin = '50% 50%'; } catch (e) {}
      
      // Ajouter au groupe AC
      acElement.appendChild(label);
    }
    
    // Mettre à jour la couleur (conversion CSS var → hex)
    const hexColor = this.cssVarToHex(color);
    label.setAttribute('fill', hexColor);
    // Make label more visible by default
    label.setAttribute('opacity', '0.95');
    label.style.fontSize = '7px';
  }

  /**
   * Met à jour le rectangle de progression (remplissage coloré)
   * Crée un second rectangle par-dessus le premier avec une largeur proportionnelle
   */
  updateProgressRect(acElement, rect, progression, color) {
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
    
    // Appliquer (mise à jour immédiate — animation via CSS si désirée)
    fillRect.setAttribute('fill', color);
    fillRect.setAttribute('stroke', color);
    fillRect.setAttribute('width', String(fillWidth));
  }


  /**
   * Trouve tous les AC appartenant à un niveau (cercle)
   * Remonte dans le DOM jusqu'au groupe "niveau_X" parent
   */
  findACsForLevel(levelElement) {
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
  calculateAverageProgression(acElements, progressions) {
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
  updateLevelCircle(levelGroup, circle, progression, color) {
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
    
    // Appliquer couleur et animer l'arc via helper
    progressCircle.setAttribute('stroke', color);
    try {
      Animation.animateLevelArc(levelGroup, progression, 1.0);
    } catch (e) {
      // Fallback: appliquer directement
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