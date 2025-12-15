import { htmlToDOM } from "../../lib/utils.js";
import template from "./template.html?raw";
import "./style.css";

/**
 * Composant UI popup-ac
 * Gère l'affichage des détails d'un AC (comme DetailPanel)
 */
class PopupACView {
  constructor() {
    this.popup = null;
  }

  /**
   * Monte la popup dans le DOM
   */
  mount() {
    if (!document.getElementById('acPopup')) {
      document.body.insertAdjacentHTML('beforeend', template);
      this.popup = document.getElementById('acPopup');
      this.attachEvents();
      this.initSlider();
    } else {
      this.popup = document.getElementById('acPopup');
    }
  }

  /**
   * Initialise le slider de progression
   */
  initSlider() {
    const slider = document.getElementById('progressSlider');
    const valueDisplay = document.getElementById('progressValue');
    
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
  open(acData) {
    if (!this.popup) this.mount();

    document.getElementById('popupCode').textContent = acData.code;
    document.getElementById('popupLibelle').textContent = acData.libelle;
    document.getElementById('popupAnnee').textContent = acData.annee;
    document.getElementById('popupCompetence').textContent = acData.competence;
    
    this.popup.classList.add('active');
  }

  /**
   * Ferme la popup
   */
  close() {
    if (this.popup) {
      this.popup.classList.remove('active');
    }
  }

  /**
   * Attache les événements de fermeture
   */
  attachEvents() {
    // Bouton fermer
    const closeBtn = document.getElementById('closePopupBtn');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.close());
    }

    // Clic sur le fond
    if (this.popup) {
      this.popup.addEventListener('click', (ev) => {
        if (ev.target === this.popup) this.close();
      });
    }
  }
}

export { PopupACView };
