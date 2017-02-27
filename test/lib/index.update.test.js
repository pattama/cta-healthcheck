'use strict';

const HealthCheck = require('../../lib');
const assert = require('chai').assert;
const _ = require('lodash');
const os = require('os');
const path = require('path');
const sinon = require('sinon');
const shortId = require('shortid');

const mockExpress = {
  get: () => {},
  start: () => {},
};
const mockMessaging = {
  produce: () => {},
  publish: () => {},
};
const mockRequest = {
  post: () => {},
};

describe('Healthcheck - update', function() {
  const healthCheck = new HealthCheck({ express: mockExpress }, {
    name: 'healthCheck',
    properties: {
      file: path.join(os.tmpDir(), `${shortId.generate()}.json`),
    },
    singleton: false,
  });
  it('should not update status when called with invalid parameters', () => {
    const res = healthCheck.update('something');
    assert.property(res, 'error');
    assert.deepEqual(healthCheck.healths, {
      status: '',
      statuses: {},
    });
  });
  it('should update service one to red status', () => {
    healthCheck.update({
      name: 'one',
      status: 'red',
      reason: 'service down',
    });
    const healths = _.cloneDeep(healthCheck.healths);
    delete healths.statuses.one.current.services.default.date;
    assert.deepEqual(healths, {
      status: 'red',
      statuses: {
        one: {
          status: 'red',
          current: {
            services: {
              default: {
                status: 'red',
                reason: 'service down',
              },
            },
          },
          previous: {},
        },
      },
    });
  });
  it('should update service one to green status', () => {
    healthCheck.update({
      name: 'one',
      status: 'green',
      reason: 'service back',
    });
    const healths = _.cloneDeep(healthCheck.healths);
    delete healths.statuses.one.current.services.default.date;
    delete healths.statuses.one.previous.services.default.date;
    assert.deepEqual(healths, {
      status: 'green',
      statuses: {
        one: {
          status: 'green',
          current: {
            services: {
              default: {
                status: 'green',
                reason: 'service back',
              },
            },
          },
          previous: {
            services: {
              default: {
                status: 'red',
                reason: 'service down',
              },
            },
          },
        },
      },
    });
  });
  it('should update service two/alpha to yellow status', () => {
    healthCheck.update({
      name: 'two',
      child: 'alpha',
      status: 'yellow',
      reason: 'critic point reached',
    });
    assert.strictEqual(healthCheck.healths.status, 'yellow');
    assert.strictEqual(healthCheck.healths.statuses.one.status, 'green');
    assert.strictEqual(healthCheck.healths.statuses.two.status, 'yellow');
    assert.strictEqual(healthCheck.healths.statuses.two.current.services.alpha.status, 'yellow');
    assert.strictEqual(healthCheck.healths.statuses.two.current.services.alpha.reason, 'critic point reached');
    assert.deepEqual(healthCheck.healths.statuses.two.previous, {});
  });
  it('should update service two/beta to red status', () => {
    healthCheck.update({
      name: 'two',
      child: 'beta',
      status: 'red',
      reason: 'service down',
    });
    assert.strictEqual(healthCheck.healths.status, 'red');
    assert.strictEqual(healthCheck.healths.statuses.one.status, 'green');
    assert.strictEqual(healthCheck.healths.statuses.two.status, 'red');
    assert.strictEqual(healthCheck.healths.statuses.two.current.services.alpha.status, 'yellow');
    assert.strictEqual(healthCheck.healths.statuses.two.current.services.beta.status, 'red');
    assert.strictEqual(healthCheck.healths.statuses.two.current.services.beta.reason, 'service down');
  });
  it('should update service two/beta to green status', () => {
    healthCheck.update({
      name: 'two',
      child: 'beta',
      status: 'green',
    });
    assert.strictEqual(healthCheck.healths.status, 'yellow');
    assert.strictEqual(healthCheck.healths.statuses.one.status, 'green');
    assert.strictEqual(healthCheck.healths.statuses.two.status, 'yellow');
  });
  it('should update service two/alpha to green status', () => {
    healthCheck.update({
      name: 'two',
      child: 'alpha',
      status: 'green',
    });
    assert.strictEqual(healthCheck.healths.status, 'green');
    assert.strictEqual(healthCheck.healths.statuses.one.status, 'green');
    assert.strictEqual(healthCheck.healths.statuses.two.status, 'green');
  });
});

describe('HealthCheck Messaging', function() {
  const healthCheck = new HealthCheck({
    express: mockExpress,
    messaging: mockMessaging,
    request: mockRequest,
  }, {
    name: 'healthCheck',
    properties: {
      file: path.join(os.tmpDir(), `${shortId.generate()}.json`),
      queue: 'some_queue',
      topic: 'some_topic',
      url: 'some_url',
    },
    singleton: false,
  });
  beforeEach(function() {
    sinon.spy(mockMessaging, 'publish');
    sinon.spy(mockMessaging, 'produce');
    sinon.spy(mockExpress, 'get');
    sinon.spy(mockRequest, 'post');
  });
  afterEach(function() {
    mockMessaging.publish.restore();
    mockMessaging.produce.restore();
    mockExpress.get.restore();
    mockRequest.post.restore();
  });
  it('should call push methods when provided', function () {
    const data = {
      name: 'some app',
      status: 'green',
      child: 'default',
    };
    healthCheck.update(data);
    const contextData = {
      nature: {
        type: 'healthcheck',
        quality: 'update',
      },
      payload: data,
    };
    sinon.assert.calledWith(mockMessaging.produce, { queue: 'some_queue', content: contextData });
    sinon.assert.calledWith(mockMessaging.publish, { topic: 'some_topic', content: contextData });
    sinon.assert.calledWith(mockRequest.post, 'some_url', data);
  });
});