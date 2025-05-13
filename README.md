
# Kosh 🧠⚡

**Kosh** is a powerful, modular, and lightweight state management library for JavaScript and frontend frameworks.  
Built with simplicity and flexibility in mind, Kosh supports in-memory storage, optional persistence with TTL, encryption, and reactive updates — making it ideal for both small apps and complex applications.

---

## 🚀 Features

- ✅ Minimal setup, zero boilerplate
- 🔒 Optional encryption for secure storage
- ♻️ Reactive updates with `subscribe()`
- 🧱 Modular and pluggable architecture
- 💾 Built-in persistence with TTL support
- ⚡ Framework agnostic — works with React, Vue, Angular, Vanilla JS
- 🪶 Super lightweight (~2 KB gzipped)

---

## 📦 Installation

```bash
npm install kosh
```

---

## 🧪 Basic Usage (Vanilla JS)

```js
import { createKosh } from 'kosh';

const store = createKosh({ count: 0 });

store.subscribe(state => {
  console.log('Updated state:', state);
});

store.set('count', prev => prev + 1);
store.set({ count: 100 });
console.log(store.get('count')); // 100
```

---

## 🔁 With Persistence

```js
const store = createKosh({ theme: 'light' }, {
  persistKey: 'my-app-theme',
  ttl: 86400000, // 1 day in ms
});
```

---

## 🔐 With Encryption

```js
const store = createKosh({ authToken: '' }, {
  persistKey: 'secure-auth',
  secret: 'my-secret-key'
});
```

---

## 🔧 With Async Effects

```js
const store = createKosh({ data: null });

store.effect('fetchData', async () => {
  const res = await fetch('https://api.example.com/data');
  const json = await res.json();
  store.set('data', json);
});

store.effects.fetchData();
```

---

## ⚛️ React Usage

```jsx
import React, { useEffect, useState } from 'react';
import { createKosh } from 'kosh';

const counterStore = createKosh({ count: 0 });

function Counter() {
  const [state, setState] = useState(counterStore.get());

  useEffect(() => {
    const unsub = counterStore.subscribe(setState);
    return unsub;
  }, []);

  return (
    <div>
      <p>Count: {state.count}</p>
      <button onClick={() => counterStore.set('count', c => c + 1)}>+</button>
    </div>
  );
}
```

---

## 🖼️ Vue Usage (v3 Composition API)

```js
import { ref, onMounted } from 'vue';
import { createKosh } from 'kosh';

const store = createKosh({ user: null });

export default {
  setup() {
    const state = ref(store.get());

    onMounted(() => {
      const unsub = store.subscribe(s => state.value = s);
      return unsub;
    });

    return { state };
  }
};
```

---

## 🅰️ Angular (with RxJS-like behavior)

```ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { createKosh } from 'kosh';

const store = createKosh({ value: 0 });

@Component({
  selector: 'app-counter',
  template: `
    <p>{{ state?.value }}</p>
    <button (click)="increment()">Increment</button>
  `
})
export class CounterComponent implements OnInit, OnDestroy {
  state: any;
  private unsub: () => void;

  ngOnInit() {
    this.unsub = store.subscribe(s => this.state = s);
  }

  ngOnDestroy() {
    this.unsub?.();
  }

  increment() {
    store.set('value', v => v + 1);
  }
}
```

---

## 📚 API Reference

### `createKosh(initialState, options)`
- `persistKey`: string (optional) — key for persistent storage
- `ttl`: number (optional) — expiration in milliseconds
- `secret`: string (optional) — for encryption
- `storage`: localStorage/sessionStorage (default: localStorage)

### Store Methods

| Method        | Description                                |
|---------------|--------------------------------------------|
| `get(key?)`   | Get full state or a specific key           |
| `set(key, value)` | Set state key or partial object        |
| `subscribe(cb)` | Subscribe to state changes               |
| `effect(name, fn)` | Register an async side-effect         |
| `clear()`     | Clears all state and subscribers           |

---

## 📘 License

MIT © 2025 — Made with ❤️ for modern frontend developers by sachin sharma from India
