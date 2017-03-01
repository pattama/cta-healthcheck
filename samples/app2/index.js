'use strict';

const config = {
  tools: [
    {
      name: 'logger',
      module: 'cta-logger',
      properties: {
        level: 'silly',
      },
      scope: 'all',
      order: 0,
    },
    {
      name: 'express',
      module: 'cta-expresswrapper',
      properties: {
        port: 8090,
      },
      order: 1,
    },
    {
      name: 'request',
      module: 'cta-tool-request',
      properties: {},
      order: 2,
    },
    {
      name: 'healthcheck',
      module: 'cta-healthcheck',
      dependencies: {
        express: 'express',
        request: 'request',
      },
      properties: {
        url: 'http://localhost:3000/healthcheck',
      },
      scope: 'bricks',
      order: 3,
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
