const STORAGE_KEY = "sae3.03_historique";

export function sauvegarderLog(acCode, progression) {
  const logs = chargerHistorique();
  
  const nouveauLog = {
    date: new Date().toISOString(),
    ac: acCode,
    progression: progression
  };
  
  logs.push(nouveauLog);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(logs));
}

export function chargerHistorique() {
  const data = localStorage.getItem(STORAGE_KEY);
  
  if (data === null) {
    return [];
  }
  
  try {
    return JSON.parse(data) || [];
  } catch (e) {
    return [];
  }
}

export function effacerHistorique() {
  localStorage.removeItem(STORAGE_KEY);
}
