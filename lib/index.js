'use strict';

const HealthCheck = require('./class');
const tools = require('cta-tools');
const singletons = new Map();

/**
 * Returns a (new or same) HealthCheck instance
 * @param {object} config - HealthCheck configuration
 * @param {string} config.port - HealthCheck port
 * @param {boolean} config.newInstance - weather to create a new instance or return an already created one
 * @param {object} dependencies
 * @returns {V}
 */
module.exports = function(config, dependencies) {
  const _config = tools.validate(config, {
    port: {
      optional: true,
      type: 'number',
      defaultTo: 8080,
    },
    newInstance: {
      optional: true,
      type: 'boolean',
      defaultTo: false,
    },
  }).output;

  const hashString = [_config.port].join('-');
  let singleton = singletons.get(hashString);

  if (singleton === undefined || _config.newInstance === true) {
    singleton = new HealthCheck(_config, dependencies);
  }
  if (_config.newInstance !== true) {
    singletons.set(hashString, singleton);
  }
  return singleton;
};
