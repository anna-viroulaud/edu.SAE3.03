import { htmlToDOM, genericRenderer } from "@/lib/utils.js";
import template from "./template.html?raw";
import itemTemplate from "./item-template.html?raw";
import "./style.css";

class HistoriquePopupView {
  constructor() {
    this.root = htmlToDOM(template);
  }

  html() {
    return template;
  }

  dom() {
    return this.root;
  }

  open(logs) {
    this.afficherLogs(logs);
    this.root.classList.add('active');
  }

  close() {
    this.root.classList.remove('active');
  }

  afficherLogs(logs) {
    const listContainer = this.root.querySelector('#historiqueList');
    
    if (!logs || logs.length === 0) {
      listContainer.innerHTML = '<div class="historique-empty">Aucune modification enregistree</div>';
      return;
    }

    let htmlString = '';
    
    for (let i = logs.length - 1; i >= 0; i--) {
      const log = logs[i];
      const date = new Date(log.date).toLocaleString('fr-FR');
      
      htmlString += genericRenderer(itemTemplate, {
        date: date,
        ac: log.ac,
        progression: log.progression
      });
    }
    
    listContainer.innerHTML = htmlString;
  }

  attachEvents() {
    const closeBtn = this.root.querySelector('#closeHistoriqueBtn');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.close());
    }

    this.root.addEventListener('click', (ev) => {
      if (ev.target === this.root) this.close();
    });
  }
}

export { HistoriquePopupView };
