'use strict';

const assert = require('chai').assert;
const Lib = require('../../lib');
const instances = {};
const config = {
  name: 'healthCheck',
  properties: {},
  singleton: true,
};
const dependencies = {};

describe('singleton', () => {
  it('should return same instance', () => {
    instances.one = new Lib(dependencies, config);
    instances.one.foo = 'bar';
    instances.two = new Lib(dependencies, config);
    assert.equal(instances.two.foo, 'bar');
  });
  it('should return different instance', () => {
    config.singleton = false;
    instances.ten = new Lib(dependencies, config);
    assert.notProperty(instances.ten, 'foo');
    instances.ten.bar = 'foo';
    instances.eleven = new Lib(dependencies, config);
    assert.notProperty(instances.eleven, 'foo');
    assert.notProperty(instances.eleven, 'bar');
  });
});
