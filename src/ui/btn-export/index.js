import { htmlToDOM } from "../../lib/utils.js";
import template from "./template.html?raw";
import "./style.css";
import { user } from "@/data/user.js";

let BtnExportView = {
  html: function() {
    return template;
  },

  dom: function() {
    const btnDOM = htmlToDOM(template);
    
    // Attacher l'événement click
    btnDOM.addEventListener("click", () => {
      user.exportAll();
    });
    
    return btnDOM;
  }
};

export { BtnExportView };
