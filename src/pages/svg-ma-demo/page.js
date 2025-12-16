import { TreeSkillsView } from "@/ui/tree-skills";
import { PopupACView } from "@/ui/popup-ac";
import { PopupLevelView } from "@/ui/popup-level";
import { HistoriquePopupView } from "@/ui/historique-popup";
import { BtnHistoriqueView } from "@/ui/btn-historique";
import { BtnExportView } from "@/ui/btn-export";
import { chargerProgressions, sauvegarderProgression } from "@/lib/progression.js";
import { chargerHistorique, sauvegarderLog } from "@/lib/historique.js";
import { htmlToDOM } from "@/lib/utils.js";
import template from "./template.html?raw";
import { pn } from "@/data/pn.js";



// ========== MODEL ==========
let M = {
  data: null,
  progressions: {},
  historique: []
};

/**
 * Table de correspondance : niveau → couleur CSS
 * Utilisée pour coloriser les AC et les cercles de niveau
 */
M.LEVEL_COLORS = {
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

/**
 * Charge les données du référentiel depuis le JSON et initialise pn
 */
M.loadTreeData = async function() {
  const response = await fetch('/src/data/programme_mmi.json');
  M.data = await response.json();
  
  pn.init(M.data);
  
  M.loadProgressions();
  M.loadHistorique();
};

/**
 * Charge les progressions depuis localStorage
 */
M.loadProgressions = function() {
  M.progressions = chargerProgressions();
}

/**
 * Charge l'historique depuis localStorage
 */
M.loadHistorique = function() {
  M.historique = chargerHistorique();
}

/**
 * Sauvegarde la progression d'un AC
 */
M.setACProgression = function(acCode, progression) {
  M.progressions[acCode] = parseInt(progression);
  sauvegarderProgression(M.progressions);
  
  // Enregistrer dans l'historique (US008)
  sauvegarderLog(acCode, progression);
  M.loadHistorique();
}

/**
 * Récupère la progression d'un AC
 * @param {string} acCode - Code de l'AC
 * @returns {number} Progression (0-100), par défaut 0
 */
M.getACProgression = function(acCode) {
  return M.progressions[acCode] || 0;
}

/**
 * Récupère les données d'un AC par son code
 * @param {string} acCode - Code de l'AC (ex: "AC11.01")
 * Utilise directement pn pour gérer les données
 */
M.getACByCode = function(acCode) {
  const skillIndex = pn.getSkillIndex(acCode) - 1;
  const levelIndex = pn.getLevelsIndex(acCode) - 1;
  const acIndex = pn.getACIndex(acCode) - 1;
  
  const competence = pn[skillIndex];
  const niveau = competence.niveaux[levelIndex];
  const ac = niveau.acs[acIndex];
  
  return {
    code: ac.code,
    libelle: ac.libelle,
    annee: niveau.annee,
    competence: competence.nom_court
  };
}

/**
 * Récupère les données d'un niveau par son ID
 * @param {string} levelId - ID du niveau (ex: "level_1", "level_1_2")
 * Utilise pn[competence].niveaux[niveau] pour accéder aux données
 */
M.getLevelByCode = function(levelId) {
  let niveauCount = 0;
  const levelNumber = parseInt(levelId.split('_').pop());
  
  for (let i = 0; i < pn.length; i++) {
    const competence = pn[i];
    
    for (let j = 0; j < competence.niveaux.length; j++) {
      niveauCount++;
      
      if (niveauCount === levelNumber) {
        const niveau = competence.niveaux[j];
        return {
          ordre: niveau.ordre,
          libelle: niveau.libelle,
          annee: niveau.annee,
          competence: competence.nom_court,
          acs: niveau.acs
        };
      }
    }
  }
  return null;
}

// ========== CONTROLLER ==========
let C = {};

C.init = async function() {
  await M.loadTreeData();  // Charge le JSON et initialise pn
  return V.init();
}

/**
 * Gère l'ouverture de l'historique
 */
C.handler_openHistorique = function() {
  V.popupHistorique.open(M.historique);
}

/**
 * Gère le clic sur un AC
 */
C.handler_clickOnAC = function(acCode) {
  const acData = M.getACByCode(acCode);
  if (acData) {
    // Ajouter la progression actuelle aux données
    acData.progression = M.getACProgression(acCode);
    V.popupAC.open(acData);
  }
}

/**
 * Gère la validation de la progression d'un AC
 */
C.handler_validateAC = function(acCode, progression) {
  // Sauvegarder dans le Model
  M.setACProgression(acCode, progression);
  
  // Mettre à jour le visuel du SVG
  V.treeSkills.updateACVisual(acCode, progression);
  
  // Mettre à jour tous les niveaux
  V.treeSkills.updateAllLevels(M.progressions);
  
  // Fermer la popup
  V.popupAC.close();
}

/**
 * Gère le clic sur un niveau
 */
C.handler_clickOnLevel = function(levelId) {
  const levelData = M.getLevelByCode(levelId);
  if (levelData) {
    V.popupLevel.open(levelData);
  }
}

// ========== VIEW ==========
let V = {
  rootPage: null,
  treeSkills: null,
  popupAC: null,
  popupLevel: null,
  popupHistorique: null,
  btnHistorique: null,
  btnExport: null
};

/**
 * Initialise la vue
 */
V.init = function() {
  let fragment = V.createPageFragment();
  V.attachEvents(fragment);
  return fragment;
}

/**
 * Crée le fragment de la page avec tous les composants
 */
V.createPageFragment = function() {
  V.rootPage = htmlToDOM(template);
  
  // Créer le composant TreeSkills avec les couleurs du Model
  V.treeSkills = new TreeSkillsView(M.LEVEL_COLORS);
  
  // Injecter le SVG
  V.rootPage.querySelector('slot[name="svg"]').replaceWith(V.treeSkills.dom());
  
  // Créer les popups et les injecter dans les slots
  V.popupAC = new PopupACView();
  V.popupLevel = new PopupLevelView();
  V.popupHistorique = new HistoriquePopupView();
  V.btnHistorique = new BtnHistoriqueView();

  V.rootPage.querySelector('slot[name="popup-ac"]').replaceWith(V.popupAC.dom());
  V.rootPage.querySelector('slot[name="popup-level"]').replaceWith(V.popupLevel.dom());
  
  // Créer le bouton d'export et l'injecter dans le slot
  V.btnExport = BtnExportView.dom();
  V.rootPage.querySelector('slot[name="btn-export"]').replaceWith(V.btnExport);
  
  // Injecter le bouton historique dans le slot
  V.rootPage.querySelector('slot[name="btn-historique"]').replaceWith(V.btnHistorique.dom());
  
  // Ajouter l'historique au body (popup)
  document.body.appendChild(V.popupHistorique.dom());
  
  // Appliquer les progressions chargées depuis localStorage 
  V.applyStoredProgressions();
  
  // Afficher tous les labels AC
  V.treeSkills.showAllACLabels(M.progressions);
  
  return V.rootPage;
}

/**
 * Attache les événements aux composants
 */
V.attachEvents = function(fragment) {
  // Attacher les événements des popups
  V.popupAC.attachEvents();
  V.popupAC.initSlider();
  V.popupAC.setOnValidate(C.handler_validateAC);
  V.popupLevel.attachEvents();
  V.popupHistorique.attachEvents();
  V.btnHistorique.onClick(C.handler_openHistorique);
  
  // Activer les interactions sur les AC et niveaux
  V.treeSkills.enableACInteractions(C.handler_clickOnAC);
  V.treeSkills.enableLevelInteractions(C.handler_clickOnLevel);
  
  return fragment;
}

/**
 * Applique les progressions sauvegardées
 */
V.applyStoredProgressions = function() {
  let appliedCount = 0;
  
  for (const acCode in M.progressions) {
    const progression = M.progressions[acCode];
    if (progression > 0) {
      V.treeSkills.updateACVisual(acCode, progression);
      appliedCount++;
    }
  }
  
  // Mettre à jour tous les niveaux selon les progressions
  V.treeSkills.updateAllLevels(M.progressions);
}

export function SvgMaDemoPage() {
  return C.init();
}
