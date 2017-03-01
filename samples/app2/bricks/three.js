'use strict';

const Brick = require('cta-brick');

class Three extends Brick {
  constructor(cementHelper, config) {
    super(cementHelper, config);
    const that = this;
    setInterval(function () {
      const data = {
        name: 'app2',
      };
      const statuses = ['green', 'red', 'green', 'yellow', 'green'];
      let random = Math.floor(5 * Math.random());
      data.status = statuses[random];
      const services = ['alpha', 'beta', 'gamma', 'alpha', 'beta', 'gamma'];
      random = Math.floor(3 * Math.random());
      data.child = services[random];
      if (data.status !== 'green') {
        data.reason = 'some reason';
      }
      that.cementHelper.dependencies.healthcheck.update(data);
    }, 1500);
  }
}

module.exports = Three;
