
function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

function encrypt(data, secret = '') {
  try {
    const encoded = btoa(unescape(encodeURIComponent(data)));
    return btoa(secret + encoded);
  } catch {
    return data;
  }
}

function decrypt(data, secret = '') {
  try {
    const decoded = atob(data);
    const stripped = decoded.startsWith(secret) ? decoded.slice(secret.length) : decoded;
    return decodeURIComponent(escape(atob(stripped)));
  } catch {
    return data;
  }
}

function loadPersisted(key, initialState, storage = localStorage, secret = '') {
  try {
    const raw = storage.getItem(key);
    if (!raw) return initialState;
    const json = JSON.parse(decrypt(raw, secret));
    const { data, expiry } = json;
    if (expiry && Date.now() > expiry) {
      storage.removeItem(key);
      return initialState;
    }
    return data;
  } catch (e) {
    return initialState;
  }
}

function savePersisted(key, state, storage = localStorage, ttl = null, secret = '') {
  try {
    const payload = ttl ? { data: state, expiry: Date.now() + ttl } : { data: state };
    const encrypted = encrypt(JSON.stringify(payload), secret);
    storage.setItem(key, encrypted);
  } catch (e) {
    console.warn('Failed to persist Kosh state:', e);
  }
}

function removePersisted(key, storage = localStorage) {
  try {
    storage.removeItem(key);
  } catch (e) {
    console.warn('Failed to remove persisted Kosh state:', e);
  }
}

export { deepClone, loadPersisted, savePersisted, removePersisted };
