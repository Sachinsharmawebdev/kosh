# Kosh TypeScript Support

Kosh provides full TypeScript support with type definitions for all features. This guide will help you use Kosh effectively in TypeScript projects.

## Installation

```bash
npm install kosh
```

## Basic Usage with TypeScript

```typescript
import { createKosh } from 'kosh';

// Define your state interface
interface AppState {
  count: number;
  user: {
    name: string;
    age: number;
  };
  loading: boolean;
}

// Create store with type safety
const store = createKosh<AppState>({
  count: 0,
  user: {
    name: 'John',
    age: 30
  },
  loading: false
});

// Type-safe state access
const count = store.get('count'); // number
const user = store.get('user'); // { name: string; age: number }
const fullState = store.get(); // AppState

// Type-safe state updates
store.set('count', 5);
store.set({
  count: 10,
  user: {
    name: 'Alice',
    age: 28
  }
});
```

## Actions with TypeScript

```typescript
interface AppState {
  count: number;
  user: {
    name: string;
    age: number;
  };
}

const store = createKosh<AppState>(
  {
    count: 0,
    user: {
      name: 'John',
      age: 30
    }
  },
  {
    actions: {
      increment: (state) => ({
        ...state,
        count: state.count + 1
      }),
      updateUser: (state, user: AppState['user']) => ({
        ...state,
        user
      })
    }
  }
);

// Type-safe action calls
store.increment();
store.updateUser({
  name: 'Alice',
  age: 28
});
```

## Effects with TypeScript

```typescript
interface AppState {
  data: string | null;
  loading: boolean;
}

const store = createKosh<AppState>(
  {
    data: null,
    loading: false
  },
  {
    effects: {
      fetchData: async ({ set }) => {
        set('loading', true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        set({
          data: 'Fetched data',
          loading: false
        });
      }
    }
  }
);

// Type-safe effect calls
store.fetchData();
```

## Framework Integration

### React

```typescript
import React, { useEffect, useState } from 'react';
import { createKosh } from 'kosh';

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

interface CounterProps {
  store: ReturnType<typeof createKosh<AppState>>;
}

const Counter: React.FC<CounterProps> = ({ store }) => {
  const [state, setState] = useState<AppState>(store.get());

  useEffect(() => {
    return store.subscribe(setState);
  }, [store]);

  return (
    <div>
      <p>Count: {state.count}</p>
      <button onClick={() => store.increment()}>Increment</button>
    </div>
  );
};
```

### Vue

```typescript
import { defineComponent, ref, onMounted, onUnmounted } from 'vue';
import { createKosh } from 'kosh';

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

export default defineComponent({
  props: {
    store: {
      type: Object as () => ReturnType<typeof createKosh<AppState>>,
      required: true
    }
  },
  setup(props) {
    const state = ref<AppState>(props.store.get());
    let unsubscribe: (() => void) | undefined;

    onMounted(() => {
      unsubscribe = props.store.subscribe((newState) => {
        state.value = newState;
      });
    });

    onUnmounted(() => {
      if (unsubscribe) {
        unsubscribe();
      }
    });

    return {
      state,
      increment: () => props.store.increment()
    };
  }
});
```

### Angular

```typescript
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { createKosh } from 'kosh';

interface AppState {
  count: number;
  user: {
    name: string;
    age: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class StoreService {
  private store = createKosh<AppState>({
    count: 0,
    user: {
      name: 'John',
      age: 30
    }
  });

  private stateSubject = new BehaviorSubject<AppState>(this.store.get());

  constructor() {
    this.store.subscribe((state) => {
      this.stateSubject.next(state);
    });
  }

  getState(): Observable<AppState> {
    return this.stateSubject.asObservable();
  }

  increment(): void {
    this.store.increment();
  }
}
```

## DevTools with TypeScript

```typescript
interface AppState {
  count: number;
  user: {
    name: string;
    age: number;
  };
}

const store = createKosh<AppState>(
  {
    count: 0,
    user: {
      name: 'John',
      age: 30
    }
  },
  {
    devtools: {
      enabled: process.env.NODE_ENV === 'development',
      name: 'My App Store',
      theme: 'light',
      maxHistory: 50
    }
  }
);

// Type-safe DevTools access
if (store.devTools) {
  store.devTools.togglePanel();
}
```

## Type Definitions

The TypeScript definitions include:

- `Storage` interface for custom storage implementations
- `DevToolsOptions` interface for DevTools configuration
- `StoreOptions<T>` interface for store configuration
- `DevTools` interface for DevTools instance
- `Store<T>` interface for store instance

## Best Practices

1. **Define State Interface**
   ```typescript
   interface AppState {
     count: number;
     user: {
       name: string;
       age: number;
     };
   }
   ```

2. **Use Generic Type Parameter**
   ```typescript
   const store = createKosh<AppState>(initialState);
   ```

3. **Type Actions and Effects**
   ```typescript
   const store = createKosh<AppState>(initialState, {
     actions: {
       increment: (state: AppState) => ({
         ...state,
         count: state.count + 1
       })
     }
   });
   ```

4. **Type-Safe State Access**
   ```typescript
   const count = store.get('count'); // number
   const user = store.get('user'); // { name: string; age: number }
   ```

5. **Type-Safe State Updates**
   ```typescript
   store.set('count', 5);
   store.set({
     count: 10,
     user: {
       name: 'Alice',
       age: 28
     }
   });
   ```

## Common Type Errors and Solutions

1. **Property does not exist on type**
   ```typescript
   // Error
   store.set('unknown', 5);

   // Solution
   store.set('count', 5); // Use valid state key
   ```

2. **Type mismatch in state update**
   ```typescript
   // Error
   store.set('count', '5');

   // Solution
   store.set('count', 5); // Use correct type
   ```

3. **Missing required properties**
   ```typescript
   // Error
   store.set({
     count: 5
   });

   // Solution
   store.set({
     count: 5,
     user: {
       name: 'John',
       age: 30
     }
   });
   ``` 