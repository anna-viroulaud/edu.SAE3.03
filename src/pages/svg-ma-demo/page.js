import { TreeSkillsView } from "@/ui/tree-skills";
import { PopupACView } from "@/ui/popup-ac";
import { PopupLevelView } from "@/ui/popup-level";
import { htmlToDOM } from "@/lib/utils.js";
import template from "./template.html?raw";



// ========== MODEL ==========
let M = {};

// Chargement des données au top level
let response = await fetch('/src/data/tree.json');
M.treeData = (await response.json())[0];

// ========== CONTROLLER ==========
let C = {};

C.init = function() {
  return V.init();
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
  
  // Créer le composant TreeSkills avec les données
  V.treeSkills = new TreeSkillsView();
  V.treeSkills.setData(M.treeData);
  
  // Injecter le SVG
  V.rootPage.querySelector('slot[name="svg"]').replaceWith(V.treeSkills.dom());
  
  // Créer les popups et les injecter dans <body>
  V.popupAC = new PopupACView();
  V.popupLevel = new PopupLevelView();

  V.rootPage.querySelector('slot[name="popup-ac"]').replaceWith(V.popupAC.dom());
  V.rootPage.querySelector('slot[name="popup-level"]').replaceWith(V.popupLevel.dom());

  // Attacher les événements des popups
  V.popupAC.attachEvents();
  V.popupAC.initSlider();
  V.popupLevel.attachEvents();
  
  setTimeout(() => {
    // Clics sur les AC
    V.treeSkills.enableACInteractions((acData) => {
      V.popupAC.open(acData);
    });
    
    // Clics sur les niveaux (level_*)
    V.treeSkills.enableLevelInteractions((levelData) => {
      V.popupLevel.open(levelData);
    });
  }, 0);
  
  return V.rootPage;
}


export function SvgMaDemoPage() {
  return C.init();
}
