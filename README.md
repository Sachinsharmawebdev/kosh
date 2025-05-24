# Kosh - Lightweight State Management

Kosh is a lightweight, framework-agnostic state management library that provides a simple and powerful way to manage your application's state. It includes built-in persistence, security features, and a powerful DevTools for debugging.

## Features

- 🚀 **Lightweight**: Minimal bundle size with zero dependencies
- 🔄 **Framework Agnostic**: Works with any framework (React, Vue, Angular, etc.)
- 💾 **Persistence**: Built-in support for localStorage and sessionStorage
- 🔒 **Security**: Optional encryption for sensitive data
- 🛠️ **DevTools**: Powerful debugging tools with time travel
- ⚡ **Performance**: Optimized for performance with minimal overhead
- 📦 **TypeScript**: Full TypeScript support
- 🔌 **Extensible**: Easy to extend with custom storage and middleware

## Installation

```bash
npm install kosh
```

## Quick Start

```javascript
import { createKosh } from 'kosh';

// Create a store
const store = createKosh(
  { count: 0 },
  {
    actions: {
      increment: (state) => ({ ...state, count: state.count + 1 })
    },
    effects: {
      fetchData: async ({ set }) => {
        const data = await api.getData();
        set('data', data);
      }
    },
    devtools: {
      enabled: true
    }
  }
);

// Use the store
store.get('count'); // 0
store.increment();
store.get('count'); // 1
```

## Core Features

### State Management

```javascript
const store = createKosh({ count: 0 });

// Get state
const count = store.get('count');
const fullState = store.get();

// Set state
store.set('count', 1);
store.set({ count: 2, user: { name: 'John' } });

// Subscribe to changes
const unsubscribe = store.subscribe((state) => {
  console.log('State changed:', state);
});
```

### Actions

```javascript
const store = createKosh(
  { count: 0 },
  {
    actions: {
      increment: (state) => ({ ...state, count: state.count + 1 }),
      setCount: (state, count) => ({ ...state, count })
    }
  }
);

store.increment();
store.setCount(5);
```

### Effects

```javascript
const store = createKosh(
  { data: null, loading: false },
  {
    effects: {
      fetchData: async ({ set, get }) => {
        set('loading', true);
        const data = await api.getData();
        set({ data, loading: false });
      }
    }
  }
);

store.fetchData();
```

### Persistence

```javascript
const store = createKosh(
  { count: 0 },
  {
    persistKey: 'my-app-state',
    storage: window.localStorage, // or sessionStorage
    ttl: 3600 // Time to live in seconds
  }
);
```

### Security

```javascript
const store = createKosh(
  { sensitiveData: 'secret' },
  {
    secret: 'your-secret-key',
    persistKey: 'encrypted-state'
  }
);
```

## DevTools

Kosh includes a powerful DevTools for debugging your application state:

```javascript
const store = createKosh(
  { count: 0 },
  {
    devtools: {
      enabled: true,
      name: 'My Store',
      maxHistory: 50
    }
  }
);
```

### DevTools Features

- 🔍 **State Inspection**: View and search your application state
- ⏱️ **Time Travel**: Navigate through state history
- 📝 **Action Logging**: Track all actions and effects
- 🔄 **State Diff**: Compare state changes
- 📤 **Export/Import**: Save and load state snapshots

For detailed DevTools documentation, see [DEVTOOLS.md](./DEVTOOLS.md).

## Framework Integration

### React

```jsx
import { useEffect, useState } from 'react';
import { createKosh } from 'kosh';

const store = createKosh({ count: 0 });

function Counter() {
  const [state, setState] = useState(store.get());

  useEffect(() => {
    return store.subscribe(setState);
  }, []);

  return (
    <div>
      <p>Count: {state.count}</p>
      <button onClick={() => store.set('count', state.count + 1)}>
        Increment
      </button>
    </div>
  );
}
```

### Vue

```vue
<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { createKosh } from 'kosh';

const store = createKosh({ count: 0 });
const state = ref(store.get());

let unsubscribe;

onMounted(() => {
  unsubscribe = store.subscribe((newState) => {
    state.value = newState;
  });
});

onUnmounted(() => {
  unsubscribe();
});
</script>

<template>
  <div>
    <p>Count: {{ state.count }}</p>
    <button @click="store.set('count', state.count + 1)">
      Increment
    </button>
  </div>
</template>
```

### Angular

```typescript
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { createKosh } from 'kosh';

@Injectable({
  providedIn: 'root'
})
export class StoreService {
  private store = createKosh({ count: 0 });
  private stateSubject = new BehaviorSubject(this.store.get());

  constructor() {
    this.store.subscribe((state) => {
      this.stateSubject.next(state);
    });
  }

  getState() {
    return this.stateSubject.asObservable();
  }

  increment() {
    this.store.set('count', this.store.get('count') + 1);
  }
}
```

## TypeScript Support

Kosh provides full TypeScript support. See [TYPESCRIPT.md](./TYPESCRIPT.md) for detailed documentation.

```typescript
interface AppState {
  count: number;
  user: {
    name: string;
    age: number;
  };
}

const store = createKosh<AppState>({
  count: 0,
  user: {
    name: 'John',
    age: 30
  }
});
```

## Best Practices

1. **Store Organization**
   - Split stores by feature/domain
   - Use meaningful store names
   - Keep state normalized

2. **Performance**
   - Use selective subscriptions
   - Implement proper cleanup
   - Monitor DevTools performance

3. **Security**
   - Encrypt sensitive data
   - Use appropriate storage
   - Implement proper TTL

4. **Development**
   - Enable DevTools in development
   - Use TypeScript for type safety
   - Follow naming conventions

## Contributing

Contributions are welcome! Please read our [Contributing Guide](./CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.
