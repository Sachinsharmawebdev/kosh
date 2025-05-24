import { createKosh } from './src/index.js';

// Create store with sessionStorage
const store = createKosh(
  { count: 0 },
  {
    persistKey: 'test-session-state',
    storage: window.sessionStorage,
    actions: {
      increment: (state) => ({ ...state, count: state.count + 1 })
    }
  }
);

// Test the store
console.log('Initial state:', store.get());

// Increment the count
store.increment();
console.log('After increment:', store.get());

// Verify data is in sessionStorage
console.log('SessionStorage data:', window.sessionStorage.getItem('test-session-state'));

// Clear the store
store.clear();
console.log('After clear:', store.get());
console.log('SessionStorage after clear:', window.sessionStorage.getItem('test-session-state')); 