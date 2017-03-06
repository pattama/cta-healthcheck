'use strict';

const HealthCheck = require('../../lib');
const assert = require('chai').assert;
const os = require('os');
const path = require('path');
const jsonfile = require('jsonfile');
const shortId = require('shortid');
const mockExpress = {
  get: () => {},
  start: () => {},
};
const mockCement = {
  configuration: { name: 'test' },
};
describe('Healthcheck - constructor', function() {
  it('should throw an error when missing express dependency', function() {
    return assert.throws(function() {
      return new HealthCheck({
        cement: mockCement,
      }, { name: 'foo' });
    }, 'express dependency is missing');
  });

  it('should throw an error when missing app name', function () {
    return assert.throws(function() {
      return new HealthCheck({
        cement: {},
        express: mockExpress,
      }, { name: 'foo' });
    }, 'Application name is missing in the full configuration');
  });

  it('should set file to default when not provided', function () {
    const healthCheck = new HealthCheck({
      cement: mockCement,
      express: mockExpress,
    }, {
      name: 'healthCheck',
      singleton: false,
    });
    assert.strictEqual(healthCheck.properties.file, path.join(os.tmpDir(), 'healthcheck-test.json'));
  });

  it('should load healthcheck file from disk', function() {
    const fileName = path.join(os.tmpDir(), `${shortId.generate()}.json`);
    const content = { status: 'green', statuses: {} };
    jsonfile.writeFileSync(fileName, content, 'utf8');
    const healthCheck = new HealthCheck({
      cement: mockCement,
      express: mockExpress,
    }, {
      name: 'healthCheck',
      properties: {
        file: fileName,
      },
      singleton: false,
    });
    assert.deepEqual(healthCheck.healths, content);
  });

  it('should have empty healthcheck when file is empty', function() {
    const fileName = path.join(os.tmpDir(), `${shortId.generate()}.json`);
    const healthCheck = new HealthCheck({
      cement: mockCement,
      express: mockExpress,
    }, {
      name: 'healthCheck',
      properties: {
        file: fileName,
      },
      singleton: false,
    });
    assert.deepEqual(healthCheck.healths, {
      status: '',
      statuses: {},
    });
  });

  it('should return same instance when singleton is set', function() {
    const mockDependencies = {
      cement: mockCement,
      express: mockExpress,
    };
    const mockConfig = {
      name: 'healthCheck',
      properties: {},
      singleton: true,
    };
    const one = new HealthCheck(mockDependencies, mockConfig);
    one.temp = Date.now();
    const two = new HealthCheck(mockDependencies, mockConfig);
    assert.property(two, 'temp');
    assert.strictEqual(one.temp, two.temp);
  });
});