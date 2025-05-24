declare module 'kosh' {
  // Storage interface
  interface Storage {
    getItem(key: string): string | null;
    setItem(key: string, value: string): void;
    removeItem(key: string): void;
  }

  // DevTools options
  interface DevToolsOptions {
    enabled?: boolean;
    name?: string;
    position?: 'left' | 'right';
    theme?: 'light' | 'dark';
    maxHistory?: number;
    collapsed?: boolean;
    persist?: boolean;
  }

  // Store options
  interface StoreOptions<T = any> {
    actions?: {
      [key: string]: (state: T, payload?: any) => T | void;
    };
    effects?: {
      [key: string]: (context: {
        get: (key?: keyof T) => T | T[keyof T];
        set: (key: keyof T | Partial<T>, value?: any) => void;
        [key: string]: any;
      }, payload?: any) => Promise<void>;
    };
    persistKey?: string;
    storage?: Storage;
    ttl?: number;
    secret?: string;
    devtools?: DevToolsOptions;
  }

  // DevTools instance
  interface DevTools {
    togglePanel(): void;
    destroy(): void;
  }

  // Store instance
  interface Store<T = any> {
    get(key?: keyof T): T | T[keyof T];
    set(key: keyof T | Partial<T>, value?: any): void;
    subscribe(callback: (state: T) => void): () => void;
    clear(): void;
    devTools: DevTools | null;
    [key: string]: any; // For bound actions and effects
  }

  // Main function
  export function createKosh<T = any>(
    initialState?: T,
    options?: StoreOptions<T>
  ): Store<T>;
} 