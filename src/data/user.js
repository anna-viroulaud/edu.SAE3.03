import { pn } from "@/data/pn.js";

class User {
  constructor() {
    this.USER_KEY = 'sae303_user_progress';
    this.HISTORY_KEY = 'sae303_history';
    this.data = this._load() || this._createEmpty();
    this.history = this._loadHistory();
  }

  _createEmpty() { return { lastUpdate: new Date().toISOString(), progress: {} }; }
  _load() { const raw = localStorage.getItem(this.USER_KEY); return raw ? JSON.parse(raw) : null; }
  _loadHistory() { const raw = localStorage.getItem(this.HISTORY_KEY); if (!raw) return []; const h = JSON.parse(raw); h.sort((a,b)=> new Date(b.date)-new Date(a.date)); return h; }

  // Charge toutes les données (raw)
  loadAll() { return this._load(); }

  // Sauvegarde la progression d'un AC (enregistre l'historique si la valeur change)
  save(acCode, progress) {
    if (!acCode) return;
    const old = Number(this.data.progress?.[acCode] ?? 0);
    const v = Number(progress) || 0;
    this.data.progress[acCode] = v;
    this.data.lastUpdate = new Date().toISOString();
    localStorage.setItem(this.USER_KEY, JSON.stringify(this.data));

    // enregistrer l'historique si changement
    if (old !== v) {
      let label = acCode;
      try { if (typeof pn.getAcLibelle === 'function') label = pn.getAcLibelle(acCode); } catch (e) {}
      this.history.unshift({ date: new Date().toISOString(), ac: acCode, oldProgress: old, newProgress: v, label });
      localStorage.setItem(this.HISTORY_KEY, JSON.stringify(this.history));
    }
  }

  // Charge la map des progressions
  loadProgressMap() { return this.data?.progress || {}; }

  // Efface tout
  clearAll() { this.data = this._createEmpty(); localStorage.removeItem(this.USER_KEY); }

  // Historique
  addHistory(acCode, oldProgress, newProgress) {
    if (oldProgress === newProgress) return;
    let label = acCode;
    try { if (typeof pn.getAcLibelle === 'function') label = pn.getAcLibelle(acCode); } catch (e) {}
    this.history.push({ date: new Date().toISOString(), ac: acCode, oldProgress, newProgress, label });
    localStorage.setItem(this.HISTORY_KEY, JSON.stringify(this.history));
  }

  loadHistory() { return Array.from(this.history); }

  getHistory() { return this.loadHistory(); }

  // stats and export (small helpers)
  getHistoryStats() { return { count: this.history.length, lastUpdate: this.history[0]?.date || null, size: new Blob([JSON.stringify(this.history)]).size }; }

  exportHistory() { const blob = new Blob([JSON.stringify(this.history, null, 2)], { type: 'application/json' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = `sae303-historique-${new Date().toISOString().split('T')[0]}.json`; a.click(); URL.revokeObjectURL(url); }

  clearHistory() { this.history = []; localStorage.removeItem(this.HISTORY_KEY); }
}

const user = new User();
export { user, User };

