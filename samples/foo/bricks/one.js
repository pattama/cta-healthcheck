'use strict';

const Brick = require('cta-brick');

class One extends Brick {
  constructor(cementHelper, config) {
    super(cementHelper, config);
    const that = this;
    this.cementHelper.dependencies.healthcheck.update({
      service: that.name,
      status: 'green',
    });
  }
}

module.exports = One;
