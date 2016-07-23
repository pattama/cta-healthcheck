'use strict';

const assert = require('assert');
const supertest = require('supertest');
const Lib = require('../../lib');
const lib = new Lib();

describe('server', () => {
  it('should update status', () => {
    const status = {
      status: 'green',
      reason: 'ok',
      services: [],
    };
    lib.update('one', status);
    assert.deepEqual(lib.healths, {one: status});
  });
  it('should provide health as a restapi', (done) => {
    const request = supertest('http://localhost:8080');
    request.get('/')
      .end((err, resp) => {
        if (err) {
          return done(err);
        }
        assert.deepEqual(resp.body, lib.healths);
        done();
      });
  });
});
