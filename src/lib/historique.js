const STORAGE_KEY_PROGRESSIONS = "sae3.03.progressions";
const STORAGE_KEY_HISTORIQUE = "sae3.03.historique";

// Chargement des progressions et de l'historique depuis le localStorage

export function chargerProgressions() {
  const data = localStorage.getItem(STORAGE_KEY_PROGRESSIONS);
  return data ? JSON.parse(data) : {};
}

export function chargerHistorique() {
  const data = localStorage.getItem(STORAGE_KEY_HISTORIQUE);
  return data ? JSON.parse(data) : [];
}

// gerer le stockage des progressions et de l'historique dans le localStorage

export function sauvegarderProgression(state) {
  localStorage.setItem(STORAGE_KEY_PROGRESSIONS, JSON.stringify(state));
}

export function sauvegarderLog(acCode, progression) {
  const logs = chargerHistorique();
  
  const nouveauLog = {
    date: new Date().toISOString(),
    ac: acCode,
    progression: progression
  };
  
  logs.push(nouveauLog);
  localStorage.setItem(STORAGE_KEY_HISTORIQUE, JSON.stringify(logs));
}



export function effacerHistorique() {
  localStorage.removeItem(STORAGE_KEY_PROGRESSIONS);
  localStorage.removeItem(STORAGE_KEY_HISTORIQUE);
}

/**
* Télécharge un fichier JSON avec toutes les données
*/

export function exporterSauvegarde() {
  const sauvegarde = {
    progressions: chargerProgressions(),
    historique: chargerHistorique()
  };
  
  const blob = new Blob([JSON.stringify(sauvegarde, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  
  link.href = url;
  link.download = `sauvegarde-${new Date().toISOString().split('T')[0]}.json`;
  link.click();
  
  URL.revokeObjectURL(url);
}