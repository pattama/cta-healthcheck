'use strict';

const assert = require('chai').assert;
const supertest = require('supertest');
const _ = require('lodash');

const Express = require('cta-expresswrapper');
const expressDependencies = {};
const expressConfig = {
  name: 'express',
  properties: {
    port: 8080,
  },
};
const express = new Express(expressDependencies, expressConfig);

const Lib = require('../../lib');
const config = {
  name: 'healthCheck',
  properties: {},
  singleton: false,
};
const dependencies = {
  express: express,
};
const healthCheck = new Lib(dependencies, config);

describe('tests', () => {
  it('should set default params', () => {
    assert.equal(healthCheck.queue, 'healthcheck');
  });
  it('should set custom params', () => {
    // mock dependencies
    const mockDependencies = _.cloneDeep(dependencies);
    // mock messaging
    mockDependencies.messaging = require('cta-messaging')();
    // mock express on a custom port
    const mockExpressConfig = _.cloneDeep(expressConfig);
    mockExpressConfig.name = 'mockExpress';
    mockExpressConfig.properties.port = 3000;
    mockDependencies.express = new Express(expressDependencies, mockExpressConfig);

    // mock config
    config.properties.queue = 'my_queue';

    const myHealthCheck = new Lib(mockDependencies, config);
    assert.equal(myHealthCheck.queue, 'my_queue');
    assert(myHealthCheck.messaging);
    assert(myHealthCheck.express, mockDependencies.express);
  });
  it('should not send update when missing parameters', () => {
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
    const request = supertest('http://localhost:' + healthCheck.express.port);
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
    const request = supertest('http://localhost:' + healthCheck.express.port);
    request.get('/health')
      .end((err, resp) => {
        if (err) {
          return done(err);
        }
        assert.deepEqual(resp.body, healthCheck.healths);
        done();
      });
  });
  it('should return same instance without port conflict', (done) => {
    try {
      const instances = {};
      // mock express on a custom port
      const mockDependencies = _.cloneDeep(dependencies);
      const mockExpressConfig = _.cloneDeep(expressConfig);
      mockExpressConfig.name = 'mockExpress';
      mockExpressConfig.properties.port = 3100;
      mockDependencies.express = new Express(expressDependencies, mockExpressConfig);

      const mockConfig = _.cloneDeep(config);
      mockConfig.singleton = true;
      mockConfig.properties.queue = 'singleton_queue';
      instances.one = new Lib(mockDependencies, mockConfig);
      setTimeout(() => {
        instances.two = new Lib(mockDependencies, mockConfig);
        setTimeout(() => {
          instances.three = new Lib(mockDependencies, mockConfig);
          done();
        }, 1000);
      }, 1000);
    } catch (e) {
      assert.fail(e, 'should not be here');
    }
  });
});

describe('Healthcheck - constructor', function() {
  context('when missing express dependency', function() {
    const mockDependencies = _.cloneDeep(dependencies);
    before(function() {
      delete mockDependencies.express;
    });
    it('should throw an error', function() {
      return assert.throws(function() {
        return new Lib(mockDependencies, config);
      }, `'express' dependency is missing`);
    });
  });
});
