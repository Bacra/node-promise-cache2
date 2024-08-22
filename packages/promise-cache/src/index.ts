type ThisParameterType<T extends (...args: any[]) => any> =
  T extends (this: infer U, ...args: any[]) => any ? U : unknown;

function getGlobal() {
  return this;
}

type CMap<K,V> = {
  get(key: K): V | undefined,
  set(key: K, val: V): any,
  delete(key: K): any,
};


export function promiseCache<
  Handler extends (...args: any[]) => Promise<any>,
  HandlerRet extends ReturnType<Handler>,
  HandlerArgs extends Parameters<Handler>,
  HanlderThis extends ThisParameterType<Handler>,

  CacheKeyFunc extends (this: HanlderThis, ...args: HandlerArgs) => any,
  CacheMap extends CMap<ReturnType<CacheKeyFunc>, HandlerRet>,
  CacheMapFunc extends (this: HanlderThis, ...args: HandlerArgs) => CacheMap,
>(
  handler: Handler,
  {
    cache,
    cacheKey,
  }: {
    cache?: CacheMap | CacheMapFunc | 'proto',
    cacheKey?: CacheKeyFunc,
  } = {}
): (this: HanlderThis, ...args: HandlerArgs) => HandlerRet {
  let cacheFunc: CacheMapFunc | (() => CacheMap);
  if (cache === 'proto') {
    const protoMap: WeakMap<any, CacheMap> = new WeakMap();
    cacheFunc = function() {
      if (this === getGlobal()) throw new Error('Miss Global By proto cache');

      let map = protoMap.get(this);
      if (!map) {
        map = new Map() as CMap<any, any> as CacheMap;
        protoMap.set(this, map);
      }

      return map;
    };
  } else if (typeof cache === 'function') {
    cacheFunc = cache;
  } else if (!cache) {
    const newMap = new Map() as CMap<any, any> as CacheMap;
    cacheFunc = () => newMap;
  } else {
    cacheFunc = () => cache;
  }

  function promiseCache(...args: HandlerArgs) {
    const key = cacheKey ? cacheKey.apply(this, args) : args[0];
    const realCache: CacheMap = cacheFunc.apply(this, args);

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


// promiseCache(async () => {}, {
//   cache: new Map(),
// });

// const globalMap: CMap<any, any> = new Map();
