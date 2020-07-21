declare type CacheMap = Map<any, Promise<any>>;
declare type CacheMapFunc = () => CacheMap;
interface Options {
    cache?: CacheMap | CacheMapFunc;
    cacheKey?: () => any;
}
declare const _default: (handler: () => Promise<any> | any, { cache, cacheKey }?: Options) => Function;
export = _default;
