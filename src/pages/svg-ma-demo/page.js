import { TreeSkillsView } from "@/ui/tree-skills";
import { PopupACView } from "@/ui/popup-ac";
import { PopupLevelView } from "@/ui/popup-level";
import { HistoriquePopupView } from "@/ui/historique-popup";
import { BtnHistoriqueView } from "@/ui/btn-historique";
import { chargerProgressions, sauvegarderProgression } from "@/lib/progression.js";
import { chargerHistorique, sauvegarderLog } from "@/lib/historique.js";
import { htmlToDOM } from "@/lib/utils.js";
import template from "./template.html?raw";



// ========== MODEL ==========
let M = {};

// Chargement des données au top level
let response = await fetch('/src/data/tree.json');
M.treeData = await response.json();

// Stockage des progressions
M.progressions = {};
M.historique = [];

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
 */
M.getACByCode = function(acCode) {
  for (const competenceId in M.treeData) {
    const competence = M.treeData[competenceId];
    
    for (const niveau of competence.niveaux) {
      const ac = niveau.acs.find(a => a.code === acCode);
      if (ac) {
        return {
          code: ac.code,
          libelle: ac.libelle,
          annee: niveau.annee,
          competence: competence.nom_court
        };
      }
    }
  }
  return null;
}

/**
 * Récupère les données d'un niveau par son ID
 * @param {string} levelId - ID du niveau (ex: "level_1", "level_1_2")
 */
M.getLevelByCode = function(levelId) {
  let niveauCount = 0;
  const levelNumber = parseInt(levelId.split('_').pop());
  
  for (const competenceId in M.treeData) {
    const competence = M.treeData[competenceId];
    
    for (const niveau of competence.niveaux) {
      niveauCount++;
      
      if (niveauCount === levelNumber) {
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

C.init = function() {

  M.loadProgressions();
  M.loadHistorique();
  
  return V.init();
}

/**
 * Gère l'ouverture de l'historique
 */
C.handleOpenHistorique = function() {
  V.popupHistorique.open(M.historique);
}

/**
 * Gère le clic sur un AC
 */
C.handleACClick = function(acCode) {
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
C.handleACValidation = function(acCode, progression) {
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
C.handleLevelClick = function(levelId) {
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
  btnHistorique: null
};

/**
 * Initialise la vue
 */
V.init = function() {
  V.rootPage = htmlToDOM(template);
  
  // Créer le composant TreeSkills (juste le SVG, pas de données injectées)
  V.treeSkills = new TreeSkillsView();
  
  // Injecter le SVG
  V.rootPage.querySelector('slot[name="svg"]').replaceWith(V.treeSkills.dom());
  
  // Créer les popups et les injecter dans les slots
  V.popupAC = new PopupACView();
  V.popupLevel = new PopupLevelView();
  V.popupHistorique = new HistoriquePopupView();
  V.btnHistorique = new BtnHistoriqueView();

  V.rootPage.querySelector('slot[name="popup-ac"]').replaceWith(V.popupAC.dom());
  V.rootPage.querySelector('slot[name="popup-level"]').replaceWith(V.popupLevel.dom());
  
  // Ajouter l'historique et le bouton au body (pas dans les slots)
  document.body.appendChild(V.popupHistorique.dom());
  document.body.appendChild(V.btnHistorique.dom());

  // Attacher les événements des popups
  V.popupAC.attachEvents();
  V.popupAC.initSlider();
  V.popupAC.setOnValidate(C.handleACValidation);
  V.popupLevel.attachEvents();
  V.popupHistorique.attachEvents();
  V.btnHistorique.onClick(C.handleOpenHistorique);
  
  setTimeout(() => {
    // Les callbacks appellent le Controller qui va chercher les données dans le Model
    V.treeSkills.enableACInteractions(C.handleACClick);
    V.treeSkills.enableLevelInteractions(C.handleLevelClick);
    
    // Appliquer les progressions chargées depuis localStorage 
    V.applyStoredProgressions();
    
    // Lancer l'animation d'entrée
    V.treeSkills.playEntryAnimation();
  }, 0);
  
  return V.rootPage;
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
