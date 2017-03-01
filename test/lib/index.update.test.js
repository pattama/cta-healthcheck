'use strict';

const HealthCheck = require('../../lib');
const assert = require('chai').assert;
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
const mockCement = {
  configuration: { name: 'foo' },
};

describe('Healthcheck - update', function() {
  const healthCheck = new HealthCheck({
    cement: mockCement,
    express: mockExpress
  }, {
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

  it('1. should update foo/one to yellow status', () => {
    healthCheck.update({
      service: 'one',
      status: 'yellow',
      reason: 'warning',
    });
    assert.strictEqual(healthCheck.healths.status, 'yellow');
    assert.strictEqual(healthCheck.healths.statuses.foo.current.status, 'yellow');
    assert.strictEqual(healthCheck.healths.statuses.foo.current.services.one.status, 'yellow');
    assert.strictEqual(healthCheck.healths.statuses.foo.current.services.one.reason, 'warning');
  });

  it('2. should update foo/one to red status', () => {
    healthCheck.update({
      service: 'one',
      status: 'red',
      reason: 'service down',
    });
    assert.strictEqual(healthCheck.healths.status, 'red');
    assert.strictEqual(healthCheck.healths.statuses.foo.current.status, 'red');
    assert.strictEqual(healthCheck.healths.statuses.foo.current.services.one.status, 'red');
    assert.strictEqual(healthCheck.healths.statuses.foo.current.services.one.reason, 'service down');
    assert.strictEqual(healthCheck.healths.statuses.foo.previous.services.one.status, 'yellow');
    assert.strictEqual(healthCheck.healths.statuses.foo.previous.services.one.reason, 'warning');
  });

  it('3. should update foo/one to green status', () => {
    healthCheck.update({
      service: 'one',
      status: 'green',
      reason: 'back to normal',
    });
    assert.strictEqual(healthCheck.healths.status, 'green');
    assert.strictEqual(healthCheck.healths.statuses.foo.current.status, 'green');
    assert.strictEqual(healthCheck.healths.statuses.foo.current.services.one.status, 'green');
    assert.strictEqual(healthCheck.healths.statuses.foo.current.services.one.reason, 'back to normal');
    assert.strictEqual(healthCheck.healths.statuses.foo.previous.services.one.status, 'red');
    assert.strictEqual(healthCheck.healths.statuses.foo.previous.services.one.reason, 'service down');
  });

  it('4. should update foo/two to yellow status', () => {
    healthCheck.update({
      service: 'two',
      status: 'yellow',
      reason: 'warning',
    });
    assert.strictEqual(healthCheck.healths.status, 'yellow');
    assert.strictEqual(healthCheck.healths.statuses.foo.current.status, 'yellow');
    assert.strictEqual(healthCheck.healths.statuses.foo.current.services.two.status, 'yellow');
    assert.strictEqual(healthCheck.healths.statuses.foo.current.services.two.reason, 'warning');

    assert.strictEqual(healthCheck.healths.statuses.foo.current.services.one.status, 'green');
    assert.strictEqual(healthCheck.healths.statuses.foo.current.services.one.reason, 'back to normal');
    assert.strictEqual(healthCheck.healths.statuses.foo.previous.services.one.status, 'red');
    assert.strictEqual(healthCheck.healths.statuses.foo.previous.services.one.reason, 'service down');
  });

  it('5. should update foo/two to red status', () => {
    healthCheck.update({
      service: 'two',
      status: 'red',
      reason: 'service down',
    });
    assert.strictEqual(healthCheck.healths.status, 'red');
    assert.strictEqual(healthCheck.healths.statuses.foo.current.status, 'red');
    assert.strictEqual(healthCheck.healths.statuses.foo.current.services.two.status, 'red');
    assert.strictEqual(healthCheck.healths.statuses.foo.current.services.two.reason, 'service down');
    assert.strictEqual(healthCheck.healths.statuses.foo.previous.services.two.status, 'yellow');
    assert.strictEqual(healthCheck.healths.statuses.foo.previous.services.two.reason, 'warning');

    assert.strictEqual(healthCheck.healths.statuses.foo.current.services.one.status, 'green');
    assert.strictEqual(healthCheck.healths.statuses.foo.current.services.one.reason, 'back to normal');
    assert.strictEqual(healthCheck.healths.statuses.foo.previous.services.one.status, 'red');
    assert.strictEqual(healthCheck.healths.statuses.foo.previous.services.one.reason, 'service down');
  });

  it('6. should update foo/two to green status', () => {
    healthCheck.update({
      service: 'two',
      status: 'green',
      reason: 'back to normal',
    });
    assert.strictEqual(healthCheck.healths.status, 'green');
    assert.strictEqual(healthCheck.healths.statuses.foo.current.status, 'green');
    assert.strictEqual(healthCheck.healths.statuses.foo.current.services.two.status, 'green');
    assert.strictEqual(healthCheck.healths.statuses.foo.current.services.two.reason, 'back to normal');
    assert.strictEqual(healthCheck.healths.statuses.foo.previous.services.two.status, 'red');
    assert.strictEqual(healthCheck.healths.statuses.foo.previous.services.two.reason, 'service down');

    assert.strictEqual(healthCheck.healths.statuses.foo.current.services.one.status, 'green');
    assert.strictEqual(healthCheck.healths.statuses.foo.current.services.one.reason, 'back to normal');
    assert.strictEqual(healthCheck.healths.statuses.foo.previous.services.one.status, 'red');
    assert.strictEqual(healthCheck.healths.statuses.foo.previous.services.one.reason, 'service down');
  });

  it('7. should update bar/one to yellow status', () => {
    healthCheck.update({
      name: 'bar',
      service: 'one',
      status: 'yellow',
      reason: 'warning',
    });
    assert.strictEqual(healthCheck.healths.status, 'yellow');
    assert.strictEqual(healthCheck.healths.statuses.bar.current.status, 'yellow');
    assert.strictEqual(healthCheck.healths.statuses.bar.current.services.one.status, 'yellow');
    assert.strictEqual(healthCheck.healths.statuses.bar.current.services.one.reason, 'warning');

    assert.strictEqual(healthCheck.healths.statuses.foo.current.status, 'green');
    assert.strictEqual(healthCheck.healths.statuses.foo.current.services.one.status, 'green');
    assert.strictEqual(healthCheck.healths.statuses.foo.current.services.one.reason, 'back to normal');
    assert.strictEqual(healthCheck.healths.statuses.foo.current.services.two.status, 'green');
    assert.strictEqual(healthCheck.healths.statuses.foo.current.services.two.reason, 'back to normal');
    assert.strictEqual(healthCheck.healths.statuses.foo.previous.services.one.status, 'red');
    assert.strictEqual(healthCheck.healths.statuses.foo.previous.services.one.reason, 'service down');
    assert.strictEqual(healthCheck.healths.statuses.foo.previous.services.two.status, 'red');
    assert.strictEqual(healthCheck.healths.statuses.foo.previous.services.two.reason, 'service down');
  });

  it('8. should update bar/one to red status', () => {
    healthCheck.update({
      name: 'bar',
      service: 'one',
      status: 'red',
      reason: 'service down',
    });
    assert.strictEqual(healthCheck.healths.status, 'red');
    assert.strictEqual(healthCheck.healths.statuses.bar.current.status, 'red');
    assert.strictEqual(healthCheck.healths.statuses.bar.current.services.one.status, 'red');
    assert.strictEqual(healthCheck.healths.statuses.bar.current.services.one.reason, 'service down');
    assert.strictEqual(healthCheck.healths.statuses.bar.previous.services.one.status, 'yellow');
    assert.strictEqual(healthCheck.healths.statuses.bar.previous.services.one.reason, 'warning');

    assert.strictEqual(healthCheck.healths.statuses.foo.current.status, 'green');
    assert.strictEqual(healthCheck.healths.statuses.foo.current.services.one.status, 'green');
    assert.strictEqual(healthCheck.healths.statuses.foo.current.services.one.reason, 'back to normal');
    assert.strictEqual(healthCheck.healths.statuses.foo.current.services.two.status, 'green');
    assert.strictEqual(healthCheck.healths.statuses.foo.current.services.two.reason, 'back to normal');
    assert.strictEqual(healthCheck.healths.statuses.foo.previous.services.one.status, 'red');
    assert.strictEqual(healthCheck.healths.statuses.foo.previous.services.one.reason, 'service down');
    assert.strictEqual(healthCheck.healths.statuses.foo.previous.services.two.status, 'red');
    assert.strictEqual(healthCheck.healths.statuses.foo.previous.services.two.reason, 'service down');
  });

  it('9. should update bar/one to green status', () => {
    healthCheck.update({
      name: 'bar',
      service: 'one',
      status: 'green',
      reason: 'back to normal',
    });
    assert.strictEqual(healthCheck.healths.status, 'green');
    assert.strictEqual(healthCheck.healths.statuses.bar.current.status, 'green');
    assert.strictEqual(healthCheck.healths.statuses.bar.current.services.one.status, 'green');
    assert.strictEqual(healthCheck.healths.statuses.bar.current.services.one.reason, 'back to normal');
    assert.strictEqual(healthCheck.healths.statuses.bar.previous.services.one.status, 'red');
    assert.strictEqual(healthCheck.healths.statuses.bar.previous.services.one.reason, 'service down');

    assert.strictEqual(healthCheck.healths.statuses.foo.current.status, 'green');
    assert.strictEqual(healthCheck.healths.statuses.foo.current.services.one.status, 'green');
    assert.strictEqual(healthCheck.healths.statuses.foo.current.services.one.reason, 'back to normal');
    assert.strictEqual(healthCheck.healths.statuses.foo.current.services.two.status, 'green');
    assert.strictEqual(healthCheck.healths.statuses.foo.current.services.two.reason, 'back to normal');
    assert.strictEqual(healthCheck.healths.statuses.foo.previous.services.one.status, 'red');
    assert.strictEqual(healthCheck.healths.statuses.foo.previous.services.one.reason, 'service down');
    assert.strictEqual(healthCheck.healths.statuses.foo.previous.services.two.status, 'red');
    assert.strictEqual(healthCheck.healths.statuses.foo.previous.services.two.reason, 'service down');
  });
});

describe('HealthCheck Messaging', function() {
  const healthCheck = new HealthCheck({
    cement: mockCement,
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
      service: 'default',
      status: 'green',
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