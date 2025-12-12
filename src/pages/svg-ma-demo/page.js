import { TreeSkillsView } from "@/ui/tree-skills";
import { htmlToFragment } from "@/lib/utils.js";
import template from "./template.html?raw";
import popupTemplate from "@/ui/popup-ac/template.html?raw";
import "@/ui/popup-ac/style.css";
import levelPopupTemplate from "@/ui/popup-level/template.html?raw";
import "@/ui/popup-level/style.css";

/**
 * Page svg-ma-demo
 * Pattern MVC selon l'architecture du projet
 * Responsabilité : Gérer les données, la logique métier et la popup
 */

// MODEL - Données de la page
let M = {
  treeData: null,
  selectedACElement: null, // Référence à l'élément AC actuellement sélectionné
  selectedLevelElement: null // Référence à l'élément Level actuellement sélectionné
};

// CONTROLLER - Logique métier
let C = {};

C.init = async function() {
  // Charger les données du référentiel de compétences
  await C.loadTreeData();
  return V.init(M.treeData);
}

C.loadTreeData = async function() {
  try {
    const response = await fetch('/src/data/tree.json');
    const data = await response.json();
    M.treeData = data[0];
  } catch (error) {
    console.error('Erreur lors du chargement des données:', error);
  }
}

/**
 * Handler pour les clics sur les AC (Apprentissages Critiques)
 * PRIORITÉ 1 : Traité avant le handler Level
 * @param {Event} ev - L'événement de clic
 */
C.handler_clickOnAC = function(ev) {
  // Vérifier d'abord si on a cliqué directement sur un AC
  const acElement = ev.target.closest('g[id^="AC"]');
  
  // Ignorer les sous-groupes (identifiants contenant '_')
  if (acElement && !acElement.id.includes('_')) {
    // Empêcher la propagation vers le handler Level
    ev.stopPropagation();
    
    // Convertir l'ID SVG (AC11-01) en code JSON (AC11.01)
    const acCode = acElement.id.replace('-', '.');
    
    // Mettre en surbrillance l'AC sélectionné
    C.highlightAC(acElement);
    
    // Ouvrir la popup avec les détails de l'AC
    C.openACPopup(acCode);
    return;
  }
}

/**
 * Handler pour les clics sur les niveaux de compétences
 * PRIORITÉ 2 : Traité après le handler AC (si pas stoppé)
 * @param {Event} ev - L'événement de clic
 */
C.handler_clickOnLevel = function(ev) {
  // D'abord vérifier qu'on n'est PAS sur un AC
  // (car les AC sont imbriqués dans les niveaux)
  const acElement = ev.target.closest('g[id^="AC"]');
  if (acElement && !acElement.id.includes('_')) {
    // On est sur un AC, ne rien faire (le handler AC s'en occupe)
    return;
  }
  
  // Vérifier si on a cliqué sur un niveau
  const levelElement = ev.target.closest('g[id*="_niv"]');
  if (levelElement) {
    const levelId = levelElement.id;
    C.openLevelPopup(levelId);
  }
}

/**
 * Mettre en surbrillance un AC dans le SVG
 * Restaure l'ancien AC sélectionné et met en blanc le nouveau
 * @param {Element} acElement - L'élément SVG de l'AC à mettre en surbrillance
 */
C.highlightAC = function(acElement) {
  // Restaurer l'ancien élément sélectionné à son état normal
  if (M.selectedACElement) {
    const oldPaths = M.selectedACElement.querySelectorAll('path');
    oldPaths.forEach(path => {
      path.style.fill = '';
      path.style.stroke = '';
    });
    M.selectedACElement.style.opacity = '1';
  }
  
  // Sauvegarder et mettre en surbrillance le nouvel élément
  M.selectedACElement = acElement;
  
  // Trouver tous les paths dans cet AC et les mettre en blanc
  const paths = acElement.querySelectorAll('path');
  paths.forEach(path => {
    path.style.fill = '#FFFFFF';
    path.style.stroke = '#FFFFFF';
  });
}

C.handler_closePopup = function() {
  const popup = document.getElementById('acPopup');
  popup.classList.remove('active');
  
  // Restaurer l'AC à son état normal quand on ferme la popup
  if (M.selectedACElement) {
    const paths = M.selectedACElement.querySelectorAll('path');
    paths.forEach(path => {
      path.style.fill = '';
      path.style.stroke = '';
    });
    M.selectedACElement.style.opacity = '1';
    M.selectedACElement = null;
  }
}

