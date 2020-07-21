type CacheMap = Map<any, Promise<any>>;
type CacheMapFunc = () => CacheMap;

interface Options {
    cache?: CacheMap | CacheMapFunc,
    cacheKey?: () => any,
}

export = function genPromiseCache2(
    handler: () => Promise<any> | any,
    { cache = new Map(), cacheKey }: Options = {}
): Function {
    const isCacheFunc = typeof cache === 'function';

    return async function(...args): Promise<any> {
        const key = cacheKey ? cacheKey.apply(this, args) : args[0];
        const realCache:CacheMap = isCacheFunc ? (cache as CacheMapFunc).call(this) : cache;

        const promise = Promise.resolve(handler.apply(this, args));
        realCache.set(key, promise);

        return promise.catch(err => {
            realCache.delete(key);
            throw err;
        });
    };
}
