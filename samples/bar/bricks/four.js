'use strict';

const Brick = require('cta-brick');

class Four extends Brick {
  constructor(cementHelper, config) {
    super(cementHelper, config);
    const that = this;
    const services = {
      index: -1,
      names: ['gamma', 'delta'],
    };
    const statuses = {
      index: -1,
      names: ['green', 'yellow', 'green', 'red', 'green'],
    };
    const getName = function(target) {
      target.index = target.index >= (target.names.length - 1) ? 0 : (target.index + 1);
      return target.names[target.index];
    };
    setInterval(function () {
      const service = `${that.name}.${getName(services)}`;
      const status = getName(statuses);
      const reason = status !== 'green' ? 'some reason' : '';
      that.cementHelper.dependencies.healthcheck.update({
        service,
        status,
        reason,
      });
    }, 2000);
  }
}

module.exports = Four;
