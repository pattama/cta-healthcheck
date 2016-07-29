'use strict';

const assert = require('chai').assert;
const Lib = require('../../lib');
const instances = {};

describe('singleton', () => {
  it('should return same instance', () => {
    instances.one = new Lib();
    instances.one.foo = 'bar';
    instances.two = new Lib();
    assert.equal(instances.two.foo, 'bar');
  });
  it('should return different instance', () => {
    instances.three = new Lib({newInstance: true});
    instances.four = new Lib({port: 3100});
    assert.notProperty(instances.three, 'foo');
    assert.notProperty(instances.four, 'foo');
  });
});