C.handler_validateProgress = function() {
  const progressSlider = document.getElementById('progressSlider');
  const progress = progressSlider.value;
  // TODO: Sauvegarder la progression dans localStorage ou API
  C.handler_closePopup();
}

C.handler_updateProgress = function(ev) {
  const value = ev.target.value;
  const progressValue = document.getElementById('progressValue');
  progressValue.textContent = value + '%';
  
  // Mettre à jour le gradient du slider
  ev.target.style.background = `linear-gradient(to right, #1DD1A1 0%, #1DD1A1 ${value}%, #D0D0D0 ${value}%, #D0D0D0 100%)`;
}

/**
 * Ouvrir la popup de détails d'un AC
 * Recherche les données de l'AC dans le référentiel et remplit la popup
 * @param {string} acCode - Le code de l'AC (ex: "AC11.01")
 */
C.openACPopup = function(acCode) {
  if (!M.treeData) {
    console.error('Les données ne sont pas encore chargées');
    return;
  }

  let acData = null;
  let competenceName = '';
  let annee = '';

  // Parcourir toutes les compétences pour trouver l'AC
  for (const competenceId in M.treeData) {
    const competence = M.treeData[competenceId];

    // Parcourir tous les niveaux de la compétence
    for (const niveau of competence.niveaux) {
      const foundAc = niveau.acs.find(ac => ac.code === acCode);
      if (foundAc) {
        acData = foundAc;
        competenceName = competence.nom_court;
        annee = niveau.annee;
        break;
      }
    }
    if (acData) break;
  }

  if (!acData) {
    console.error('AC non trouvé:', acCode);
    return;
  }

  // Remplir la popup avec les données de l'AC
  document.getElementById('popupCode').textContent = acData.code;
  document.getElementById('popupLibelle').textContent = acData.libelle;
  document.getElementById('popupAnnee').textContent = annee;
  document.getElementById('popupCompetence').textContent = competenceName;

  // Afficher la popup
  const popup = document.getElementById('acPopup');
  popup.classList.add('active');
}

/**
 * Ouvrir la popup de détails d'un niveau de compétence
 * Recherche les données du niveau dans le référentiel et affiche les AC associés
 * @param {string} levelId - L'ID du niveau (ex: "entreprendre_niv2")
 */
