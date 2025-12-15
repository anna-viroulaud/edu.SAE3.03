import { TreeSkillsView } from "@/ui/tree-skills";
import { PopupACView } from "@/ui/popup-ac";
import { PopupLevelView } from "@/ui/popup-level";
import { chargerProgressions, sauvegarderProgression } from "@/lib/progression.js";
import { htmlToDOM } from "@/lib/utils.js";
import template from "./template.html?raw";



// ========== MODEL ==========
let M = {};

// Chargement des données au top level
let response = await fetch('/src/data/tree.json');
M.treeData = await response.json();

// Stockage des progressions
M.progressions = {};

/**
 * Charge les progressions depuis localStorage
 */
M.loadProgressions = function() {
  M.progressions = chargerProgressions();
}

/**
 * Sauvegarde la progression d'un AC
 */
M.setACProgression = function(acCode, progression) {
  M.progressions[acCode] = parseInt(progression);
  sauvegarderProgression(M.progressions);
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
  
  return V.init();
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
  popupLevel: null
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

  V.rootPage.querySelector('slot[name="popup-ac"]').replaceWith(V.popupAC.dom());
  V.rootPage.querySelector('slot[name="popup-level"]').replaceWith(V.popupLevel.dom());

  // Attacher les événements des popups
  V.popupAC.attachEvents();
  V.popupAC.initSlider();
  V.popupAC.setOnValidate(C.handleACValidation); // ← Connecter le callback de validation
  V.popupLevel.attachEvents();
  
  setTimeout(() => {
    // Les callbacks appellent le Controller qui va chercher les données dans le Model
    V.treeSkills.enableACInteractions(C.handleACClick);
    V.treeSkills.enableLevelInteractions(C.handleLevelClick);
    
    // Appliquer les progressions chargées depuis localStorage 
    V.applyStoredProgressions();
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
  
  if (appliedCount > 0) {
    console.log(`[Progression] ${appliedCount} progression(s) appliquee(s) aux visuels`);
  }
}


export function SvgMaDemoPage() {
  return C.init();
}
