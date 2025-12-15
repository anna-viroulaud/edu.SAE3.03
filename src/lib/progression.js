const STORAGE_KEY = "sae3.03_progress";

export function sauvegarderProgression(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function chargerProgressions() {
  const data = localStorage.getItem(STORAGE_KEY);

  if (data === null) {
    return {};
  }

  try {
    return JSON.parse(data) || {};
  } catch (e) {
    return {};
  }
}