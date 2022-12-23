export function promiseCache<
  Args extends any[],
  Handler extends (...args: Args) => Promise<any>,
  HandlerRet extends ReturnType<Handler>,
  CacheMap extends Map<any, HandlerRet>,
  CacheMapFunc extends (...args: Args) => CacheMap,
  CacheKeyFunc extends (...args: Args) => any,
>(
  handler: Handler,
  {
    cache = new Map() as CacheMap,
    cacheKey,
  }: {
    cache?: CacheMap | CacheMapFunc,
    cacheKey?: CacheKeyFunc,
  } = {}
): (...args: Args) => HandlerRet {
  const isCacheFunc = typeof cache === 'function';

  return function promiseCache(...args: Args): HandlerRet {
    const key = cacheKey ? cacheKey.apply(this, args) : args[0];
    const realCache: CacheMap = isCacheFunc ? (cache as CacheMapFunc).apply(this, args) : cache;

    let promise = realCache.get(key);

    if (!promise) {
      promise = handler.apply(this, args);
      promise = Promise.resolve(promise) as HandlerRet;
      realCache.set(key, promise);

      return promise.catch(err => {
        realCache.delete(key);
        throw err;
      }) as HandlerRet;
    } else {
      return promise;
    }
  };
}
