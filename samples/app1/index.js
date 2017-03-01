'use strict';

const config = {
  name: 'app1',
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
      name: 'messaging',
      module: 'cta-messaging',
      properties: {
        provider: 'rabbitmq',
        parameters: {
          url: 'amqp://localhost?heartbeat=60', // this is often an environment variable and should be set inside env folder
        },
      },
      singleton: true,
      order: 1,
    },
    {
      name: 'express',
      module: 'cta-expresswrapper',
      properties: {
        port: 8080,
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
        messaging: 'messaging',
        request: 'request',
      },
      properties: {
        // url: 'http://localhost:8000/healthcheck',
        queue: 'cta.hck',
      },
      scope: 'bricks',
      order: 3,
    },
  ],
  bricks: [
    {
      name: 'one',
      module: './bricks/one.js',
    },
    {
      name: 'two',
      module: './bricks/two.js',
    },
    {
      name: 'three',
      module: './bricks/three.js',
    }
  ],
};

const FlowControl = require('cta-flowcontrol');
const Cement = FlowControl.Cement;
const cement = new Cement(config, __dirname);
