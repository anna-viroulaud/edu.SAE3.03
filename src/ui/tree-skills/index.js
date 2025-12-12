import { htmlToDOM } from "../../lib/utils.js";
import template from "./template.html?raw";

/**
 * Composant UI tree-skills
 * Responsabilité : Afficher le SVG de l'arbre de compétences
 * Selon l'architecture : Les composants UI sont réutilisables et ne gèrent PAS la logique métier
 */
let TreeSkillsView = {
  html: function() {
    return template;
  },

  dom: function() {
    return htmlToDOM(template);
  }
};

export { TreeSkillsView };