'use strict';

const Brick = require('cta-brick');

class Two extends Brick {
  constructor(cementHelper, config) {
    super(cementHelper, config);
    this.cementHelper.dependencies.healthcheck.update(this.name, {
      status: 'green',
    });
  }
}

module.exports = Two;