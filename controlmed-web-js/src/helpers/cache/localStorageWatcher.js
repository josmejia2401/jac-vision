export default class LocalStorageWatcher {
  constructor({ keys = [], callback, interval = 1000, fireImmediately = false }) {
    this.keys = keys;
    this.watchAll = keys.includes('*');
    this.callback = callback;
    this.interval = interval;
    this.snapshot = this.read();
    this.timer = null;

    this.init();

    if (fireImmediately) {
      console.log('[LocalStorageWatcher] Fire immediately');
      this.callback?.();
    }
  }

  read() {
    if (this.watchAll) {
      return JSON.stringify(localStorage);
    }

    const data = {};
    this.keys.forEach(k => {
      data[k] = localStorage.getItem(k);
    });
    return JSON.stringify(data);
  }

  init() {
    window.addEventListener('storage', this.handleStorage);
    this.timer = setInterval(this.poll, this.interval);
  }

  poll = () => {
    const current = this.read();
    if (current !== this.snapshot) {
      console.log('[LocalStorageWatcher] Change detected');
      this.snapshot = current;
      this.callback?.();
    }
  };

  handleStorage = (event) => {
    if (this.watchAll || this.keys.includes(event.key)) {
      console.log('[LocalStorageWatcher] storage event:', event.key);
      this.callback?.(event);
    }
  };

  destroy() {
    clearInterval(this.timer);
    window.removeEventListener('storage', this.handleStorage);
  }
}
