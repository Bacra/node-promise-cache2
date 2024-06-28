type ThisParameterType<T extends (...args: any[]) => any> =
  T extends (this: infer U, ...args: any[]) => any ? U : unknown;

export function promiseCache<
  Handler extends (...args: any[]) => Promise<any>,
  HandlerRet extends ReturnType<Handler>,
  HandlerArgs extends Parameters<Handler>,
  HanlderThis extends ThisParameterType<Handler>,

  CacheKeyFunc extends (this: HanlderThis, ...args: HandlerArgs) => any,
  CacheMap extends Map<ReturnType<CacheKeyFunc>, HandlerRet>,
  CacheMapFunc extends (this: HanlderThis, ...args: HandlerArgs) => CacheMap,
>(
  handler: Handler,
  {
    cache = new Map() as CacheMap,
    cacheKey,
  }: {
    cache?: CacheMap | CacheMapFunc,
    cacheKey?: CacheKeyFunc,
  } = {}
): (this: HanlderThis, ...args: HandlerArgs) => HandlerRet {
  const isCacheFunc = typeof cache === 'function';

  function promiseCache(...args: HandlerArgs) {
    const key = cacheKey ? cacheKey.apply(this, args) : args[0];
    const realCache: CacheMap = isCacheFunc ? cache.apply(this, args) : cache;

    let promise = realCache.get(key);

    if (!promise) {
      promise = handler.apply(this, args);
      realCache.set(key, promise);

      promise.catch(() => realCache.delete(key));
    }

    return promise;
  };

  return promiseCache;
}


// const list = {
//   cache: new Map(),
//   handler: null,
// };

// const handler = promiseCache(async function (this: typeof list, key: string): Promise<string> {
//   return key;
// }, {
//   cache: function() { return this.cache }
// });

// const result1 = handler.call(list, '4567');
// list.handler = handler;
// const result2 = list.handler('1234');
