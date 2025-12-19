import { TreeSkillsView } from "@/ui/tree-skills";
import { PopupACView } from "@/ui/popup-ac";
import { HistoriquePopupView } from "@/ui/historique-popup";
import { BtnHistoriqueView } from "@/ui/btn-historique";
import { BtnExportView } from "@/ui/btn-export";
import { RadarView } from "@/ui/radar-view";
import { BtnToggleView } from "@/ui/btn-toggle-view";
import { user } from "@/data/user.js";
import { htmlToDOM } from "@/lib/utils.js";
import { Animation } from "@/lib/animation.js";
import { gsap } from "gsap";
import template from "./template.html?raw";
import { pn } from "@/data/pn.js";


// ========== MODEL ==========
let M = {
  data: null,
  progressions: {},
  proofs: {},
  
  // Table de correspondance : niveau → couleur CSS
  LEVEL_COLORS: {
    '11': 'var(--color-comprendre-1)', '21': 'var(--color-comprendre-2)', '31': 'var(--color-comprendre-3)',
    '12': 'var(--color-concevoir-1)', '22': 'var(--color-concevoir-2)', '32': 'var(--color-concevoir-3)',
    '13': 'var(--color-exprimer-1)', '23': 'var(--color-exprimer-2)', '33': 'var(--color-exprimer-3)',
    '14': 'var(--color-developper-1)', '24': 'var(--color-developper-2)', '34': 'var(--color-developper-3)',
    '15': 'var(--color-entreprendre-1)', '25': 'var(--color-entreprendre-2)', '35': 'var(--color-entreprendre-3)',
  }
};

/**
 * Charge les données du référentiel depuis le JSON et initialise pn
 */
M.loadTreeData = async function() {
  M.data = pn;
  M.progressions = user.loadProgressMap();
  M.proofs = user.loadProofMap();
};

M.getACProgression = function(acCode) {
  return M.progressions[acCode] || 0;
};

M.setACProgression = function(acCode, progression) {
  user.save(acCode, progression);    
  M.progressions[acCode] = progression;
};


/**
 * Récupère les données d'un AC par son code
 * @param {string} acCode - Code de l'AC (ex: "AC11.01")
 * @returns {Object} Objet AC avec code, libelle, annee, competence
 */

M.getACByCode = function(acCode) {
  return {
    code: acCode,
    libelle: pn.getACLibelle(acCode),
    annee: pn.getACAnnee(acCode),
    competence: pn.getCompetenceNom(acCode),
    progression: M.progressions[acCode] || 0,
    proof: M.proofs[acCode] || ''
  };
}

/**
 * Calcule la moyenne de progression par compétence
 * @returns {Object} Objet avec les moyennes par compétence
 * Exemple: { "Comprendre": 45, "Concevoir": 60, "Exprimer": 30, "Développer": 75, "Entreprendre": 20 }
 */
M.getCompetenceAverages = function() {
  const competences = {
    'Comprendre': { sum: 0, count: 0 },
    'Concevoir': { sum: 0, count: 0 },
    'Exprimer': { sum: 0, count: 0 },
    'Développer': { sum: 0, count: 0 },
    'Entreprendre': { sum: 0, count: 0 }
  };
  
  // Parcourir toutes les compétences (1-5)
  for (let skillIndex = 1; skillIndex <= 5; skillIndex++) {
    const acs = pn.getAllACsForSkill(skillIndex);
    const competenceName = pn[skillIndex - 1].nom_court;
    
    acs.forEach(acCode => {
      const progression = M.progressions[acCode] || 0;
      competences[competenceName].sum += progression;
      competences[competenceName].count++;
    });
  }
  
  // Calculer les moyennes
  const averages = {};
  Object.keys(competences).forEach(comp => {
    const { sum, count } = competences[comp];
    averages[comp] = count > 0 ? sum / count : 0;
  });
  
  return averages;
}

/**
 * Calcule la progression moyenne d'un niveau spécifique
 * @param {string} levelIndex - Index du niveau ('1', '2', '3')
 * @param {string} skillIndex - Index de la compétence ('1', '2', '3', '4', '5')
 * @returns {number} Progression moyenne (0-100)
 */
M.calculateLevelProgression = function(levelIndex, skillIndex) {
  const levelACs = pn.getAllACsForSkill(skillIndex).filter(ac => ac.charAt(2) === levelIndex);
  if (levelACs.length === 0) return 0;
  
  let total = 0;
  levelACs.forEach(ac => {
    total += M.progressions[ac] || 0;
  });
  
  return total / levelACs.length;
}

/**
 * Calcule toutes les progressions de niveaux
 * @returns {Object} Objet {levelId: progression} ex: {"11": 45, "12": 60, ...}
 */
