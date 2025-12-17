import { TreeSkillsView } from "@/ui/tree-skills";
import { PopupACView } from "@/ui/popup-ac";
import { HistoriquePopupView } from "@/ui/historique-popup";
import { BtnHistoriqueView } from "@/ui/btn-historique";
import { BtnExportView } from "@/ui/btn-export";
import { chargerHistorique, sauvegarderLog, chargerProgressions, sauvegarderProgression } from "@/lib/historique.js";
import { htmlToDOM } from "@/lib/utils.js";
import template from "./template.html?raw";
import { pn } from "@/data/pn.js";


// ========== MODEL ==========
let M = {
  data: null,
  progressions: {},
  historique: [],
  
  // Table de correspondance : niveau → couleur CSS
  LEVEL_COLORS: {
    '11': 'var(--color-comprendre-1)', '21': 'var(--color-comprendre-2)', '31': 'var(--color-comprendre-3)',
    '12': 'var(--color-concevoir-1)', '22': 'var(--color-concevoir-2)', '32': 'var(--color-concevoir-3)',
    '13': 'var(--color-exprimer-1)', '23': 'var(--color-exprimer-2)', '33': 'var(--color-exprimer-3)',
    '14': 'var(--color-developper-1)', '24': 'var(--color-developper-2)', '34': 'var(--color-developper-3)',
    '15': 'var(--color-entreprendre-1)', '25': 'var(--color-entreprendre-2)', '35': 'var(--color-entreprendre-3)',
  }
};

/**
 * Charge les données du référentiel depuis le JSON et initialise pn
 */
M.loadTreeData = async function() {
  M.data = pn;
  M.progressions = chargerProgressions();
  M.historique = chargerHistorique();
};

M.getACProgression = function(acCode) {
  return M.progressions[acCode] || 0;
};

M.setACProgression = function(acCode, progression) {
  M.progressions[acCode] = parseInt(progression);
  sauvegarderProgression(M.progressions);
  sauvegarderLog(acCode, progression);
  M.historique = chargerHistorique();
};


/**
 * Récupère les données d'un AC par son code
 * @param {string} acCode - Code de l'AC (ex: "AC11.01")
 * @returns {Object} Objet AC avec code, libelle, annee, competence
 */

M.getACByCode = function(acCode) {
  return {
    code: acCode,
    libelle: pn.getACLibelle(acCode),    
    annee: pn.getACAnnee(acCode),        
    competence: pn.getCompetenceNom(acCode) 
  };
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
    V.popupAC.open(acData);
  }
}

/**
 * Gère la validation de la progression d'un AC
 */
C.handler_validateAC = function(acCode, progression) {
  M.setACProgression(acCode, progression);
  V.treeSkills.updateACVisual(acCode, progression);
  V.treeSkills.updateAllLevels(M.progressions);
  V.popupAC.close();
}


// ========== VIEW ==========
let V = {
  rootPage: null,
  treeSkills: null,
  popupAC: null,
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
  V.popupAC = new PopupACView();
  V.popupHistorique = new HistoriquePopupView();
  V.btnHistorique = new BtnHistoriqueView();
  V.btnExport = BtnExportView.dom();

  V.rootPage.querySelector('slot[name="svg"]').replaceWith(V.treeSkills.dom());
  V.rootPage.querySelector('slot[name="popup-ac"]').replaceWith(V.popupAC.dom());
  V.rootPage.querySelector('slot[name="btn-export"]').replaceWith(V.btnExport);
  
  // Injecter le bouton historique dans le slot
  V.rootPage.querySelector('slot[name="btn-historique"]').replaceWith(V.btnHistorique.dom());
  
  document.body.appendChild(V.popupHistorique.dom());
  
  // Appliquer les progressions chargées depuis localStorage 
  V.applyStoredProgressions();
  
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
  V.popupHistorique.attachEvents();
  V.btnHistorique.onClick(C.handler_openHistorique);
  V.treeSkills.enableACInteractions(C.handler_clickOnAC);
  
  return fragment;
}

/**
 * Applique les progressions sauvegardées
 */
V.applyStoredProgressions = function() {
    for (const acCode in M.progressions) {
      if (M.progressions[acCode] > 0) {
        V.treeSkills.updateACVisual(acCode, M.progressions[acCode]);
      }
    }
    V.treeSkills.updateAllLevels(M.progressions);
    V.treeSkills.showAllACLabels(M.progressions);  // ✅ Combiné ici
}

export function SvgMaDemoPage() {
  return C.init();
}
