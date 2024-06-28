const { promiseCache } = require('../');
const expect = require('expect.js');

describe('#base', () => {
  describe('#cache type', () => {
    it('#map', async () => {
      const map = new Map();
      const handler = promiseCache(() => {
        return new Promise(resolve => setTimeout(() => resolve(Math.random()), 10));
      }, {
        cache: map,
        cacheKey(key) {
          expect(key).to.be('123');
          return key;
        }
      });

      expect(await handler('123')).to.be(await handler('123'));
      expect(await map.get('123')).to.be(await handler('123'));
    });

    it('#handler', async() => {
      const obj = {
        cache: new Map(),
        handler: promiseCache(() => {
          return new Promise(resolve => setTimeout(() => resolve(Math.random()), 10));
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

      expect(await obj.handler('123')).to.be(await obj.handler('123'));
      expect(await obj.cache.get('123')).to.be(await obj.handler('123'));
    });

    it('#undefined', async() => {
      const obj = {
        handler: promiseCache(() => {
          return new Promise(resolve => setTimeout(() => resolve(Math.random()), 10));
        }, {
          cache: 'proto',
          cacheKey(key) {
            expect(key).to.be('123');
            return key;
          }
        }),
      };

      expect(await obj.handler('123')).to.be(await obj.handler('123'));
    });

    it('#proto', async() => {
      const handler = promiseCache(() => {
        return new Promise(resolve => setTimeout(() => resolve(Math.random()), 10));
      }, {
        cache: 'proto',
        cacheKey(key) {
          expect(key).to.be('123');
          return key;
        }
      });

      const obj1 = { handler };
      const ret1 = await obj1.handler('123');
      expect(await obj1.handler('123')).to.be(ret1);

      const obj2 = { handler };
      const ret2 = await obj2.handler('123');
      expect(ret2).to.not.be(ret1);
      expect(await obj2.handler('123')).to.be(ret2);
    });
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
