type ThisParameterType<T extends (...args: any[]) => any> =
  T extends (this: infer U, ...args: any[]) => any ? U : unknown;

export function promiseCache<
  Args extends any[],
  Handler extends (...args: Args) => Promise<any>,
  HandlerRet extends ReturnType<Handler>,
  CacheMap extends Map<any, HandlerRet | Promise<Awaited<HandlerRet>>>,
  CacheMapFunc extends (this: ThisParameterType<Handler>, ...args: Args) => CacheMap,
  CacheKeyFunc extends (this: ThisParameterType<Handler>, ...args: Args) => any,
>(
  handler: Handler,
  {
    cache = new Map() as CacheMap,
    cacheKey,
  }: {
    cache?: CacheMap | CacheMapFunc,
    cacheKey?: CacheKeyFunc,
  } = {}
): (this: ThisParameterType<Handler>, ...args: Args) => HandlerRet | Promise<Awaited<HandlerRet>> {
  const isCacheFunc = typeof cache === 'function';

  function promiseCache(...args: Args) {
    const key = cacheKey ? cacheKey.apply(this, args) : args[0];
    const realCache: CacheMap = isCacheFunc ? cache.apply(this, args) : cache;

    let promise = realCache.get(key);

    if (!promise) {
      promise = Promise.resolve(handler.apply(this, args));
      realCache.set(key, promise);

      return promise.catch(err => {
        realCache.delete(key);
        throw err;
      });
    } else {
      return promise;
    }
  };

  return promiseCache;
  // return promiseCache as NewHandler;
}


// const list = {
//   cache: new Map(),
//   handler: null,
// };

// list.handler = promiseCache(async function (this: typeof list, key: string) {
//   return key;
// }, {
//   cache: function() { return this.cache }
// });

// list.handler('1234');
