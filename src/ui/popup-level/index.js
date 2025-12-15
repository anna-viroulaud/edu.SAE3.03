import { htmlToDOM } from "@/lib/utils.js";
import template from "./template.html?raw";
import "./style.css";

/**
 * Composant UI PopupLevel
 * Affiche une popup avec la liste des AC d'un niveau
 */
class PopupLevelView {
  constructor() {
    this.popup = null;
  }

  /**
   * Monte la popup dans le DOM
   */
  mount() {
    if (!document.getElementById('levelPopup')) {
      document.body.insertAdjacentHTML('beforeend', template);
      this.popup = document.getElementById('levelPopup');
      this.attachEvents();
    } else {
      this.popup = document.getElementById('levelPopup');
    }
  }

  /**
   * Ouvre la popup avec les données d'un niveau
   * @param {Object} levelData - { ordre, libelle, annee, competence, acs: [] }
   */
  open(levelData) {
    if (!this.popup) this.mount();

    // Remplir les informations du niveau
    document.getElementById('levelTitle').textContent = `Niveau ${levelData.ordre} - ${levelData.annee}`;
    document.getElementById('levelDescription').textContent = levelData.libelle;
    document.getElementById('levelCompetence').textContent = levelData.competence;
    document.getElementById('levelAnnee').textContent = levelData.annee;

    // Générer la liste des AC
    const acListContainer = document.getElementById('acList');
    acListContainer.innerHTML = '';
    
    levelData.acs.forEach(ac => {
      const acCard = document.createElement('div');
      acCard.className = 'ac-card';
      acCard.innerHTML = `
        <div class="ac-card-header">
          <span class="ac-code">${ac.code}</span>
        </div>
        <p class="ac-libelle">${ac.libelle}</p>
      `;
      acListContainer.appendChild(acCard);
    });

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
    const closeBtn = document.getElementById('closeLevelPopupBtn');
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

export { PopupLevelView };
