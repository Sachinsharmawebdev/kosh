const DEVTOOLS_ID = 'kosh-devtools';
const DEVTOOLS_STYLE = `
  #${DEVTOOLS_ID} {
    position: fixed;
    bottom: 0;
    right: 0;
    width: 400px;
    height: 600px;
    background: #fff;
    border: 1px solid #ccc;
    border-radius: 4px;
    box-shadow: 0 0 10px rgba(0,0,0,0.1);
    z-index: 9999;
    font-family: monospace;
    display: flex;
    flex-direction: column;
  }
  #${DEVTOOLS_ID} .header {
    padding: 8px;
    background: #f5f5f5;
    border-bottom: 1px solid #ccc;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  #${DEVTOOLS_ID} .tabs {
    display: flex;
    border-bottom: 1px solid #ccc;
  }
  #${DEVTOOLS_ID} .tab {
    padding: 8px 16px;
    cursor: pointer;
    border-right: 1px solid #ccc;
  }
  #${DEVTOOLS_ID} .tab.active {
    background: #f0f0f0;
    border-bottom: 2px solid #007bff;
  }
  #${DEVTOOLS_ID} .content {
    flex: 1;
    overflow: auto;
    padding: 8px;
  }
  #${DEVTOOLS_ID} .state-tree {
    margin: 0;
    padding: 0;
    list-style: none;
  }
  #${DEVTOOLS_ID} .state-item {
    margin: 4px 0;
    padding: 4px;
    border-radius: 2px;
  }
  #${DEVTOOLS_ID} .state-item:hover {
    background: #f0f0f0;
  }
  #${DEVTOOLS_ID} .state-item.expanded > .state-children {
    display: block;
  }
  #${DEVTOOLS_ID} .state-item.collapsed > .state-children {
    display: none;
  }
  #${DEVTOOLS_ID} .state-item .toggle {
    cursor: pointer;
    margin-right: 4px;
  }
  #${DEVTOOLS_ID} .actions {
    padding: 8px;
    border-top: 1px solid #ccc;
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  }
  #${DEVTOOLS_ID} button {
    padding: 4px 8px;
    border: 1px solid #ccc;
    border-radius: 2px;
    background: #fff;
    cursor: pointer;
  }
  #${DEVTOOLS_ID} button:hover {
    background: #f0f0f0;
  }
  #${DEVTOOLS_ID} button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  #${DEVTOOLS_ID} .time-travel {
    display: flex;
    align-items: center;
    gap: 4px;
  }
  #${DEVTOOLS_ID} .time-travel-info {
    font-size: 12px;
    color: #666;
  }
  #${DEVTOOLS_ID} .search-bar {
    padding: 8px;
    border-bottom: 1px solid #ccc;
  }
  #${DEVTOOLS_ID} .search-bar input {
    width: 100%;
    padding: 4px;
    border: 1px solid #ccc;
    border-radius: 2px;
  }
  #${DEVTOOLS_ID} .action-log {
    font-size: 12px;
    padding: 4px;
    border-bottom: 1px solid #eee;
  }
  #${DEVTOOLS_ID} .action-log:hover {
    background: #f0f0f0;
  }
  #${DEVTOOLS_ID} .diff-view {
    font-family: monospace;
    white-space: pre;
  }
  #${DEVTOOLS_ID} .diff-added {
    background: #e6ffe6;
    color: #006600;
  }
  #${DEVTOOLS_ID} .diff-removed {
    background: #ffe6e6;
    color: #cc0000;
  }
  #${DEVTOOLS_ID} .filter-bar {
    padding: 8px;
    border-bottom: 1px solid #ccc;
    display: flex;
    gap: 8px;
  }
  #${DEVTOOLS_ID} .filter-bar select {
    padding: 4px;
    border: 1px solid #ccc;
    border-radius: 2px;
  }
`;

class KoshDevTools {
  constructor(store, options = {}) {
    this.store = store;
    this.options = {
      name: options.name || 'Kosh Store',
      enabled: options.enabled !== false,
      position: options.position || 'right',
      maxHistory: options.maxHistory || 50,
      logActions: options.logActions !== false,
      ...options
    };
    
    this.history = [];
    this.actionLog = [];
    this.currentIndex = -1;
    this.isOpen = false;
    this.activeTab = 'state';
    this.searchTerm = '';
    this.filterType = 'all';
    
    if (this.options.enabled) {
      this.init();
    }
  }

