'use strict';

const HealthCheck = require('../../lib');
const assert = require('chai').assert;
const _ = require('lodash');
const os = require('os');
const path = require('path');
const sinon = require('sinon');
const jsonfile = require('jsonfile');
const shortId = require('shortid');
const request = new (require('cta-tool-request'))();
const co = require('co');
const mockExpress = {
  get: () => {},
  start: () => {},
};

describe('Healthcheck - constructor', function() {
  it('should throw an error when missing express dependency', function() {
    return assert.throws(function() {
      return new HealthCheck({}, { name: 'foo' });
    }, 'express dependency is missing');
  });

  it('should set file to default when not provided', function () {
    const healthCheck = new HealthCheck({ express: mockExpress }, {
      name: 'healthCheck',
      singleton: false,
    });
    assert.strictEqual(healthCheck.properties.file, path.join(os.tmpDir(), 'healthcheck.json'));
  });

  it('should load healthcheck file from disk', function() {
    const fileName = path.join(os.tmpDir(), `${shortId.generate()}.json`);
    const content = { status: 'green', statuses: {} };
    jsonfile.writeFileSync(fileName, content, 'utf8');
    const healthCheck = new HealthCheck({ express: mockExpress }, {
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
    const healthCheck = new HealthCheck({ express: mockExpress }, {
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
    const mockDependencies = { express: mockExpress };
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