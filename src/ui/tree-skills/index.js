import { htmlToDOM } from "../../lib/utils.js";
import template from "./template.html?raw";
import popupTemplate from "../popup-ac/template.html?raw";
import "../popup-ac/style.css";

class treeSkillsView {

  constructor() {
    this.root = htmlToDOM(template);
    this.treeData = null;
    this.initPopup();
    this.loadData();
    this.attachEventListeners();
  }

  // Initialiser la popup dans le DOM
  initPopup() {
    // Ajouter la popup au body si elle n'existe pas déjà
    if (!document.getElementById('acPopup')) {
      document.body.insertAdjacentHTML('beforeend', popupTemplate);
      this.attachPopupEvents();
    }
  }

  // Charger les données du fichier JSON
  async loadData() {
    try {
      const response = await fetch('/src/data/tree.json');
      const data = await response.json();
      this.treeData = data[0];
      console.log('Données chargées avec succès', this.treeData);
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
    }
  }

  // Attacher les événements de clic aux éléments AC du SVG
  attachEventListeners() {
    // Attendre que le DOM soit chargé
    setTimeout(() => {
      const acElements = this.root.querySelectorAll('g[id^="AC"]');
      
      acElements.forEach(element => {
        element.style.cursor = 'pointer';
        element.addEventListener('click', (e) => {
          const acCode = element.id.replace('-', '.');
          this.openACPopup(acCode);
        });

        // Ajouter un effet hover
        element.addEventListener('mouseenter', () => {
          element.style.opacity = '0.7';
        });
        element.addEventListener('mouseleave', () => {
          element.style.opacity = '1';
        });
      });

      console.log(`${acElements.length} éléments AC rendus cliquables`);
    }, 100);
  }

  // Ouvrir la popup avec les données d'un AC
  openACPopup(acCode) {
    if (!this.treeData) {
      console.error('Les données ne sont pas encore chargées');
      return;
    }

    let acData = null;
    let competenceName = '';
    let competenceLong = '';
    let niveauLibelle = '';
    let annee = '';
    let couleur = '';

    // Parcourir les compétences pour trouver l'AC
    for (const competenceId in this.treeData) {
      const competence = this.treeData[competenceId];

      for (const niveau of competence.niveaux) {
        const foundAc = niveau.acs.find(ac => ac.code === acCode);
        if (foundAc) {
          acData = foundAc;
          competenceName = competence.nom_court;
          competenceLong = competence.libelle_long;
          niveauLibelle = niveau.libelle;
          annee = niveau.annee;
          couleur = competence.couleur;
          break;
        }
      }
      if (acData) break;
    }

    if (!acData) {
      console.error('AC non trouvé:', acCode);
      return;
    }

    // Remplir la popup avec les données
    document.getElementById('popupCode').textContent = acData.code;
    document.getElementById('popupLibelle').textContent = acData.libelle;
    document.getElementById('popupAnnee').textContent = annee;
    document.getElementById('popupCompetence').textContent = competenceName;

    // Afficher la popup
    const popup = document.getElementById('acPopup');
    popup.classList.add('active');
  }

  // Obtenir le gradient en fonction de la couleur de la compétence
  getCompetenceGradient(couleur) {
    const gradients = {
      'c1': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      'c2': 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      'c3': 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      'c4': 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
      'c5': 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)'
    };
    return gradients[couleur] || gradients['c1'];
  }

  // Attacher les événements pour fermer la popup
  attachPopupEvents() {
    const closeBtn = document.getElementById('closePopupBtn');
    const validateBtn = document.getElementById('validateBtn');
    const popup = document.getElementById('acPopup');
    const progressSlider = document.getElementById('progressSlider');
    const progressValue = document.getElementById('progressValue');

    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        popup.classList.remove('active');
      });
    }

    if (validateBtn) {
      validateBtn.addEventListener('click', () => {
        const progress = progressSlider.value;
        console.log('Progression validée:', progress + '%');
        // TODO: Sauvegarder la progression
        popup.classList.remove('active');
      });
    }

    if (progressSlider && progressValue) {
      progressSlider.addEventListener('input', (e) => {
        const value = e.target.value;
        progressValue.textContent = value + '%';
        
        // Mettre à jour le gradient du slider
        const percent = value;
        e.target.style.background = `linear-gradient(to right, #00CED1 0%, #00CED1 ${percent}%, #333333 ${percent}%, #333333 100%)`;
      });
    }

    if (popup) {
      // Fermer si on clique en dehors
      popup.addEventListener('click', (e) => {
        if (e.target === popup) {
          popup.classList.remove('active');
        }
      });

      // Fermer avec la touche Échap
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          popup.classList.remove('active');
        }
      });
    }
  }

  html() {
    return template;
  }

  dom() {
    return this.root;
  }

}
export { treeSkillsView };