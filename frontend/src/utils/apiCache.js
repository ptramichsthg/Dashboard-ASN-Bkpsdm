const cache = new Map();

export const apiCache = {
  get: (key) => cache.get(key),
  set: (key, value) => {
    cache.set(key, value);
    setTimeout(() => {
      cache.delete(key);
    }, 5 * 60 * 1000);
  },
  has: (key) => cache.has(key),
  clear: () => cache.clear()
};

export default apiCache;
