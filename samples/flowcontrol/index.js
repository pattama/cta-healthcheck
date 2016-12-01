'use strict';

const config = {
  tools: [
    {
      name: 'express',
      module: 'cta-expresswrapper',
      properties: {
        port: 8080,
      },
    },
    {
      name: 'healthcheck',
      module: 'cta-healthcheck',
      properties: {
        queue: 'healthcheck',
      },
      dependencies: {
        express: 'express',
      },
      scope: 'bricks',
    },
  ],
  bricks: [{
    name: 'one',
    module: './bricks/one.js',
  }, {
    name: 'two',
    module: './bricks/two.js',
  }, {
    name: 'three',
    module: './bricks/three.js',
  }],
};

const FlowControl = require('cta-flowcontrol');
const Cement = FlowControl.Cement;
const cement = new Cement(config, __dirname);
