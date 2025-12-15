import { htmlToDOM } from "@/lib/utils.js";
import template from "./template.html?raw";
import "./style.css";

class BtnHistoriqueView {
  constructor() {
    this.root = htmlToDOM(template);
  }

  html() {
    return template;
  }

  dom() {
    return this.root;
  }

  onClick(callback) {
    this.root.addEventListener('click', callback);
  }
}

export { BtnHistoriqueView };
