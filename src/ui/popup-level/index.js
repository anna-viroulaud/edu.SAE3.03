import { htmlToDOM } from "@/lib/utils.js";
import template from "./template.html?raw";
import "./style.css";

/**
 * Composant UI PopupLevel
 * Affiche une popup avec la liste des AC d'un niveau
 */

let PopupLevelView = {
  html: function() {
    return template;
  },

  dom: function() {
    return htmlToDOM(template);
  }
};

export { PopupLevelView };
