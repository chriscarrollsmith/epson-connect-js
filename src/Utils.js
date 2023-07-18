// Utils.js

function extractKeyValuePairs(obj, keysToExtract) {
  const result = [];
  const seenObjects = new WeakSet();

  function extractPairsRecursive(obj, path = '') {
    // Avoid circular references
    if (seenObjects.has(obj)) return;
    seenObjects.add(obj);

    Object.entries(obj).forEach(([key, value]) => {
      const currentPath = path ? `${path}.${key}` : key;

      if (keysToExtract.includes(currentPath)) {
        result.push({ key: currentPath, value });
      }

      if (typeof value === 'object' && value !== null) {
        extractPairsRecursive(value, currentPath);
      }
    });
  }

  extractPairsRecursive(obj);

  return result;
}

module.exports = {
  extractKeyValuePairs
};
