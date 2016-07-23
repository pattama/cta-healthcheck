'use strict';

const HealthCheck = require('cta-healthCheck');
const healthCheck = new HealthCheck();
console.log('Now open your browser');

let index = 0;

const states = [{
  id: 'one',
  status: {
    status: 'green',
  },
}, {
  id: 'two',
  status: {
    status: 'green',
  },
}, {
  id: 'three',
  status: {
    status: 'green',
  },
}, {
  id: 'one',
  status: {
    status: 'yellow',
    reason: 'disc usage reached 80%',
  },
}, {
  id: 'one',
  status: {
    status: 'green',
  },
}, {
  id: 'two',
  status: {
    status: 'red',
    reason: 'RabbitMq is down',
  },
}, {
  id: 'two',
  status: {
    status: 'green',
  },
}, {
  id: 'three',
  status: {
    status: 'red',
    reason: 'service Alpha is off',
    services: [{
      name: 'alpha',
      status: 'red',
      reason: 'disc full',
    }, {
      name: 'beta',
      status: 'green',
    }, {
      name: 'gamma',
      status: 'green',
    }],
  },
}];

const fn = () => {
  const state = states[index];
  healthCheck.update(state.id, state.status);
  index++;
};

setInterval(fn, 1000);
