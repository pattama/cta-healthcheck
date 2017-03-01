'use strict';

const Brick = require('cta-brick');

class Two extends Brick {
  constructor(cementHelper, config) {
    super(cementHelper, config);
    this.cementHelper.dependencies.healthcheck.update({
      name: 'app2',
      child: 'two',
      status: 'green',
    });
  }
}

module.exports = Two;
