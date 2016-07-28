'use strict';

const Brick = require('cta-brick');

class Three extends Brick {
  constructor(cementHelper, config) {
    super(cementHelper, config);
    const that = this;
    setInterval(function() {
      const data = {};
      const statuses = ['green', 'red', 'green', 'yellow', 'green'];
      let random = Math.floor(5 * Math.random());
      data.status = statuses[random];
      const services = ['alpha', 'beta', 'gamma', 'alpha', 'beta', 'gamma'];
      random = Math.floor(3 * Math.random());
      data.serviceName = services[random];
      if (data.status !== 'green') {
        data.reason = 'some reason';
      }
      that.cementHelper.dependencies.healthcheck.update(that.name, data);
    }, 1500);
  }
}

module.exports = Three;
