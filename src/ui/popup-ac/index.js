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
    this.currentACCode = null;
    this.onValidate = null;
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
  open(acData) {
    this.currentACCode = acData.code;
    
    this.root.querySelector('#popupCode').textContent = acData.code;
    this.root.querySelector('#popupLibelle').textContent = acData.libelle;
    this.root.querySelector('#popupAnnee').textContent = acData.annee;
    this.root.querySelector('#popupCompetence').textContent = acData.competence;
    
    // Initialiser le slider avec la progression existante
    const slider = this.root.querySelector('#progressSlider');
    const valueDisplay = this.root.querySelector('#progressValue');
    if (slider && valueDisplay) {
      const progression = acData.progression || 0;
      slider.value = progression;
      valueDisplay.textContent = progression + '%';
      slider.style.background = `linear-gradient(to right, #6E7275 0%, #6E7275 ${progression}%, #1a1a1a ${progression}%, #1a1a1a 100%)`;
    }
    
    this.root.classList.add('active');
  }

  /**
   * Ferme la popup
   */
  close() {
    this.root.classList.remove('active');
  }

  /**
   * Attache les événements de fermeture et validation
   */
  attachEvents() {
    // Bouton valider
    const validateBtn = this.root.querySelector('#validateBtn');
    if (validateBtn) {
      validateBtn.addEventListener('click', () => {
        const slider = this.root.querySelector('#progressSlider');
        const progression = parseInt(slider.value);
        
        if (this.onValidate) {
          this.onValidate(this.currentACCode, progression);
        }
      });
    }
    
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
  
  /**
   * Définit le callback de validation
   */
  setOnValidate(callback) {
    this.onValidate = callback;
  }
}

export { PopupACView };