M.getAllLevelProgressions = function() {
  const progressions = {};
  
  for (let skill = 1; skill <= 5; skill++) {
    for (let level = 1; level <= 3; level++) {
      const key = `${level}${skill}`;
      progressions[key] = M.calculateLevelProgression(String(level), String(skill));
    }
  }
  
  return progressions;
}




// ========== CONTROLLER ==========
let C = {};

C.init = async function() {
  await M.loadTreeData();  // Charge le JSON et initialise pn
  return V.init();
}

/**
 * Gère l'ouverture de l'historique
 */
C.handler_openHistorique = function() {
  // use the live user storage so the popup always shows the latest history
  const hist = user.getHistory();
  V.popupHistorique.open(hist);
}

/**
 * Gère le clic sur un AC
 */
C.handler_clickOnAC = function(acCode) {
  const acData = M.getACByCode(acCode);
  if (acData) {
    V.popupAC.open(acData);
  }
}

/**
 * Gère la validation de la progression d'un AC
 */
C.handler_validateAC = function(acCode, progression, proof) {
  M.setACProgression(acCode, progression);
  
  // Sauvegarder la preuve si fournie
  if (proof !== undefined) {
    user.saveProof(acCode, proof);
    M.proofs[acCode] = proof;
    V.treeSkills.setProofIndicator(acCode, proof);
  }
  
  // Mettre à jour les visuels via le Controller
  C.updateVisuals(acCode, progression);
  
  // Animations si AC complété (100%)
  if (progression === 100) {
    C.animateACCompletion(acCode);
  }
  
  V.popupAC.close();
}

/**
 * Met à jour tous les visuels (AC, niveaux, radar)
 */
C.updateVisuals = function(acCode, progression) {
  // Mettre à jour l'AC
  V.treeSkills.updateACVisual(acCode, progression);
  
  // Calculer et mettre à jour tous les niveaux
  const levelProgressions = M.getAllLevelProgressions();
  for (const levelId in levelProgressions) {
    V.treeSkills.updateLevelVisuals(levelId, levelProgressions[levelId]);
  }
  
  // Mettre à jour le radar
  V.radarView.update(M.getCompetenceAverages());
}

/**
 * Gère les animations de complétion (AC, niveau, compétence)
 */
C.animateACCompletion = function(acCode) {
  // Animation de feu sur l'AC
  const svgRoot = V.treeSkills.dom();
  const acDom = document.getElementById(acCode) || document.getElementById(acCode.replace('.', '-'));
  if (acDom) {
    Animation.acFireEffect(acDom);
  }
  
  // Vérifier les complétions de niveau et compétence
  C.checkLevelCompletion(acCode);
}

/**
 * Vérifie et anime les complétions de niveau et compétence
 */
C.checkLevelCompletion = function(acCode) {
  const skillIndex = acCode.charAt(3);
  const levelIndex = acCode.charAt(2);
  const svgRoot = V.treeSkills.dom();
  
  // Vérifier si le niveau est complet
  const levelACs = pn.getAllACsForSkill(skillIndex).filter(ac => ac.charAt(2) === levelIndex);
  if (!levelACs.every(ac => M.progressions[ac] === 100)) return;
  
  // Animer le niveau complété
  const acDom = document.getElementById(acCode) || document.getElementById(acCode.replace('.', '-'));
  const levelElement = acDom?.closest('[id^="niveau_"]')?.querySelector('g[id^="level_"]');
  if (levelElement) Animation.levelCompletionCrown(levelElement);
  
  // Vérifier si la compétence est complète
  const skillComplete = pn.getAllACsForSkill(skillIndex).every(ac => M.progressions[ac] === 100);
  if (skillComplete) Animation.competitionCompletionFireworks(svgRoot);
}

/**
 * Gère le changement de vue (arbre <-> radar)
 */
C.handler_toggleView = function(newView) {
  const wrapper = V.rootPage.querySelector('.view-wrapper');
  if (wrapper) {
    wrapper.setAttribute('data-current-view', newView);
  }
  
  // Si on passe en vue radar, mettre à jour les données
  if (newView === 'radar') {
    const averages = M.getCompetenceAverages();
    V.radarView.update(averages);
  }
}


C.animateTreeEntry = function() {
  const svgRoot = V.treeSkills.dom().querySelector('#skills_tree') || V.treeSkills.dom();
  if (!svgRoot) return null;

  Animation.starrySky(svgRoot, { count: 80 });

  // lancer l'animation d'arrivée (retourne une timeline ou null)
  const tl = Animation.treeBuild(svgRoot, { duration: 1.0, stagger: 0.035, force: true }) || null;

  // subtle breath pour les 5 bulles centrales
  const centers = ['Comprendre','Concevoir','Exprimer','Developper','Entreprendre']
    .map(id => V.treeSkills.dom().querySelector(`#${id}`))
    .filter(Boolean);
  if (centers.length) Animation.subtleBreath(centers, { minOpacity: 0.97, maxOpacity: 1.0, duration: 10 });

  // Animation de flottement des niveaux
  Animation.floatLevels(svgRoot, { amplitude: 6, duration: 5 });

  // lancer les shooting stars en boucle 
  const fire = () => { Animation.shootStar(svgRoot); gsap.delayedCall(Math.random() * 12 + 8, fire); };
  gsap.delayedCall(4 + Math.random() * 3, fire);

  return tl;
}


