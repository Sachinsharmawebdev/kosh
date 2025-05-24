// src/core/createKosh.js
import { deepClone, loadPersisted, savePersisted, removePersisted } from './storage.js';
import { createDevTools } from './devtools.js';

export function createKosh(initialState = {}, options = {}) {
  const {
    actions = {},
    effects = {},
    persistKey = null,
    storage: customStorage,
    ttl = null,
    secret = '',
    devtools = {}
  } = options;

  const isBrowser = typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
  const storage = isBrowser ? window.localStorage : customStorage || {
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {},
  };

  let state = persistKey ? loadPersisted(persistKey, initialState, storage, secret) : deepClone(initialState);
  const listeners = new Set();

  const get = (key) => (key ? state[key] : deepClone(state));

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

  const clear = () => {
    state = {};
    if (persistKey) removePersisted(persistKey, storage);
    listeners.clear();
  };

  // Bind actions
  const boundActions = {};
  for (const key in actions) {
    boundActions[key] = (payload) => {
      const result = actions[key](state, payload);
      if (result !== undefined) state = result;
      if (persistKey) savePersisted(persistKey, state, storage, ttl, secret);
      listeners.forEach(fn => fn(deepClone(state)));
    };
  }

  // Bind effects
  const boundEffects = {};
  for (const key in effects) {
    boundEffects[key] = async (payload) => {
      await effects[key]({ get, set, ...boundActions }, payload);
      if (persistKey) savePersisted(persistKey, state, storage, ttl, secret);
      listeners.forEach(fn => fn(deepClone(state)));
    };
  }

  const store = {
    get,
    set,
    subscribe,
    clear,
    ...boundActions,
    ...boundEffects
  };

  // Initialize devtools if in browser and enabled
  let devToolsInstance = null;
  if (isBrowser && devtools.enabled !== false) {
    devToolsInstance = createDevTools(store, {
      name: devtools.name || 'Kosh Store',
      ...devtools
    });
  }

  return {
    ...store,
    devTools: devToolsInstance
  };
}