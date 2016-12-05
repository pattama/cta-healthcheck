'use strict';

const HealthCheck = require('../../lib');
const request = new (require('cta-tool-request'))();
const express = new (require('cta-expresswrapper'))({}, {
  name: 'express',
  properties: {
    port: 3000,
  },
});
const healthCheck = new HealthCheck({
  request,
  express
}, {
  name: 'healthcheck',
});
healthCheck.update({
  name: 'foo',
  child: 'bar',
  status: 'green',
});