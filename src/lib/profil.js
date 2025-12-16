/**
 * Export simple de la sauvegarde en JSON
 */

import { chargerProgressions } from "./progression.js";
import { chargerHistorique } from "./historique.js";

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