// ========== VIEW ==========
let V = {
  rootPage: null,
  treeSkills: null,
  radarView: null,
  popupAC: null,
  popupHistorique: null,
  btnHistorique: null,
  btnExport: null,
  btnToggleView: null
};

/**
 * Initialise la vue
 */
V.init = function() {
  let fragment = V.createPageFragment();
  V.attachEvents(fragment);
  
  // Lancer l'animation APRÈS que le DOM soit mis à jour
  // requestAnimationFrame garantit que le SVG est bien dans le DOM
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      C.animateTreeEntry();
    });
  });
  
  return fragment;
}

/**
 * Crée le fragment de la page avec tous les composants
 */
V.createPageFragment = function() {
  V.rootPage = htmlToDOM(template);
  
  // Créer le composant TreeSkills avec les couleurs du Model
  V.treeSkills = new TreeSkillsView(M.LEVEL_COLORS);
  V.radarView = new RadarView();
  V.popupAC = new PopupACView();
  V.popupHistorique = new HistoriquePopupView();
  V.btnHistorique = new BtnHistoriqueView();
  V.btnExport = BtnExportView.dom();
  V.btnToggleView = new BtnToggleView();

  V.rootPage.querySelector('slot[name="svg"]').replaceWith(V.treeSkills.dom());
  V.rootPage.querySelector('slot[name="radar"]').replaceWith(V.radarView.dom());
  V.rootPage.querySelector('slot[name="popup-ac"]').replaceWith(V.popupAC.dom());
  V.rootPage.querySelector('slot[name="btn-export"]').replaceWith(V.btnExport);
  V.rootPage.querySelector('slot[name="btn-toggle-view"]').replaceWith(V.btnToggleView.dom());
  
  // Injecter le bouton historique dans le slot
  V.rootPage.querySelector('slot[name="btn-historique"]').replaceWith(V.btnHistorique.dom());
  
  document.body.appendChild(V.popupHistorique.dom());
  
  // Initialiser le radar avec les données actuelles
  const averages = M.getCompetenceAverages();
  V.radarView.init(averages);
  
  // Appliquer les progressions chargées depuis localStorage 
  V.applyStoredProgressions();
  
  return V.rootPage;
}

/**
 * Attache les événements aux composants
 */
V.attachEvents = function(fragment) {
  // Attacher les événements des popups
  V.popupAC.attachEvents();
  V.popupAC.initSlider();
  V.popupAC.setOnValidate(C.handler_validateAC);
  V.popupHistorique.attachEvents();
  V.btnHistorique.onClick(C.handler_openHistorique);
  
  // Attacher les clics sur les AC directement (pas via le composant)
  const allACs = V.treeSkills.getAllACs();
  allACs.forEach(acElement => {
    acElement.style.cursor = 'pointer';
    
    // Hover
    acElement.addEventListener('mouseenter', () => {
      acElement.classList.add('ac-hover');
    });
    acElement.addEventListener('mouseleave', () => {
      acElement.classList.remove('ac-hover');
    });
    
    // Click
    acElement.addEventListener('click', () => {
      C.handler_clickOnAC(acElement.id);
    });
  });
  
  // Attacher l'événement du bouton toggle
  V.btnToggleView.setOnClick(C.handler_toggleView);

  return fragment;
}

/**
 * Applique les progressions sauvegardées
 */
V.applyStoredProgressions = function() {
    // Mettre à jour les visuels des AC
    for (const acCode in M.progressions) {
      if (M.progressions[acCode] > 0) {
        V.treeSkills.updateACVisual(acCode, M.progressions[acCode]);
      }
    }
    
    // Appliquer les indicateurs de preuve pour les AC qui en ont
    for (const acCode in M.proofs) {
      if (M.proofs[acCode]) {
        V.treeSkills.setProofIndicator(acCode, M.proofs[acCode]);
      }
    }
    
    // Calculer et mettre à jour tous les niveaux
    const levelProgressions = M.getAllLevelProgressions();
    for (const levelId in levelProgressions) {
      V.treeSkills.updateLevelVisuals(levelId, levelProgressions[levelId]);
    }
    
    // Afficher les labels des AC
    V.treeSkills.showAllACLabels(M.progressions);
}

export function SvgMaDemoPage() {
  return C.init();
}
