import data from "./programme_mmi.json";

let pn = [];

// Convertir l'objet data en tableau
for (let cmp in data) {
    pn.push(data[cmp]);
}

/**
 * Initialise pn avec des données externes
 */
pn.init = function(data) {
    pn.length = 0;
    for (let cmp in data) {
        pn.push(data[cmp]);
    }
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

pn.getACLIbelle = function(accode) {
    let skill = pn.getSkillIndex(accode) - 1;
    let level = pn.getLevelsIndex(accode) - 1;
    let ac = pn.getACIndex(accode) - 1;

    return pn[skill].niveaux[level].acs[ac].libelle;
}

export { pn };