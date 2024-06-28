const { promiseCache } = require('../');
const expect = require('expect.js');

describe('#base', () => {
  it('#handler', async () => {
    const map = new Map();
    const handler = promiseCache(() => {
      return new Promise(resolve => setTimeout(() => resolve('res'), 10));
    }, {
      cache: map,
      cacheKey(key) {
        expect(key).to.be('123');
        return key;
      }
    });

    expect(await handler('123')).to.be('res');
    expect(map.get('123')).to.an(Promise);
  });

  it('#proto', async() => {
    const obj = {
      cache: new Map(),
      handler: promiseCache(() => {
        return new Promise(resolve => setTimeout(() => resolve('res'), 10));
      }, {
        cache() {
          return this.cache;
        },
        cacheKey(key) {
          expect(key).to.be('123');
          return key;
        }
      }),
    };

    expect(await obj.handler('123')).to.be('res');
    expect(obj.cache.get('123')).to.an(Promise);
  });

  it('#runtimes', async() => {
    let runTimes = 0;
    const handler = promiseCache(async () => {
      return ++runTimes;
    });

    expect(await handler('123')).to.be(1);
    expect(await handler('123')).to.be(1);
    expect(await handler('1234')).to.be(2);
    expect(await handler('1234')).to.be(2);
  });
});
