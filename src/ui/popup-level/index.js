import { htmlToDOM } from "@/lib/utils.js";
import template from "./template.html?raw";
import "./style.css";

/**
 * Composant UI PopupLevel
 * Affiche une popup avec la liste des AC d'un niveau
 */
class PopupLevelView {
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
   * Ouvre la popup avec les données d'un niveau
   * @param {Object} levelData - { ordre, libelle, annee, competence, acs: [] }
   */
  open(levelData) {
    // Remplir les informations du niveau
    this.root.querySelector('#levelTitle').textContent = `Niveau ${levelData.ordre} - ${levelData.annee}`;
    this.root.querySelector('#levelDescription').textContent = levelData.libelle;
    this.root.querySelector('#levelCompetence').textContent = levelData.competence;
    this.root.querySelector('#levelAnnee').textContent = levelData.annee;

    // Générer la liste des AC
    const acListContainer = this.root.querySelector('#acList');
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
    const closeBtn = this.root.querySelector('#closeLevelPopupBtn');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.close());
    }

    // Clic sur le fond
    this.root.addEventListener('click', (ev) => {
      if (ev.target === this.root) this.close();
    });
  }
}

export { PopupLevelView };
