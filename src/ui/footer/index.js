import { htmlToDOM } from "../../lib/utils.js";
import template from "./template.html?raw";

let FooterView = {
  html: function () {
    return template;
  },

  dom: function () {
    return htmlToDOM(template);
  }
};

export { FooterView };
