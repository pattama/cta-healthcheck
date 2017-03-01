'use strict';

const Brick = require('cta-brick');

class One extends Brick {
  constructor(cementHelper, config) {
    super(cementHelper, config);
    const that = this;
    setInterval(function () {
      const statuses = ['green', 'red', 'green', 'yellow', 'green'];
      const random = Math.floor(5 * Math.random());
      const data = {
        name: 'app2',
        child: 'one',
      };
      data.status = statuses[random];
      if (data.status !== 'green') {
        data.reason = 'some reason';
      }
      that.cementHelper.dependencies.healthcheck.update(data);
    }, 1000);
  }
}

module.exports = One;
