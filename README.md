# cta-healthcheck [ ![build status](https://git.sami.int.thomsonreuters.com/compass/cta-healthcheck/badges/master/build.svg)](https://git.sami.int.thomsonreuters.com/compass/cta-healthcheck/commits/master) [![coverage report](https://git.sami.int.thomsonreuters.com/compass/cta-healthcheck/badges/master/coverage.svg)](https://git.sami.int.thomsonreuters.com/compass/cta-healthcheck/commits/master)

HealthCheck Modules for Compass Test Automation, One of Libraries in CTA-OSS Framework

## General Overview

## Guidelines

We aim to give you brief guidelines here.

1. [Usage](#1-usage)
1. [Configuration](#2-configuration)
1. [Dependencies](#3-dependencies)
1. [Properties](#4-properties)
1. [Update HealthCheck Status](#5-update-healthcheck-status)
1. [Query](#6-query)

### 1. Usage

```javascript
'use strict';

const HealthCheck = require('cta-healthcheck');

const instance = new HealthCheck(dependencies, configuration);
const status = {
  ...
};
instance.update(status);
```

The **constructor** requires [**dependencies**](#3-dependencies) and [**configuration**](#2-configuration).

The **HealthCheck** provides [**update() method**](#5-update-healthcheck-status) to update **_the status of service_**.

[back to top](#guidelines)

### 2. Configuration

Because the **HealthCheck** is _a tool_, the **configuration** is _vital_.

```javascript
'use strict';

const configuration = {
  name: 'healthcheck',
  module: 'cta-healthcheck',
  dependencies: {
    express: 'express',
  },
  properties: {
    file: './healths.json',
    queue: 'cta.healths',
    topic: 'cta.healths',
    url: 'http://domain.com:3000/healthcheck',
  },
};
```

The **configuration** has these following fields:

* **name** - defines a name of the **HealthCheck** tool _which can be any name_
* **module** - must be **'cta-healthcheck'**
* **dependencies** - defines dependencies, see on [**dependencies**](#3-dependencies) section
* **properties** - defines properties, see on [**properties**](#4-properties) section

[back to top](#guidelines)

### 3. Dependencies

Here are examples.

```javascript
'use strict';

const dependencies = {
  express: 'sample.express',
  messaging: 'sample.messaging',
  request: 'sample.request',
};

...

const tools = [{
  name: 'sample.express',
  module: 'cta-expresswrapper',
  properties: {
    port: 8080,
  },
}, {
  name: 'sample.messaging',
  module: 'cta-messaging',
  properties: {
    provider: 'rabbitmq',
    parameters: {
      url: 'amqp://localhost?heartbeat=60',
      ack: 'auto',
    },
  },
}, {
  name: 'sample.request',
  module: 'cta-tool-request',
  properties: {}
}];

```

The **HealthCheck** requires **express** as _dependencies_.

* **express** (required) - defines a name of the **express** tool

* **messaging** (optional) - defines a name of the **messaging** tool

* **request** (optional) - defines a name of the **request** tool

[back to top](#guidelines)

### 4. Properties

```javascript
'use strict';

const properties = {
  file: './healths.json',
  queue: 'cta.healths',
  topic: 'cta.healths',
  url: 'http://domain.com:3000/healthcheck',
};
```

* **file** - defines **full path** to a file where to store healths for resiliency

* **queue** - defines **messaging queue name** where to produce HealthCheck updates

* **topic** - defines **messaging topic name** where to publish HealthCheck updates

* **url** - defines **api url of a server** (basically the healthcheck data service) where to post HealthCheck updates

[back to top](#guidelines)

### 5. Update HealthCheck Status

This shows how **update() method** has been using:

```javascript
...
const instance = new HealthCheck(dependencies, configuration);
const status = {
  ...
};
instance.update(status);
```

#### <u>HealthCheck Status</u>

The **Status** has the structure as following:

```javascript
const status = {
  name: string;
  service: string;
  status: string;
  reason: string;
};
```

* **name** - defines the name of **application**
* **service** - defines the name of **service**
* **status** - defines the current **status** of service: **green**, **yellow**, and **red**
  - **green** - the service is in **proper status**
  - **yellow** - the service is in **critical status**, but it _**can** still be used properly_
  - **red** - the service is in **not-working status**, but it _**cannot** be used properly_
* **reason** - defines the **reason** of status

#### <u>Usage inside Brick</u>

```javascript
const Brick = require('cta-brick');

class SampleBrick extends Brick {
  constructor(cementHelper, config) {
    super(cementHelper, config);  // calling Brick's constructor
    
    // HealthCheck is available as dependencies.
    // By calling update(), the HealthCheck sends a status.
    this.cementHelper.dependencies.healthcheck.update({
      name: 'SampleApplication',
      service: 'SampleService',
      status: 'green',
    });
  }
}

module.exports = SampleBrick;
```

The **Brick** has **HealthCheck** as its **dependencies**. By calling **Brick's constructor**, the **HealthCheck** is available as **SampleBrick**'s dependencies. Calling **update()** sends a status.

[back to top](#guidelines)

### 6. Query

The **HealthCheck** provides a query via **Express**.

There **_four_ ways** to query:

* [No Mode Query](#no-mode-query)

* [Full Mode Query](#full-mode-query)

* [Current Mode Query](#current-mode-query)

* [Previous Mode Query](#previous-mode-query)

#### No Mode Query

**REST Query** - GET :: /healthcheck

```javascript
// with no mode provided
{
  'status': 'green'
}
```

[back](#6-query)

#### Full Mode Query

**REST Query** - GET :: /healthcheck?mode=full

```javascript
// with 'full' mode provided
{
  status: 'green',
  statuses: {
    SampleApplication: {
      status: 'green',
      current: {
        services: {
          alpha: {
            date: '2017-12-25T18:00:00.000Z',
            status: 'green'
          },
          beta: {
            date: '2017-12-24T11:00:00.000Z',
            status: 'green'
          }
        }
      },
      previous: {
        services: {
          alpha: {
            date: '2017-12-24T12:00:00.000Z',
            status: 'red'
          }
        }
      }
    }
  }
}
```

[back](#6-query)

#### Current Mode Query

**REST Query** - GET :: /healthcheck?mode=current

```javascript
// with 'current' mode provided
{
  status: 'green',
  statuses: {
    SampleApplication: {
      status: 'green',
      current: {
        services: {
          alpha: {
            date: '2017-12-25T18:00:00.000Z',
            status: 'green'
          },
          beta: {
            date: '2017-12-24T11:00:00.000Z',
            status: 'green'
          }
        }
      }
    }
  }
}
```

[back](#6-query)

#### Previous Mode Query

**REST Query** - GET :: /healthcheck?mode=previous

```javascript
// with 'previous' mode provided
{
  status: 'green',
  statuses: {
    SampleApplication: {
      status: 'green',
      previous: {
        services: {
          alpha: {
            date: '2017-12-24T12:00:00.000Z',
            status: 'red'
          }
        }
      }
    }
  }
}
```

[back](#6-query)

------

## To Do

------

## Considerations

#### Should we change specific, close-to-'ExpressJS' **dependencies.express** to a common name, dependencies.[restapp]?

```javascript
const config = {
  ...
  dependencies: {
    express: 'my-express',  =>  restapp: 'my-express',
  },
  ...
};
```

------
