'use strict';

const assert = require('chai').assert;
const supertest = require('supertest');
const Lib = require('../../lib');
const lib = new Lib();

describe('server', () => {
  it('should update service one to red status', () => {
    lib.update('one', {
      status: 'red',
      reason: 'service down',
    });
    assert.strictEqual(lib.healths.status, 'red');
    assert.strictEqual(lib.healths.statuses.one.status, 'red');
    assert.strictEqual(lib.healths.statuses.one.current.services.default.status, 'red');
    assert.strictEqual(lib.healths.statuses.one.current.services.default.reason, 'service down');
    assert.deepEqual(lib.healths.statuses.one.previous, {});
  });
  it('should update service one to green status', () => {
    lib.update('one', {
      status: 'green',
    });
    assert.strictEqual(lib.healths.status, 'green');
    assert.strictEqual(lib.healths.statuses.one.status, 'green');
    assert.strictEqual(lib.healths.statuses.one.current.services.default.status, 'green');
    assert.notProperty(lib.healths.statuses.one.current.services.default, 'reason');
    assert.strictEqual(lib.healths.statuses.one.previous.services.default.status, 'red');
    assert.strictEqual(lib.healths.statuses.one.previous.services.default.reason, 'service down');
  });
  it('should update service two/alpha to yellow status', () => {
    lib.update('two', {
      status: 'yellow',
      reason: 'critic point reached',
      serviceName: 'alpha',
    });
    assert.strictEqual(lib.healths.status, 'yellow');
    assert.strictEqual(lib.healths.statuses.one.status, 'green');
    assert.strictEqual(lib.healths.statuses.two.status, 'yellow');
    assert.strictEqual(lib.healths.statuses.two.current.services.alpha.status, 'yellow');
    assert.strictEqual(lib.healths.statuses.two.current.services.alpha.reason, 'critic point reached');
    assert.deepEqual(lib.healths.statuses.two.previous, {});
  });
  it('should update service two/beta to red status', () => {
    lib.update('two', {
      status: 'red',
      reason: 'service down',
      serviceName: 'beta',
    });
    assert.strictEqual(lib.healths.status, 'red');
    assert.strictEqual(lib.healths.statuses.one.status, 'green');
    assert.strictEqual(lib.healths.statuses.two.status, 'red');
    assert.strictEqual(lib.healths.statuses.two.current.services.alpha.status, 'yellow');
    assert.strictEqual(lib.healths.statuses.two.current.services.beta.status, 'red');
    assert.strictEqual(lib.healths.statuses.two.current.services.beta.reason, 'service down');
  });
  it('should update service two/beta to green status', () => {
    lib.update('two', {
      status: 'green',
      serviceName: 'beta',
    });
    assert.strictEqual(lib.healths.status, 'yellow');
    assert.strictEqual(lib.healths.statuses.one.status, 'green');
    assert.strictEqual(lib.healths.statuses.two.status, 'yellow');
  });
  it('should update service two/alpha to green status', () => {
    lib.update('two', {
      status: 'green',
      serviceName: 'alpha',
    });
    assert.strictEqual(lib.healths.status, 'green');
    assert.strictEqual(lib.healths.statuses.one.status, 'green');
    assert.strictEqual(lib.healths.statuses.two.status, 'green');
  });
  it('should provide health as a restapi', (done) => {
    const request = supertest('http://localhost:' + lib.port);
    request.get('/')
      .end((err, resp) => {
        if (err) {
          return done(err);
        }
        assert.deepEqual(resp.body, {
          status: lib.healths.status,
        });
        done();
      });
  });
});
