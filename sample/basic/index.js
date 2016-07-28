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
  reason: 'service down',
});
healthCheck.update('four', {
  status: 'yellow',
  reason: 'critic point reached',
  serviceName: 'four/alpha',
});
healthCheck.update('four', {
  status: 'red',
  reason: 'service down',
  serviceName: 'four/beta',
});