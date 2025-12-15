import { TreeSkillsView } from "@/ui/tree-skills";
import { PopupACView } from "@/ui/popup-ac";
import { PopupLevelView } from "@/ui/popup-level";
import { htmlToDOM } from "@/lib/utils.js";
import template from "./template.html?raw";

/**
 * Page svg-ma-demo - VERSION SIMPLIFIÉE
 * Suit le pattern des fichiers demo (svg-demo1, svg-demo2, svg-demo3)
 * Pattern MVC simple et fonctionnel
 */

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
  
  // Créer les popups
  V.popupAC = new PopupACView();
  V.popupLevel = new PopupLevelView();
  
  // Activer les interactions (comme dans l'exemple GraphView)
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
  
  // Monter les popups dans le DOM
  setTimeout(() => {
    V.popupAC.mount();
    V.popupLevel.mount();
  }, 0);
  
  return V.rootPage;
}

// ========== EXPORT ==========
export function SvgMaDemoPage() {
  return C.init();
}
