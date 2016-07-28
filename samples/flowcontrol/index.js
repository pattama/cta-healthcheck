'use strict';

const config = {
  tools: [{
    name: 'healthcheck',
    module: 'cta-healthcheck',
    properties: {
      port: 8080,
      queue: 'healthcheck',
    },
    scope: 'bricks',
  }],
  bricks: [{
    name: 'one',
    module: '../../cta-healthcheck/samples/flowcontrol/bricks/one.js',
  }, {
    name: 'two',
    module: '../../cta-healthcheck/samples/flowcontrol/bricks/two.js',
  }, {
    name: 'three',
    module: '../../cta-healthcheck/samples/flowcontrol/bricks/three.js',
  }],
};

const FlowControl = require('cta-flowcontrol');
const Cement = FlowControl.Cement;
const cement = new Cement(config);
