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
}

export { TreeSkillsView };