C.openLevelPopup = function(levelId) {
  if (!M.treeData) {
    console.error('Les données ne sont pas encore chargées');
    return;
  }

  // Parser l'ID du niveau (format: "entreprendre_niv2", "comprendre_niv1", etc.)
  const match = levelId.match(/^(.+)_niv(\d+)$/);
  if (!match) {
    console.error('Format d\'ID de niveau invalide:', levelId);
    return;
  }

  const competenceNameLower = match[1]; // "entreprendre", "comprendre", etc.
  const niveauNumero = parseInt(match[2]); // 0, 1, 2, 3 (numéro dans le SVG)

  // Les niveaux 0 ne sont pas cliquables (placeholders visuels sans données)
  if (niveauNumero === 0) {
    return;
  }

  // Trouver les données du niveau dans treeData
  let niveauData = null;
  let competenceName = '';
  let competenceColor = '';

  // Mapping des noms SVG → JSON
  // Note: "developper" dans le SVG = "Développer" dans le JSON
  const competenceNameMap = {
    'developper': 'développer',  // SVG a 1 seul "p", JSON a 2 "p"
  };
  
  // Normaliser le nom de la compétence
  const normalizedName = competenceNameMap[competenceNameLower] || competenceNameLower;

  // Parcourir toutes les compétences
  for (const competenceId in M.treeData) {
    const competence = M.treeData[competenceId];
    
    // Comparer le nom de la compétence (case-insensitive)
    if (competence.nom_court.toLowerCase() === normalizedName) {
      // Trouver le niveau correspondant
      // MAPPING SVG → JSON:
      // Le SVG a des niveaux niv0, niv1, niv2, niv3
      // Les données JSON ont des ordres 1, 2, 3 (pas de 0)
      // Donc: niv1 → ordre 1, niv2 → ordre 2, niv3 → ordre 3
      // Et niv0 est juste un placeholder visuel (pas de données)
      for (const niveau of competence.niveaux) {
        if (niveau.ordre === niveauNumero) {
          niveauData = niveau;
          competenceName = competence.nom_court;
          competenceColor = competence.couleur;
          break;
        }
      }
      break;
    }
  }

  if (!niveauData) {
    console.error('Niveau non trouvé:', levelId);
    return;
  }

  // Remplir la popup avec les données du niveau
  document.getElementById('levelTitle').textContent = `Niveau ${niveauData.ordre} - ${niveauData.annee}`;
  document.getElementById('levelDescription').textContent = niveauData.libelle;
  document.getElementById('levelCompetence').textContent = competenceName;
  document.getElementById('levelAnnee').textContent = niveauData.annee;

  // Générer la liste des AC
  const acListContainer = document.getElementById('acList');
  acListContainer.innerHTML = ''; // Vider la liste

  niveauData.acs.forEach(ac => {
    const acCard = document.createElement('div');
    acCard.className = 'ac-card';
    acCard.dataset.acCode = ac.code;
    acCard.innerHTML = `
      <div class="ac-card-code">${ac.code}</div>
      <div class="ac-card-content">
        <p class="ac-card-libelle">${ac.libelle}</p>
      </div>
    `;
    
    // Ajouter un event listener pour ouvrir la popup AC au clic
    acCard.addEventListener('click', () => {
      C.handler_closeLevelPopup(); // Fermer la popup niveau
      // Trouver l'élément AC dans le SVG et le mettre en surbrillance
      const acElement = document.querySelector(`g[id="${ac.code.replace('.', '-')}"]`);
      if (acElement) {
        C.highlightAC(acElement);
      }
      C.openACPopup(ac.code); // Ouvrir la popup AC
    });
    
    acListContainer.appendChild(acCard);
  });

  // Appliquer la couleur du header selon la compétence
  const levelHeader = document.querySelector('.level-popup-header');
  if (levelHeader) {
    // Définir les couleurs des compétences
    const colorMap = {
      'c1': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', // Comprendre
      'c2': 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', // Concevoir
      'c3': 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', // Exprimer
      'c4': 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', // Développer
      'c5': 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)'  // Entreprendre
    };
    levelHeader.style.background = colorMap[competenceColor] || colorMap['c1'];
  }

  // Afficher la popup
  const popup = document.getElementById('levelPopup');
  popup.classList.add('active');
}

C.handler_closeLevelPopup = function() {
  const popup = document.getElementById('levelPopup');
  popup.classList.remove('active');
}

// VIEW - Génération du DOM et gestion des événements
let V = {};

V.init = function(data) {
  // Initialiser les popups dans le body (nécessaire pour positionnement fixed)
  V.initPopups();
  
  // Créer le fragment de la page
  let pageFragment = V.createPageFragment(data);
  
  // Attacher les événements
  V.attachEvents(pageFragment);
  
  return pageFragment;
}

V.createPageFragment = function(data) {
  // Créer le fragment de la page depuis le template
  let pageFragment = htmlToFragment(template);
  
  // Générer le composant tree-skills
  let treeSkillsDOM = TreeSkillsView.dom();
  
  // Remplacer le slot par le composant
  pageFragment.querySelector('slot[name="svg"]').replaceWith(treeSkillsDOM);
  
  return pageFragment;
}

V.initPopups = function() {
  // Initialiser la popup AC dans le body si elle n'existe pas
  // Note : Les popups doivent être dans le body pour le positionnement fixed
  if (!document.getElementById('acPopup')) {
    document.body.insertAdjacentHTML('beforeend', popupTemplate);
    V.attachPopupEvents();
  }
  
  // Initialiser la popup Level dans le body si elle n'existe pas
  if (!document.getElementById('levelPopup')) {
    document.body.insertAdjacentHTML('beforeend', levelPopupTemplate);
    V.attachLevelPopupEvents();
  }
}

/**
 * Attacher les événements au fragment de la page
 * Conformément à l'architecture MVC de la documentation
 * @param {DocumentFragment} pageFragment - Le fragment contenant la page
 * @returns {DocumentFragment} Le fragment avec les événements attachés
 */