  init() {
    // Add styles
    const style = document.createElement('style');
    style.textContent = DEVTOOLS_STYLE;
    document.head.appendChild(style);

    // Create devtools panel
    this.panel = document.createElement('div');
    this.panel.id = DEVTOOLS_ID;
    this.panel.style.display = 'none';
    this.panel.innerHTML = `
      <div class="header">
        <span>${this.options.name}</span>
        <button onclick="this.parentElement.parentElement.style.display='none'">×</button>
      </div>
      <div class="tabs">
        <div class="tab active" data-tab="state">State</div>
        <div class="tab" data-tab="actions">Actions</div>
        <div class="tab" data-tab="diff">Diff</div>
      </div>
      <div class="search-bar">
        <input type="text" placeholder="Search state..." id="kosh-search">
      </div>
      <div class="filter-bar">
        <select id="kosh-filter">
          <option value="all">All Changes</option>
          <option value="actions">Actions Only</option>
          <option value="effects">Effects Only</option>
        </select>
      </div>
      <div class="content">
        <div class="state-tree"></div>
        <div class="action-log" style="display: none;"></div>
        <div class="diff-view" style="display: none;"></div>
      </div>
      <div class="actions">
        <div class="time-travel">
          <button id="kosh-prev" disabled>←</button>
          <span class="time-travel-info">0/0</span>
          <button id="kosh-next" disabled>→</button>
        </div>
        <button id="kosh-export">Export</button>
        <button id="kosh-clear">Clear</button>
        <button id="kosh-pin">Pin</button>
        <button id="kosh-copy">Copy State</button>
      </div>
    `;

    document.body.appendChild(this.panel);

    // Add event listeners
    this.panel.querySelector('#kosh-prev').addEventListener('click', () => this.timeTravel('prev'));
    this.panel.querySelector('#kosh-next').addEventListener('click', () => this.timeTravel('next'));
    this.panel.querySelector('#kosh-export').addEventListener('click', () => this.exportState());
    this.panel.querySelector('#kosh-clear').addEventListener('click', () => this.clearHistory());
    this.panel.querySelector('#kosh-pin').addEventListener('click', () => this.togglePin());
    this.panel.querySelector('#kosh-copy').addEventListener('click', () => this.copyState());
    this.panel.querySelector('#kosh-search').addEventListener('input', (e) => this.handleSearch(e.target.value));
    this.panel.querySelector('#kosh-filter').addEventListener('change', (e) => this.handleFilter(e.target.value));

    // Tab switching
    this.panel.querySelectorAll('.tab').forEach(tab => {
      tab.addEventListener('click', () => this.switchTab(tab.dataset.tab));
    });

    // Subscribe to store changes
    this.unsubscribe = this.store.subscribe((state) => {
      this.addToHistory(state);
      this.updatePanel(state);
    });

    // Add keyboard shortcut
    document.addEventListener('keydown', (e) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'K') {
        this.togglePanel();
      }
    });

    // Initial state
    this.addToHistory(this.store.get());
    this.updatePanel(this.store.get());
  }

  switchTab(tabName) {
    this.activeTab = tabName;
    this.panel.querySelectorAll('.tab').forEach(tab => {
      tab.classList.toggle('active', tab.dataset.tab === tabName);
    });
    
    const stateTree = this.panel.querySelector('.state-tree');
    const actionLog = this.panel.querySelector('.action-log');
    const diffView = this.panel.querySelector('.diff-view');
    
    stateTree.style.display = tabName === 'state' ? 'block' : 'none';
    actionLog.style.display = tabName === 'actions' ? 'block' : 'none';
    diffView.style.display = tabName === 'diff' ? 'block' : 'none';
    
    if (tabName === 'actions') {
      this.updateActionLog();
    } else if (tabName === 'diff') {
      this.updateDiffView();
    }
  }

  handleSearch(term) {
    this.searchTerm = term.toLowerCase();
    this.updatePanel(this.store.get());
  }

  handleFilter(type) {
    this.filterType = type;
    this.updatePanel(this.store.get());
  }

  addToHistory(state, action = null) {
    // Limit history size
    if (this.history.length >= this.options.maxHistory) {
      this.history.shift();
      this.actionLog.shift();
      this.currentIndex--;
    }

    this.history = this.history.slice(0, this.currentIndex + 1);
    this.history.push(JSON.parse(JSON.stringify(state)));
    
    if (action) {
      this.actionLog.push({
        type: action.type,
        payload: action.payload,
        timestamp: new Date().toISOString()
      });
    }
    
    this.currentIndex = this.history.length - 1;
    this.updateTimeTravelInfo();
  }

  updateTimeTravelInfo() {
    const prevButton = this.panel.querySelector('#kosh-prev');
    const nextButton = this.panel.querySelector('#kosh-next');
    const info = this.panel.querySelector('.time-travel-info');

    prevButton.disabled = this.currentIndex <= 0;
    nextButton.disabled = this.currentIndex >= this.history.length - 1;
    info.textContent = `${this.currentIndex + 1}/${this.history.length}`;
  }

  updatePanel(state) {
    const stateTree = this.panel.querySelector('.state-tree');
    stateTree.innerHTML = this.renderStateTree(state);
  }

  renderStateTree(state, path = '') {
    return Object.entries(state)
      .map(([key, value]) => {
        const currentPath = path ? `${path}.${key}` : key;
        const isObject = value && typeof value === 'object' && !Array.isArray(value);
        const isMatch = this.searchTerm ? 
          currentPath.toLowerCase().includes(this.searchTerm) || 
          JSON.stringify(value).toLowerCase().includes(this.searchTerm) : 
          true;

        if (!isMatch) return '';

        if (isObject) {
          return `
            <div class="state-item collapsed">
              <span class="toggle">▶</span>
              <strong>${key}:</strong>
              <div class="state-children">
                ${this.renderStateTree(value, currentPath)}
              </div>
            </div>
          `;
        }
        return `
          <div class="state-item">
            <strong>${key}:</strong> ${JSON.stringify(value)}
          </div>
        `;
      })
      .join('');
  }

  updateActionLog() {
    const actionLog = this.panel.querySelector('.action-log');
    actionLog.innerHTML = this.actionLog
      .filter(log => this.filterType === 'all' || 
        (this.filterType === 'actions' && !log.type.startsWith('effect_')) ||
        (this.filterType === 'effects' && log.type.startsWith('effect_')))
      .map(log => `
        <div class="action-log">
          <strong>${log.type}</strong>
          <div>Payload: ${JSON.stringify(log.payload)}</div>
          <div>Time: ${new Date(log.timestamp).toLocaleTimeString()}</div>
        </div>
      `)
      .join('');
  }

  updateDiffView() {
    if (this.currentIndex <= 0) return;
    
    const currentState = this.history[this.currentIndex];
    const previousState = this.history[this.currentIndex - 1];
    const diff = this.computeDiff(previousState, currentState);
    
    const diffView = this.panel.querySelector('.diff-view');
    diffView.innerHTML = this.renderDiff(diff);
  }

  computeDiff(prev, curr, path = '') {
    const diff = [];
    
    for (const key in curr) {
      const currentPath = path ? `${path}.${key}` : key;
      if (JSON.stringify(prev[key]) !== JSON.stringify(curr[key])) {
        if (typeof curr[key] === 'object' && curr[key] !== null) {
          diff.push(...this.computeDiff(prev[key] || {}, curr[key], currentPath));
        } else {
          diff.push({
            path: currentPath,
            oldValue: prev[key],
            newValue: curr[key]
          });
        }
      }
    }
    
    return diff;
  }

  renderDiff(diff) {
    return diff.map(({ path, oldValue, newValue }) => `
      <div class="diff-item">
        <div class="diff-path">${path}</div>
        <div class="diff-removed">- ${JSON.stringify(oldValue)}</div>
        <div class="diff-added">+ ${JSON.stringify(newValue)}</div>
      </div>
    `).join('');
  }

  timeTravel(direction) {
    if (direction === 'prev' && this.currentIndex > 0) {
      this.currentIndex--;
    } else if (direction === 'next' && this.currentIndex < this.history.length - 1) {
      this.currentIndex++;
    }
    
    const state = this.history[this.currentIndex];
    this.store.set(state);
    this.updatePanel(state);
    this.updateTimeTravelInfo();
    this.updateDiffView();
  }

  exportState() {
    try {
      const state = this.store.get();
      const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${this.options.name}-state-${new Date().toISOString()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export state:', error);
    }
  }

  copyState() {
    try {
      const state = this.store.get();
      navigator.clipboard.writeText(JSON.stringify(state, null, 2));
    } catch (error) {
      console.error('Failed to copy state:', error);
    }
  }

  togglePin() {
    this.panel.style.position = this.panel.style.position === 'fixed' ? 'absolute' : 'fixed';
  }

  clearHistory() {
    this.history = [this.store.get()];
    this.actionLog = [];
    this.currentIndex = 0;
    this.updatePanel(this.store.get());
    this.updateTimeTravelInfo();
    this.updateActionLog();
    this.updateDiffView();
  }

  togglePanel() {
    this.isOpen = !this.isOpen;
    this.panel.style.display = this.isOpen ? 'flex' : 'none';
  }

  destroy() {
    if (this.unsubscribe) {
      this.unsubscribe();
    }
    if (this.panel && this.panel.parentNode) {
      this.panel.parentNode.removeChild(this.panel);
    }
  }
}

export function createDevTools(store, options) {
  return new KoshDevTools(store, options);
} 