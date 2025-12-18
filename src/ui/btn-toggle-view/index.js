import { htmlToDOM } from "../../lib/utils.js";
import template from "./template.html?raw";
import "./style.css";

/**
 * BtnToggleView - Bouton pour basculer entre vue arbre et vue radar
 */
class BtnToggleView {
  constructor() {
    this.root = htmlToDOM(template);
    this.currentView = 'tree'; // 'tree' ou 'radar'
    this.onClick = null;
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
   * Définit le callback appelé lors du clic
   */
  setOnClick(callback) {
    this.onClick = callback;
    this.root.addEventListener('click', () => {
      this.toggle();
      if (this.onClick) {
        this.onClick(this.currentView);
      }
    });
  }

  /**
   * Bascule entre les vues
   */
  toggle() {
    this.currentView = this.currentView === 'tree' ? 'radar' : 'tree';
    this.updateUI();
  }

  /**
   * Met à jour l'interface du bouton
   */
  updateUI() {
    const btnText = this.root.querySelector('.btn-text');
    
    if (this.currentView === 'radar') {
      this.root.setAttribute('data-view', 'radar');
      if (btnText) btnText.textContent = 'Vue Arbre';
    } else {
      this.root.setAttribute('data-view', 'tree');
      if (btnText) btnText.textContent = 'Vue Radar';
    }
    
    // Animation de rotation
    this.root.classList.add('switching');
    setTimeout(() => {
      this.root.classList.remove('switching');
    }, 500);
  }

  /**
   * Retourne la vue courante
   */
  getCurrentView() {
    return this.currentView;
  }
}

export { BtnToggleView };
