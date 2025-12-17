import { htmlToDOM } from "../../lib/utils.js";
import template from "./template.html?raw";
import "./style.css";
import { exporterSauvegarde } from "../../lib/historique.js";

let BtnExportView = {
  html: function() {
    return template;
  },

  dom: function() {
    const btnDOM = htmlToDOM(template);
    
    // Attacher l'événement click
    btnDOM.addEventListener("click", () => {
      exporterSauvegarde();
    });
    
    return btnDOM;
  }
};

export { BtnExportView };
