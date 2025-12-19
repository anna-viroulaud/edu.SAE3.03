import { htmlToDOM } from "../../lib/utils.js";
import template from "./template.html?raw";
import "./style.css";
import { Animation } from "../../lib/animation.js";

/**
 * RadarView - Composant UI pour la vue radar des compétences
 * Affiche un graphique radar avec les 5 compétences du BUT MMI
 */
class RadarView {
  constructor() {
    this.root = htmlToDOM(template);
    this.competenceData = null;
    
    // Mapping des compétences vers leurs IDs dans le SVG
    this.competenceMap = {
      'Comprendre': { textId: 'Comprendre', legendId: 'Comprendre :', color: '#EF4444', angle: -90 },
      'Concevoir': { textId: 'Concevoir', legendId: 'Concevoir :', color: '#F97316', angle: 18 },
      'Exprimer': { textId: 'Exprimer', legendId: 'Exprimer :', color: '#EAB308', angle: 126 },
      'Développer': { textId: 'Développer', legendId: 'Développer :', color: '#10B981', angle: 234 },
      'Entreprendre': { textId: 'Entreprendre', legendId: 'Entreprendre :', color: '#06B6D4', angle: 306 }
    };
    
    // Centre et rayon du radar (basé sur le SVG)
    this.center = { x: 448, y: 350 };
    this.maxRadius = 196; // Rayon du cercle extérieur (100%)
  }

  html() {
    return template;
  }

  dom() {
    return this.root;
  }

  /**
   * Initialise le radar avec les données
   */
  init(competenceData) {
    this.competenceData = competenceData;
    this.createDataLayer();
    this.updateData();
    this.updateLegend();
    this.animateEntry();
  }

  /**
   * Met à jour les données du radar
   */
  update(competenceData) {
    this.competenceData = competenceData;
    this.updateData();
    this.updateLegend();
  }

  /**
   * Crée la couche de données (polygone + points)
   */
  createDataLayer() {
    const iconGroup = this.root.querySelector('#Icon');
    if (!iconGroup) return;

    const ns = 'http://www.w3.org/2000/svg';
    
    // Créer le groupe de données
    const dataGroup = document.createElementNS(ns, 'g');
    dataGroup.id = 'radar-data';
    dataGroup.style.pointerEvents = 'none';
    
    // Créer le polygone (forme remplie)
    const polygon = document.createElementNS(ns, 'polygon');
    polygon.classList.add('radar-polygon');
    polygon.setAttribute('fill', 'rgba(255, 255, 255, 0.1)');
    polygon.setAttribute('stroke', '#FFFFFF');
    polygon.setAttribute('stroke-width', '2');
    polygon.setAttribute('stroke-linejoin', 'round');
    dataGroup.appendChild(polygon);
    
    // Créer les points cliquables pour chaque compétence
    Object.keys(this.competenceMap).forEach((comp, i) => {
      const circle = document.createElementNS(ns, 'circle');
      circle.classList.add('radar-point');
      circle.setAttribute('r', '6');
      circle.setAttribute('fill', this.competenceMap[comp].color);
      circle.setAttribute('stroke', '#FFFFFF');
      circle.setAttribute('stroke-width', '2');
      circle.setAttribute('opacity', '0');
      circle.dataset.competence = comp;
      dataGroup.appendChild(circle);

      // Créer un label de pourcentage associé au point
      const valueText = document.createElementNS(ns, 'text');
      valueText.classList.add('radar-value');
      valueText.setAttribute('fill', '#FFFFFF');
      valueText.setAttribute('font-size', '12');
      valueText.setAttribute('text-anchor', 'middle');
      valueText.setAttribute('opacity', '0');
      valueText.dataset.competence = comp;
      valueText.textContent = '0%';
      dataGroup.appendChild(valueText);
    });
    
    iconGroup.appendChild(dataGroup);
  }

