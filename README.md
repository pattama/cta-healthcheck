Health Check Tool
=================

A Tool for Compass Test Automation

This is the health check tool for CTA. Like any Tool it can be injected into other Tools & bricks via a flowcontrol configuration:

```
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
        request: 'request',
      },
      properties: {
        file: './healths.json',
        url: 'http://somedomain:3000/healthcheck',
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
    
```

# Tool dependencies

   * @param {object} dependencies.express - cta-expresswrapper tool instance
   * @param {object} dependencies.messaging - optional cta-messaging tool instance
   * @param {object} dependencies.request - optional cta-request tool instance

# Tool properties

   * @param {String} configuration.properties.file - full path to a file where to store healths for resiliency
   * @param {String} configuration.properties.url - api url of a server (basically the healthcheck data service) where to post healthCheck updates
   * @param {String} configuration.properties.queue - Messaging queue name where to produce healthCheck updates
   * @param {String} configuration.properties.topic - Messaging topic name where to publish healthCheck updates
   
# REST API

GET /healthcheck
```
{
  status: 'red'
}
```

GET /healthcheck?mode=full
```
{
  status: 'red',
  statuses: {
    foo: {
      status: 'red',
      current: {
        services: {
          alpha: {
            date: '2016-12-05T13:00:00.000Z',
            status: 'red'
          },
          beta: {
            date: '2016-12-05T11:00:00.000Z',
            status: 'green'
          }
        }
      },
      previous: {
        services: {
          alpha: {
            date: '2016-12-05T12:00:00.000Z',
            status: 'green'
          }
        }
      }
    }
  }
}
```

GET /healthcheck?mode=current
```
{
  status: 'red',
  statuses: {
    foo: {
      status: 'red',
      current: {
        services: {
          alpha: {
            date: '2016-12-05T13:00:00.000Z',
            status: 'red'
          },
          beta: {
            date: '2016-12-05T11:00:00.000Z',
            status: 'green'
          }
        }
      }     
    }
  }
}
```

GET /healthcheck?mode=previous
```
{
  status: 'red',
  statuses: {
    foo: {
      status: 'red',
      previous: {
        services: {
          alpha: {
            date: '2016-12-05T12:00:00.000Z',
            status: 'green'
          }
        }
      }
    }
  }
}
```