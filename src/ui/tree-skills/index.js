import { htmlToDOM } from "../../lib/utils.js";
import template from "./template.html?raw";

class treeSkillsView {

  constructor() {
    this.root = htmlToDOM(template);
  }

  html() {
    return template;
  }

  dom() {
    return this.root;
  }

}
export { treeSkillsView };