import { htmlToDOM } from "../../lib/utils.js";
import template from "./template.html?raw";
import "./style.css";
import { Animation } from "../../lib/animation.js";

/**
 * RadarView - Composant UI pour la vue radar des compétences
 * 
 * Responsabilités :
 * - Afficher un graphique radar avec les 5 compétences
 * - Calculer et visualiser les moyennes de progression
 * - Gérer les interactions hover sur les axes
 * 
 * Pattern : Composant UI avec méthodes publiques
 */

class RadarView {
  constructor() {
    this.root = htmlToDOM(template);
    this.competenceData = null;
    
    // Couleurs par compétence
    this.COMPETENCE_COLORS = {
      'Comprendre': 'url(#gradient-c1)',
      'Concevoir': 'url(#gradient-c2)',
      'Exprimer': 'url(#gradient-c3)',
      'Développer': 'url(#gradient-c4)',
      'Entreprendre': 'url(#gradient-c5)'
    };
  }

  /**
   * Retourne le template HTML
   */
  html() {
    return template;
  }

  /**
   * Retourne le DOM du composant
   */
  dom() {
    return this.root;
  }

  /**
   * Initialise le radar avec les données de compétences
   * @param {Object} competenceData - Objet avec les moyennes par compétence
   * Exemple: { "Comprendre": 45, "Concevoir": 60, "Exprimer": 30, "Développer": 75, "Entreprendre": 20 }
   */
  init(competenceData) {
    this.competenceData = competenceData;
    this.createGradients();
    this.drawGrid();
    this.drawLabels();
    this.drawData();
    this.updateLegend();
    this.animateEntry();
  }

  /**
   * Met à jour les données du radar
   */
  update(competenceData) {
    this.competenceData = competenceData;
    this.drawData();
    this.updateLegend();
  }

  /**
   * Crée les gradients SVG pour les couleurs
   */
  createGradients() {
    const svg = this.root.querySelector('#radarChart');
    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    
    const gradients = [
      { id: 'gradient-c1', colors: ['#667eea', '#764ba2'] },
      { id: 'gradient-c2', colors: ['#f093fb', '#f5576c'] },
      { id: 'gradient-c3', colors: ['#4facfe', '#00f2fe'] },
      { id: 'gradient-c4', colors: ['#43e97b', '#38f9d7'] },
      { id: 'gradient-c5', colors: ['#fa709a', '#fee140'] }
    ];
    
    gradients.forEach(g => {
      const gradient = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
      gradient.setAttribute('id', g.id);
      gradient.setAttribute('x1', '0%');
      gradient.setAttribute('y1', '0%');
      gradient.setAttribute('x2', '100%');
      gradient.setAttribute('y2', '100%');
      
      const stop1 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
      stop1.setAttribute('offset', '0%');
      stop1.setAttribute('style', `stop-color:${g.colors[0]};stop-opacity:1`);
      
      const stop2 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
      stop2.setAttribute('offset', '100%');
      stop2.setAttribute('style', `stop-color:${g.colors[1]};stop-opacity:1`);
      
      gradient.appendChild(stop1);
      gradient.appendChild(stop2);
      defs.appendChild(gradient);
    });
    
    svg.insertBefore(defs, svg.firstChild);
  }

  /**
   * Dessine la grille du radar (cercles concentriques et axes)
   */
  drawGrid() {
    const svg = this.root.querySelector('#radarChart');
    const gridGroup = svg.querySelector('.radar-grid');
    gridGroup.innerHTML = '';
    
    const centerX = 300;
    const centerY = 300;
    const maxRadius = 200;
    const levels = 5; // 5 niveaux (0%, 25%, 50%, 75%, 100%)
    const axes = 5; // 5 compétences
    
    // Dessiner les cercles concentriques
    for (let i = 1; i <= levels; i++) {
      const radius = (maxRadius / levels) * i;
      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('cx', centerX);
      circle.setAttribute('cy', centerY);
      circle.setAttribute('r', radius);
      gridGroup.appendChild(circle);
      
      // Ajouter les labels de pourcentage
      if (i < levels) {
        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', centerX);
        text.setAttribute('y', centerY - radius - 5);
        text.textContent = `${(i * 25)}%`;
        gridGroup.appendChild(text);
      }
    }
    
    // Dessiner les axes
    for (let i = 0; i < axes; i++) {
      const angle = (Math.PI * 2 / axes) * i - Math.PI / 2;
      const x = centerX + Math.cos(angle) * maxRadius;
      const y = centerY + Math.sin(angle) * maxRadius;
      
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', centerX);
      line.setAttribute('y1', centerY);
      line.setAttribute('x2', x);
      line.setAttribute('y2', y);
      gridGroup.appendChild(line);
    }
  }

  /**
   * Dessine les labels des compétences
   */
  drawLabels() {
    const svg = this.root.querySelector('#radarChart');
    const labelsGroup = svg.querySelector('.radar-labels');
    labelsGroup.innerHTML = '';
    
    const centerX = 300;
    const centerY = 300;
    const radius = 240;
    const competences = Object.keys(this.competenceData || {});
    
    competences.forEach((comp, i) => {
      const angle = (Math.PI * 2 / competences.length) * i - Math.PI / 2;
      const x = centerX + Math.cos(angle) * radius;
      const y = centerY + Math.sin(angle) * radius;
      
      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('x', x);
      text.setAttribute('y', y);
      text.setAttribute('dy', '0.3em');
      text.textContent = comp;
      labelsGroup.appendChild(text);
    });
  }

  /**
   * Dessine le polygone de données
   */
  drawData() {
    const svg = this.root.querySelector('#radarChart');
    const dataGroup = svg.querySelector('.radar-data');
    dataGroup.innerHTML = '';
    
    if (!this.competenceData) return;
    
    const centerX = 300;
    const centerY = 300;
    const maxRadius = 200;
    const competences = Object.keys(this.competenceData);
    const points = [];
    
    // Calculer les points du polygone
    competences.forEach((comp, i) => {
      const value = this.competenceData[comp] || 0;
      const radius = (value / 100) * maxRadius;
      const angle = (Math.PI * 2 / competences.length) * i - Math.PI / 2;
      const x = centerX + Math.cos(angle) * radius;
      const y = centerY + Math.sin(angle) * radius;
      points.push(`${x},${y}`);
    });
    
    // Créer le polygone
    const polygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
    polygon.setAttribute('points', points.join(' '));
    dataGroup.appendChild(polygon);
    
    // Ajouter des points cliquables
    points.forEach((point, i) => {
      const [x, y] = point.split(',').map(Number);
      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('cx', x);
      circle.setAttribute('cy', y);
      circle.setAttribute('r', '6');
      circle.setAttribute('data-competence', competences[i]);
      circle.setAttribute('data-value', this.competenceData[competences[i]]);
      dataGroup.appendChild(circle);
    });
  }

  /**
   * Met à jour la légende avec les valeurs
   */
  updateLegend() {
    if (!this.competenceData) return;
    
    const competenceMap = {
      'Comprendre': 'c1',
      'Concevoir': 'c2',
      'Exprimer': 'c3',
      'Développer': 'c4',
      'Entreprendre': 'c5'
    };
    
    Object.entries(this.competenceData).forEach(([comp, value]) => {
      const id = competenceMap[comp];
      const element = this.root.querySelector(`#legend-${id}`);
      if (element) {
        element.textContent = `${comp} : ${Math.round(value)}%`;
      }
    });
  }

  /**
   * Animation d'entrée du radar (utilise Animation.radarEntry)
   */
  animateEntry() {
    return Animation.radarEntry(this.root);
  }
}

export { RadarView };
