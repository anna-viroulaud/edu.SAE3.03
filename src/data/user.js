// Version très simple et légère de User (progress + history)
class User {
  constructor(storageKey = 'sae3.03.user') {
    this.storageKey = storageKey;
    this.data = { progress: {}, history: [] };
    this.load();
  }

  load() {
    try {
      const raw = localStorage.getItem(this.storageKey);
      if (!raw) return this.data;
      this.data = JSON.parse(raw) || this.data;
    } catch (e) {
      this.data = { progress: {}, history: [] };
    }
    return this.data;
  }

  save() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.data));
      return true;
    } catch (e) {
      return false;
    }
  }

  get(acCode) {
    return this.data.progress[acCode] || 0;
  }

  set(acCode, value) {
    if (!acCode) return false;
    const v = Math.max(0, Math.min(100, Number(value) || 0));
    const old = this.get(acCode);
    if (old === v) return true;
    this.data.progress[acCode] = v;
    this.data.history = this.data.history || [];
    this.data.history.push({ date: new Date().toISOString(), ac: acCode, old, new: v });
    return this.save();
  }

  getMap() { 
    return Object.assign({}, this.data.progress || {}); 
 }

  getHistory(limit = null) { 
    const h = this.data.history || []; 
    return limit ? h.slice(-limit) : Array.from(h); 
  }

  export(filename = null) {
    const blob = new Blob([JSON.stringify(this.data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename || `sae3.03-user-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  clear() { 
    this.data = { progress: {}, history: [] }; 
    try 
    { localStorage.removeItem(this.storageKey); 

    } 
    catch (e) {
        
    } }
}

const user = new User();
export { User, user };

