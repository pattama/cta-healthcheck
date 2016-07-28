'use strict';

const HealthCheck = require('cta-healthCheck');
const healthCheck = new HealthCheck();

const states = [{
  id: 'one',
  data: {
    status: 'green',
  },
}, {
  id: 'two',
  data: {
    status: 'green',
  },
}, {
  id: 'three',
  data: {
    status: 'green',
    serviceName: 'alpha',
  },
}, {
  id: 'three',
  data: {
    status: 'green',
    serviceName: 'beta',
  },
}, {
  id: 'one',
  data: {
    status: 'yellow',
    reason: 'disc usage reached 80%',
  },
}, {
  id: 'one',
  data: {
    status: 'green',
  },
}, {
  id: 'two',
  data: {
    status: 'red',
    reason: 'service down',
  },
}, {
  id: 'two',
  data: {
    status: 'green',
  },
}, {
  id: 'three',
  data: {
    status: 'yellow',
    reason: 'critic point reached',
    serviceName: 'alpha',
  },
}, {
  id: 'three',
  data: {
    status: 'red',
    reason: 'service off',
    serviceName: 'beta',
  },
}, {
  id: 'three',
  data: {
    status: 'red',
    reason: 'service off',
    serviceName: 'alpha',
  },
}];

let index = 0;
const fn = () => {
  const state = states[index];
  healthCheck.update(state.id, state.data);
  console.log(healthCheck.healths.status);
  if (index === (states.length - 1)) {
    index = 0;
  } else {
    index++;
  }
};
setInterval(fn, 1000);
