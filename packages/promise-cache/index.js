"use strict";
module.exports = function genPromiseCache(handler, { cache = new Map(), cacheKey } = {}) {
    const isCacheFunc = typeof cache === 'function';
    return async function PromiseCache(...args) {
        const key = cacheKey ? cacheKey.apply(this, args) : args[0];
        const realCache = isCacheFunc ? cache.call(this) : cache;
        const promise = Promise.resolve(handler.apply(this, args));
        realCache.set(key, promise);
        return promise.catch(err => {
            realCache.delete(key);
            throw err;
        });
    };
};
//# sourceMappingURL=index.js.map