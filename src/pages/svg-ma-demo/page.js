import { treeSkillsView } from "@/ui/tree-skills";
import { htmlToDOM } from "@/lib/utils.js";
import template from "./template.html?raw";

let C = {};


C.init = function() {
  return V.init();
}

let V = {
  rootPage: null,
  treeSkills: null
};

V.init = function() {
  V.rootPage = htmlToDOM(template);
  V.treeSkills = new treeSkillsView();
  V.rootPage.querySelector('slot[name="svg"]').replaceWith( V.treeSkills.dom() );
  return V.rootPage;
};


export function SvgMaDemoPage() {
  return C.init();
}