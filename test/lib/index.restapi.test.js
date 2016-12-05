'use strict';

const HealthCheck = require('../../lib');
const assert = require('chai').assert;
const _ = require('lodash');
const os = require('os');
const path = require('path');
const sinon = require('sinon');
const Express = require('cta-expresswrapper');
const jsonfile = require('jsonfile');
const shortId = require('shortid');
const request = new (require('cta-tool-request'))();
const co = require('co');
const healths = require('./healths.testdata');
const mockExpress = {
  get: () => {},
  start: () => {},
};
const mockMessaging = {
  produce: () => {},
  publish: () => {},
};

describe('HealthCheck - REST Api', function() {
  const express = new Express({}, {
    name: 'express',
    properties: {
      port: 8080,
    },
  });
  it('GET /healthcheck', function(done) {
    co(function * coroutine() {
      const healthCheck = new HealthCheck({ express }, {
        name: 'healthCheck',
        properties: {
          file: path.join(os.tmpDir(), `${shortId.generate()}.json`),
        },
        singleton: false,
      });
      healthCheck.healths = healths;
      const url = 'http://localhost:8080/healthcheck';
      let resp;
      resp = yield request.get(url);
      assert.deepEqual(resp.data, { status: 'red' });
      resp = yield request.get(`${url}?mode=full`);
      assert.deepEqual(resp.data, healths);
      resp = yield request.get(`${url}?mode=current`);
      const current = _.cloneDeep(healths);
      delete current.statuses.foo.previous;
      assert.deepEqual(resp.data, current);
      resp = yield request.get(`${url}?mode=previous`);
      const previous = _.cloneDeep(healths);
      delete previous.statuses.foo.current;
      assert.deepEqual(resp.data, previous);
      done();
    }).catch((err) => {
      done(err);
    });
  });
});

