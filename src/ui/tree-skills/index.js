import { htmlToDOM } from "../../lib/utils.js";
import template from "./template.html?raw";

/**
 * Composant UI tree-skills
 * Responsabilité : Afficher le SVG de l'arbre de compétences avec les données injectées
 * Suit le pattern des composants UI (comme SpinnerView, ShapesView, etc.)
 */
class TreeSkillsView {
  constructor() {
    this.root = null;
    this.treeData = null;
  }

  /**
   * Initialise le composant avec les données du référentiel
   * @param {Object} treeData - Données du tree.json
   */
  setData(treeData) {
    this.treeData = treeData;
    this.root = htmlToDOM(template);
    this.injectData();
    return this;
  }


   /**
   * Injecte les données du JSON dans le SVG
   */
  injectData() {
    if (!this.treeData || !this.root) return;

    // Parcourir toutes les compétences
    for (const competenceId in this.treeData) {
      const competence = this.treeData[competenceId];
      
      // Injecter les données des AC pour chaque niveau
      for (const niveau of competence.niveaux) {
        for (const ac of niveau.acs) {
          // Les groupes SVG ont des IDs comme "AC11.01", "AC21.03", etc.
          // Utiliser getElementById car les points dans querySelector nécessitent un échappement
          const acGroup = this.root.getElementById(ac.code);
          if (acGroup) {
            // Ajouter un attribut data pour faciliter l'accès aux infos
            acGroup.dataset.code = ac.code;
            acGroup.dataset.libelle = ac.libelle;
            acGroup.dataset.annee = niveau.annee;
            acGroup.dataset.competence = competence.nom_court;
          }
        }
      }
    }
  }

  /**
   * Retourne le DOM du composant
   */
  dom() {
    if (!this.root) {
      // Si pas de données, retourner le template vide
      this.root = htmlToDOM(template);
    }
    return this.root;
  }

  /**
   * Permet d'accéder à un élément AC spécifique
   * @param {string} acCode - Code de l'AC (ex: "AC11.01")
   */
  getAC(acCode) {
    if (!this.root) return null;
    // Utiliser getElementById car les points dans querySelector nécessitent un échappement
    return this.root.getElementById(acCode);
  }

  /**
   * Retourne tous les groupes AC
   */
  getAllACs() {
    if (!this.root) return [];
    return this.root.querySelectorAll('g[id^="AC"]');
  }

  /** 
   * Active les interactions sur les AC (comme dans GraphView)
   * @param {Function} onACClick - Callback appelé avec les données de l'AC cliqué
   */
  enableACInteractions(onACClick) {
    if (!this.root) return;

    const allACs = this.getAllACs();
    allACs.forEach(acElement => {
      acElement.style.cursor = 'pointer';
      
      acElement.addEventListener('click', () => {
        const acData = {
          code: acElement.dataset.code,
          libelle: acElement.dataset.libelle,
          annee: acElement.dataset.annee,
          competence: acElement.dataset.competence
        };
        onACClick(acData);
      });
    });
  }

  /**
   * Active les interactions sur les niveaux (level_*)
   * @param {Function} onLevelClick - Callback appelé avec les données du niveau cliqué
   */
  enableLevelInteractions(onLevelClick) {
    if (!this.root) return;

    // Trouver tous les éléments avec id commençant par "level_"
    const allLevels = this.root.querySelectorAll('g[id^="level_"]');
    
    allLevels.forEach(levelElement => {
      levelElement.style.cursor = 'pointer';
      
      levelElement.addEventListener('click', (e) => {
        // Empêcher la propagation pour ne pas déclencher les clics sur les AC
        e.stopPropagation();
        
        // Extraire les infos du niveau depuis dataset (ajouté par injectData)
        const levelData = this.findLevelData(levelElement.id);
        if (levelData) {
          onLevelClick(levelData);
        }
      });
    });
  }

  /**
   * Trouve les données d'un niveau par son ID (level_1, level_1_2, etc.)
   */
  findLevelData(levelId) {
    if (!this.treeData) return null;

    // Compter les niveaux pour trouver le bon
    let niveauCount = 0;
    
    // Parcourir toutes les compétences
    for (const competenceId in this.treeData) {
      const competence = this.treeData[competenceId];
      
      // Parcourir tous les niveaux de cette compétence
      for (const niveau of competence.niveaux) {
        niveauCount++;
        
        // Vérifier si c'est le niveau correspondant à l'ID
        // level_1 = 1er niveau, level_1_2 = 2ème niveau, etc.
        const levelNumber = parseInt(levelId.split('_').pop());
        
        if (niveauCount === levelNumber && niveau.acs && niveau.acs.length > 0) {
          return {
            ordre: niveau.ordre,
            libelle: niveau.libelle,
            annee: niveau.annee,
            competence: competence.nom_court,
            acs: niveau.acs
          };
        }
      }
    }
    
    return null;
  }
}

export { TreeSkillsView };