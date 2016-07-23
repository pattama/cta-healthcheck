'use strict';

const HealthCheck = require('cta-healthCheck');
const healthCheck = new HealthCheck();
healthCheck.update('one', {
  status: 'green',
});
healthCheck.update('two', {
  status: 'yellow',
  reason: 'disc usage reached 90%',
});
healthCheck.update('three', {
  status: 'red',
  reason: 'service four is down',
  services: [{
    name: 'four',
    status: 'red',
    reason: 'rabbitmq is down',
  }, {
    name: 'five',
    status: 'green',
  }],
});
