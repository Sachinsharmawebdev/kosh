# Kosh DevTools Documentation

Kosh DevTools is a powerful debugging tool that helps you inspect, monitor, and debug your application's state. This guide covers all features and configurations available in the DevTools.

## Table of Contents
- [Installation](#installation)
- [Basic Usage](#basic-usage)
- [Configuration Options](#configuration-options)
- [Features](#features)
- [Keyboard Shortcuts](#keyboard-shortcuts)
- [Best Practices](#best-practices)
- [Troubleshooting](#troubleshooting)

## Installation

DevTools is included with Kosh by default. No additional installation is required.

```javascript
import { createKosh } from 'kosh';

const store = createKosh(initialState, {
  devtools: {
    enabled: true
  }
});
```

## Basic Usage

### Enabling DevTools

```javascript
const store = createKosh(
  { count: 0 },
  {
    devtools: {
      enabled: true,
      name: 'My Store'
    }
  }
);
```

### Opening DevTools

1. Use keyboard shortcut: `Ctrl + Shift + K`
2. Or programmatically:
```javascript
store.devTools.togglePanel();
```

## Configuration Options

```javascript
const store = createKosh(initialState, {
  devtools: {
    enabled: true,           // Enable/disable DevTools
    name: 'My Store',        // Store name in DevTools
    position: 'right',       // Panel position ('left' or 'right')
    maxHistory: 50,          // Maximum history entries
    logActions: true,        // Log actions and effects
    theme: 'light'           // Theme ('light' or 'dark')
  }
});
```

### Configuration Details

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| enabled | boolean | false | Enable/disable DevTools |
| name | string | 'Kosh Store' | Name displayed in DevTools |
| position | 'left' \| 'right' | 'right' | Panel position |
| maxHistory | number | 50 | Maximum history entries |
| logActions | boolean | true | Log actions and effects |
| theme | 'light' \| 'dark' | 'light' | DevTools theme |

## Features

### 1. State Inspection

The State tab provides a tree view of your application's state:

- Collapsible state nodes
- Search functionality
- Real-time updates
- Value inspection

```javascript
// Example state structure
{
  user: {
    name: 'John',
    settings: {
      theme: 'dark',
      notifications: true
    }
  },
  todos: [
    { id: 1, text: 'Learn Kosh' }
  ]
}
```

### 2. Action Logging

The Actions tab shows a chronological list of all actions and effects:

- Action type
- Payload
- Timestamp
- Filtering options

```javascript
// Example action log entry
{
  type: 'INCREMENT_COUNT',
  payload: { amount: 1 },
  timestamp: '2024-03-14T12:00:00.000Z'
}
```

### 3. State Diff View

The Diff tab shows changes between states:

- Color-coded changes
- Path-based tracking
- Nested object diffs

```javascript
// Example diff
{
  path: 'user.settings.theme',
  oldValue: 'light',
  newValue: 'dark'
}
```

### 4. Time Travel

Navigate through state history:

- Previous/Next buttons
- History position indicator
- State restoration
- Action tracking

### 5. Export/Import

- Export current state as JSON
- Copy state to clipboard
- Import state (coming soon)

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| Ctrl + Shift + K | Toggle DevTools panel |
| Esc | Close DevTools panel |

## Best Practices

1. **Development Only**
   ```javascript
   const store = createKosh(initialState, {
     devtools: {
       enabled: process.env.NODE_ENV === 'development'
     }
   });
   ```

2. **Meaningful Store Names**
   ```javascript
   devtools: {
     name: 'User Profile Store'
   }
   ```

3. **History Management**
   ```javascript
   devtools: {
     maxHistory: 100 // Adjust based on your needs
   }
   ```

4. **Action Naming**
   ```javascript
   // Use descriptive action names
   actions: {
     'USER_PROFILE_UPDATE': (state, payload) => ({
       ...state,
       user: payload
     })
   }
   ```

## Troubleshooting

### Common Issues

1. **DevTools Not Opening**
   - Check if `enabled` is set to `true`
   - Verify keyboard shortcut isn't blocked
   - Check browser console for errors

2. **State Not Updating**
   - Verify store subscription
   - Check action/effect implementation
   - Ensure state updates are immutable

3. **Performance Issues**
   - Reduce `maxHistory` value
   - Disable action logging if not needed
   - Use search filters to narrow state view

### Debugging Tips

1. **State Inspection**
   ```javascript
   // Log state changes
   store.subscribe(state => {
     console.log('State changed:', state);
   });
   ```

2. **Action Debugging**
   ```javascript
   // Add action logging
   actions: {
     increment: (state, payload) => {
       console.log('Increment action:', payload);
       return { ...state, count: state.count + 1 };
     }
   }
   ```

3. **Effect Monitoring**
   ```javascript
   // Track effect execution
   effects: {
     fetchData: async ({ set }) => {
       console.log('Fetching data...');
       const data = await api.getData();
       console.log('Data received:', data);
       set('data', data);
     }
   }
   ```

## Advanced Usage

### Custom Storage

```javascript
const customStorage = {
  getItem: (key) => localStorage.getItem(key),
  setItem: (key, value) => localStorage.setItem(key, value),
  removeItem: (key) => localStorage.removeItem(key)
};

const store = createKosh(initialState, {
  devtools: {
    storage: customStorage
  }
});
```

### State Persistence

```javascript
const store = createKosh(initialState, {
  devtools: {
    persist: true,
    persistKey: 'my-app-state'
  }
});
```

### Custom Themes

```javascript
const store = createKosh(initialState, {
  devtools: {
    theme: 'dark'
  }
});
```

## Contributing

Feel free to contribute to Kosh DevTools by:
1. Reporting bugs
2. Suggesting features
3. Submitting pull requests
4. Improving documentation

## License

Kosh DevTools is part of the Kosh library and is released under the MIT License. 