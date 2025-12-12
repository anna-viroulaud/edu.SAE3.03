import { htmlToDOM } from "../../lib/utils.js";
import template from "./template.html?raw";

/**
 * Composant UI popup-ac
 * Responsabilité : Afficher uniquement le template HTML de la popup
 * Selon l'architecture : Les composants UI sont des éléments réutilisables sans logique métier
 * La logique métier (chargement données, événements, etc.) doit être dans la PAGE
 */
let PopupACView = {
  html: function() {
    return template;
  },

  dom: function() {
    return htmlToDOM(template);
  }
};

export { PopupACView };
