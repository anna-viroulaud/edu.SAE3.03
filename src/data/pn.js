import data from "./programme_mmi.json";

let pn = [];

for (let cmp in data) {
    pn.push(data[cmp]);
}

pn.getLevelsIndex = function(accode) {
    return accode.charAt(2);
}

pn.getSkillIndex = function(accode) {
    return accode.charAt(3);
}

pn.getACIndex = function(accode) {
    return accode.charAt(6);
}

pn.getACLibelle = function(accode) {
    let skill = pn.getSkillIndex(accode) - 1;
    let level = pn.getLevelsIndex(accode) - 1;
    let ac = pn.getACIndex(accode) - 1;
    return pn[skill].niveaux[level].acs[ac].libelle;
}

pn.getACAnnee = function(accode) {
    let skill = pn.getSkillIndex(accode) - 1;
    let level = pn.getLevelsIndex(accode) - 1;
    return pn[skill].niveaux[level].annee;
}

pn.getCompetenceNom = function(accode) {
    let skill = pn.getSkillIndex(accode) - 1;
    return pn[skill].nom_court;
}

/**
 * Retourne tous les codes AC d'une compétence donnée
 * @param {number} skillIndex - Index de la compétence (1-5)
 * @returns {Array} Tableau des codes AC
 */
pn.getAllACsForSkill = function(skillIndex) {
    const skill = pn[skillIndex - 1];
    if (!skill) return [];
    
    const acs = [];
    skill.niveaux.forEach((niveau, levelIndex) => {
        niveau.acs.forEach((ac, acIndex) => {
            const code = `AC${levelIndex + 1}${skillIndex}.${String(acIndex + 1).padStart(2, '0')}`;
            acs.push(code);
        });
    });
    return acs;
}


export { pn };