V.attachEvents = function(pageFragment) {
  // Récupérer l'élément racine du fragment
  const root = pageFragment.firstElementChild;
  
  // Attendre que le DOM soit chargé pour attacher les événements sur le SVG
  // Note: setTimeout nécessaire car le SVG est chargé de manière asynchrone
  setTimeout(() => {
    const svgRoot = root.querySelector('svg');
    if (svgRoot) {
      // IMPORTANT : Attacher d'abord le handler AC (priorité la plus haute)
      // Car les AC sont imbriqués dans les niveaux (event bubbling)
      svgRoot.addEventListener('click', C.handler_clickOnAC);
      
      // Puis le handler Level (exécuté seulement si AC n'a pas stoppé la propagation)
      svgRoot.addEventListener('click', C.handler_clickOnLevel);
      
      // Ajouter les styles hover sur les AC
      // Filtrer uniquement les groupes principaux (pas les sous-groupes avec underscore)
      const acElements = Array.from(svgRoot.querySelectorAll('g[id^="AC"]'))
        .filter(el => !el.id.includes('_'));
      
      acElements.forEach(element => {
        element.style.cursor = 'pointer';
        element.addEventListener('mouseenter', () => {
          element.style.opacity = '0.7';
        });
        element.addEventListener('mouseleave', () => {
          element.style.opacity = '1';
        });
      });
      
      // Ajouter les styles hover sur les niveaux (format: {competence}_niv{numero})
      // EXCLURE les niveaux 0 (placeholders visuels sans données)
      const levelElements = Array.from(svgRoot.querySelectorAll('g[id]'))
        .filter(el => el.id.includes('_niv') && !el.id.includes('_niv0'));
      
      levelElements.forEach(element => {
        element.style.cursor = 'pointer';
        element.addEventListener('mouseenter', () => {
          element.style.opacity = '0.7';
        });
        element.addEventListener('mouseleave', () => {
          element.style.opacity = '1';
        });
      });
    }
  }, 100);
  
  return pageFragment;
}

V.attachPopupEvents = function() {
  const closeBtn = document.getElementById('closePopupBtn');
  const validateBtn = document.getElementById('validateBtn');
  const popup = document.getElementById('acPopup');
  const progressSlider = document.getElementById('progressSlider');

  if (closeBtn && !closeBtn.dataset.listenerAttached) {
    closeBtn.addEventListener('click', C.handler_closePopup);
    closeBtn.dataset.listenerAttached = 'true';
  }

  if (validateBtn && !validateBtn.dataset.listenerAttached) {
    validateBtn.addEventListener('click', C.handler_validateProgress);
    validateBtn.dataset.listenerAttached = 'true';
  }

  if (progressSlider && !progressSlider.dataset.listenerAttached) {
    progressSlider.addEventListener('input', C.handler_updateProgress);
    progressSlider.dataset.listenerAttached = 'true';
  }

  if (popup && !popup.dataset.listenerAttached) {
    // Fermer si on clique en dehors
    popup.addEventListener('click', (e) => {
      if (e.target === popup) {
        C.handler_closePopup();
      }
    });

    // Fermer avec la touche Échap (event global mais vérifie si popup active)
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && popup.classList.contains('active')) {
        C.handler_closePopup();
      }
    });
    
    popup.dataset.listenerAttached = 'true';
  }
}

V.attachLevelPopupEvents = function() {
  const closeLevelBtn = document.getElementById('closeLevelPopupBtn');
  const levelPopup = document.getElementById('levelPopup');

  if (closeLevelBtn && !closeLevelBtn.dataset.listenerAttached) {
    closeLevelBtn.addEventListener('click', C.handler_closeLevelPopup);
    closeLevelBtn.dataset.listenerAttached = 'true';
  }

  if (levelPopup && !levelPopup.dataset.listenerAttached) {
    // Fermer si on clique en dehors
    levelPopup.addEventListener('click', (e) => {
      if (e.target === levelPopup) {
        C.handler_closeLevelPopup();
      }
    });

    // Fermer avec la touche Échap (event global mais vérifie si popup active)
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && levelPopup.classList.contains('active')) {
        C.handler_closeLevelPopup();
      }
    });
    
    levelPopup.dataset.listenerAttached = 'true';
  }
}

export function SvgMaDemoPage() {
  return C.init();
}