  /**
   * Met à jour les données (position du polygone et des points)
   */
  updateData() {
    if (!this.competenceData) return;

    const polygon = this.root.querySelector('.radar-polygon');
    const points = this.root.querySelectorAll('.radar-point');

    if (!polygon) return;

    const coordinates = [];

    // IDs des vecteurs (axes) dans le SVG, ordonnés pour correspondre aux compétences
    const axisIds = ['Vector_5', 'Vector_6', 'Vector_7', 'Vector_8', 'Vector_9'];

    // Helper : récupérer le point d'extrémité d'un attribut 'd' de type M x y L x y ... ou M x y V y
    function parseEndpoint(d) {
      if (!d) return null;
      // Cas simple 'M x y V y' => retrouver x du M et y du V
      const parts = d.trim().split(/\s+/);
      // Trouver dernier segment qui contient une coordonnée en format 'x,y' ou 'L' suivi
      // On va chercher les derniers nombres dans la chaîne
      const nums = d.match(/-?\d*\.?\d+/g);
      if (!nums || nums.length < 2) return null;
      const lastY = parseFloat(nums[nums.length - 1]);
      const lastX = parseFloat(nums[nums.length - 2]);
      return { x: lastX, y: lastY };
    }

    // Construire une map d'angles à partir des axes SVG (plus précis que les labels)
    const axisAngles = {};
    axisIds.forEach((id, idx) => {
      const pathEl = this.root.querySelector(`#${id}`);
      if (pathEl && pathEl.hasAttribute('d')) {
        const end = parseEndpoint(pathEl.getAttribute('d'));
        if (end) {
          axisAngles[idx] = Math.atan2(end.y - this.center.y, end.x - this.center.x);
        }
      }
    });

    // Calculer les coordonnées pour chaque compétence
    Object.keys(this.competenceMap).forEach((comp, i) => {
      const value = this.competenceData[comp] || 0;
      const config = this.competenceMap[comp];

      // Utiliser l'angle calculé depuis l'axe SVG si disponible, sinon fallback sur config.angle
      let angleRad = axisAngles[i];
      if (angleRad === undefined) {
        angleRad = (config.angle * Math.PI) / 180;
      }

      // Calculer le rayon proportionnel (0-100% de maxRadius)
      const radius = (value / 100) * this.maxRadius;

      // Calculer la position x, y
      const x = this.center.x + Math.cos(angleRad) * radius;
      const y = this.center.y + Math.sin(angleRad) * radius;

      // Stocker radius et angleRad pour positionnement des labels
      coordinates.push({ x, y, value, comp, radius, angleRad });
    });

    // Créer la chaîne de points pour le polygone
    const pointsString = coordinates.map(c => `${c.x},${c.y}`).join(' ');
    polygon.setAttribute('points', pointsString);

    // Positionner les cercles et les labels de valeur
    coordinates.forEach((coord, i) => {
      if (points[i]) {
        points[i].setAttribute('cx', coord.x);
        points[i].setAttribute('cy', coord.y);
        points[i].dataset.value = coord.value;
        points[i].setAttribute('opacity', '1');
      }

      // Mettre à jour le label de pourcentage correspondant
      const textEl = this.root.querySelector(`.radar-value[data-competence="${coord.comp}"]`);
      if (textEl) {
        // Positionner légèrement au-delà du point pour être lisible
        const offset = 16; // px
        const tx = this.center.x + Math.cos(coord.angleRad) * (coord.radius + offset);
        const ty = this.center.y + Math.sin(coord.angleRad) * (coord.radius + offset);
        textEl.setAttribute('x', tx);
        textEl.setAttribute('y', ty);
        textEl.textContent = `${Math.round(coord.value)}%`;
        textEl.setAttribute('opacity', '1');
      }
    });
  }

  /**
   * Met à jour la légende avec les valeurs
   */
  updateLegend() {
    if (!this.competenceData) return;

    Object.entries(this.competenceData).forEach(([comp, value]) => {
      const config = this.competenceMap[comp];
      if (!config) return;
      
      // Trouver le texte de la légende
      const legendText = Array.from(this.root.querySelectorAll('#Container_3 text'))
        .find(t => t.textContent.includes(config.legendId));
      
      if (legendText) {
        const roundedValue = Math.round(value);
        legendText.textContent = `${config.legendId} ${roundedValue}%`;
      }
    });
  }

  /**
   * Animation d'entrée du radar
   */
  animateEntry() {
    return Animation.radarEntry(this.root, { center: this.center });
  }

  /**
   * Animation de mise à jour (quand les données changent)
   */
  animateUpdate() {
    return Animation.radarUpdate(this.root, { center: this.center });
  }
}

export { RadarView };
