'use strict';

const assert = require('chai').assert;
const supertest = require('supertest');
const Lib = require('../../lib');
const config = {
  name: 'healthCheck',
  properties: {},
  singleton: true,
};
const dependencies = {};
const healthCheck = new Lib(dependencies, config);

describe('server', () => {
  it('should set default params', () => {
    assert.equal(healthCheck.port, 8080);
    assert.equal(healthCheck.queue, 'healthcheck');
  });
  it('should set custom params', () => {
    dependencies.messaging = require('cta-messaging')();
    config.properties.port = 3000;
    config.properties.queue = 'my_queue';
    const myHealthCheck = new Lib(dependencies, config);
    // const myHealthCheck = new HealthCheck({port: 3000, queue: 'my_queue'}, {messaging: messaging});
    assert.equal(myHealthCheck.port, 3000);
    assert.equal(myHealthCheck.queue, 'my_queue');
    assert(myHealthCheck.messaging);
  });
  it('should do nothing when missing parameters', () => {
    healthCheck.update('one');
    assert.deepEqual(healthCheck.healths, {
      status: '',
      statuses: {},
    });
  });
  it('should update service one to red status', () => {
    healthCheck.update('one', {
      status: 'red',
      reason: 'service down',
    });
    assert.strictEqual(healthCheck.healths.status, 'red');
    assert.strictEqual(healthCheck.healths.statuses.one.status, 'red');
    assert.strictEqual(healthCheck.healths.statuses.one.current.services.default.status, 'red');
    assert.strictEqual(healthCheck.healths.statuses.one.current.services.default.reason, 'service down');
    assert.deepEqual(healthCheck.healths.statuses.one.previous, {});
  });
  it('should update service one to green status', () => {
    healthCheck.update('one', {
      status: 'green',
    });
    assert.strictEqual(healthCheck.healths.status, 'green');
    assert.strictEqual(healthCheck.healths.statuses.one.status, 'green');
    assert.strictEqual(healthCheck.healths.statuses.one.current.services.default.status, 'green');
    assert.notProperty(healthCheck.healths.statuses.one.current.services.default, 'reason');
    assert.strictEqual(healthCheck.healths.statuses.one.previous.services.default.status, 'red');
    assert.strictEqual(healthCheck.healths.statuses.one.previous.services.default.reason, 'service down');
  });
  it('should update service two/alpha to yellow status', () => {
    healthCheck.update('two', {
      status: 'yellow',
      reason: 'critic point reached',
      serviceName: 'alpha',
    });
    assert.strictEqual(healthCheck.healths.status, 'yellow');
    assert.strictEqual(healthCheck.healths.statuses.one.status, 'green');
    assert.strictEqual(healthCheck.healths.statuses.two.status, 'yellow');
    assert.strictEqual(healthCheck.healths.statuses.two.current.services.alpha.status, 'yellow');
    assert.strictEqual(healthCheck.healths.statuses.two.current.services.alpha.reason, 'critic point reached');
    assert.deepEqual(healthCheck.healths.statuses.two.previous, {});
  });
  it('should update service two/beta to red status', () => {
    healthCheck.update('two', {
      status: 'red',
      reason: 'service down',
      serviceName: 'beta',
    });
    assert.strictEqual(healthCheck.healths.status, 'red');
    assert.strictEqual(healthCheck.healths.statuses.one.status, 'green');
    assert.strictEqual(healthCheck.healths.statuses.two.status, 'red');
    assert.strictEqual(healthCheck.healths.statuses.two.current.services.alpha.status, 'yellow');
    assert.strictEqual(healthCheck.healths.statuses.two.current.services.beta.status, 'red');
    assert.strictEqual(healthCheck.healths.statuses.two.current.services.beta.reason, 'service down');
  });
  it('should update service two/beta to green status', () => {
    healthCheck.update('two', {
      status: 'green',
      serviceName: 'beta',
    });
    assert.strictEqual(healthCheck.healths.status, 'yellow');
    assert.strictEqual(healthCheck.healths.statuses.one.status, 'green');
    assert.strictEqual(healthCheck.healths.statuses.two.status, 'yellow');
  });
  it('should update service two/alpha to green status', () => {
    healthCheck.update('two', {
      status: 'green',
      serviceName: 'alpha',
    });
    assert.strictEqual(healthCheck.healths.status, 'green');
    assert.strictEqual(healthCheck.healths.statuses.one.status, 'green');
    assert.strictEqual(healthCheck.healths.statuses.two.status, 'green');
  });
  it('should provide / restapi', (done) => {
    const request = supertest('http://localhost:' + healthCheck.port);
    request.get('/')
      .end((err, resp) => {
        if (err) {
          return done(err);
        }
        assert.deepEqual(resp.body, {
          status: healthCheck.healths.status,
        });
        done();
      });
  });
  it('should provide /health restapi', (done) => {
    const request = supertest('http://localhost:' + healthCheck.port);
    request.get('/health')
      .end((err, resp) => {
        if (err) {
          return done(err);
        }
        assert.deepEqual(resp.body, healthCheck.healths);
        done();
      });
  });
});
