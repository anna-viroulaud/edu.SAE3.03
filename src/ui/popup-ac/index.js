import { htmlToDOM } from "../../lib/utils.js";
import template from "./template.html?raw";
import "./style.css";
import { Animation } from "../../lib/animation.js";

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
   * Initialise le slider de progression avec animations
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
      
      // Mettre à jour en temps réel avec animation pulse
      slider.addEventListener('input', (e) => {
        updateSlider(e.target.value);
        // Petite animation pulse au déplacement
        Animation.sliderPulse(slider);
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
      // Coerce la progression en nombre et fallback à 0 si invalide
      let progression = Number(acData.progression);
      if (!Number.isFinite(progression)) progression = 0;
      slider.value = String(progression);
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
  // 1. Bouton valider
  const validateBtn = this.root.querySelector('#validateBtn');
  if (validateBtn) {
    validateBtn.addEventListener('click', () => {
      const slider = this.root.querySelector('#progressSlider');
      const progression = parseInt(slider.value);

      try {
        const svgId = this.currentACCode && this.currentACCode.replace('.', '-');
        const acEl = document.getElementById(this.currentACCode) || document.getElementById(svgId);
        if (acEl) {
          Animation.popGlow(acEl, { color: '#5c1dd1ff', duration: 1 });
        }
      } catch (err) {
        // ignore
      }

      if (this.onValidate) {
        this.onValidate(this.currentACCode, progression);
      }
    }); // Ferme addEventListener
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
