import { htmlToDOM } from "../../lib/utils.js";
import template from "./template.html?raw";
import "./style.css";

/**
 * Composant UI popup-ac
 * Gère l'affichage des détails d'un AC
 */
class PopupACView {
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
   * Initialise le slider de progression
   */
  initSlider() {
    const slider = this.root.querySelector('#progressSlider');
    const valueDisplay = this.root.querySelector('#progressValue');
    
    if (slider && valueDisplay) {
      // Fonction pour mettre à jour le gradient et le texte
      const updateSlider = (value) => {
        valueDisplay.textContent = value + '%';
        slider.style.background = `linear-gradient(to right, #6E7275 0%, #6E7275 ${value}%, #1a1a1a ${value}%, #1a1a1a 100%)`;
      };
      
      // Initialiser avec la valeur actuelle
      updateSlider(slider.value);
      
      // Mettre à jour en temps réel
      slider.addEventListener('input', (e) => {
        updateSlider(e.target.value);
      });
    }
  }

  /**
   * Ouvre la popup avec les données d'un AC
   */

  // modifier les classe par les data qui sont maintenant dans le template
  
  open(acData) {
    this.root.querySelector('#popupCode').textContent = acData.code;
    this.root.querySelector('#popupLibelle').textContent = acData.libelle;
    this.root.querySelector('#popupAnnee').textContent = acData.annee;
    this.root.querySelector('#popupCompetence').textContent = acData.competence;
    
    this.root.classList.add('active');
  }

  /**
   * Ferme la popup
   */
  close() {
    this.root.classList.remove('active');
  }

  /**
   * Attache les événements de fermeture
   */
  attachEvents() {
    // Bouton fermer
    const closeBtn = this.root.querySelector('#closePopupBtn');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.close());
    }

    // Clic sur le fond
    this.root.addEventListener('click', (ev) => {
      if (ev.target === this.root) this.close();
    });
  }
}

export { PopupACView };
