# cta-healthcheck [ ![build status](https://git.sami.int.thomsonreuters.com/compass/cta-healthcheck/badges/master/build.svg)](https://git.sami.int.thomsonreuters.com/compass/cta-healthcheck/commits/master) [![coverage report](https://git.sami.int.thomsonreuters.com/compass/cta-healthcheck/badges/master/coverage.svg)](https://git.sami.int.thomsonreuters.com/compass/cta-healthcheck/commits/master)

HealthCheck Modules for Compass Test Automation, One of Libraries in CTA-OSS Framework

## General Overview

## Guidelines

We aim to give you brief guidelines here.

1. [Point](#1-point)
1. [Point](#2-point)
1. [Point](#3-point)

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

The **constructor** requires **dependencies** and **configuration**.

The **HealthCheck** provides **update() method** to update **_the status of service_**.

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



------

## To Do

* More Points