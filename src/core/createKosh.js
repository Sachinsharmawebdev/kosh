
import { deepClone, loadPersisted, savePersisted, removePersisted } from './storage.js';

export function createKosh(initialState = {}, options = {}) {
  const {
    persistKey = null,
    storage = localStorage,
    ttl = null,
    secret = ''
  } = options;

  let state = persistKey ? loadPersisted(persistKey, initialState, storage, secret) : deepClone(initialState);
  const listeners = new Set();
  const effects = {};

  const get = (key) => {
    return key ? state[key] : deepClone(state);
  };

  const set = (key, value) => {
    if (typeof key === 'object') {
      Object.entries(key).forEach(([k, v]) => {
        state[k] = typeof v === 'function' ? v(state[k]) : v;
      });
    } else {
      state[key] = typeof value === 'function' ? value(state[key]) : value;
    }
    if (persistKey) savePersisted(persistKey, state, storage, ttl, secret);
    listeners.forEach(fn => fn(deepClone(state)));
  };

  const subscribe = (cb) => {
    listeners.add(cb);
    cb(deepClone(state));
    return () => listeners.delete(cb);
  };

  const effect = (name, fn) => {
    effects[name] = async (...args) => {
      await fn(...args);
      if (persistKey) savePersisted(persistKey, state, storage, ttl, secret);
      listeners.forEach(fn => fn(deepClone(state)));
    };
    return effects[name];
  };

  const clear = () => {
    state = {};
    if (persistKey) removePersisted(persistKey, storage);
    listeners.clear();
  };

  return { get, set, subscribe, effect, clear };
}
