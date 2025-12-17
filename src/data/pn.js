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


export { pn };