'use strict';

const Tool = require('cta-tool');
const _ = require('lodash');

class HealthCheck extends Tool {
  /**
   * Class constructor
   * @param configuration
   * @param configuration.properties - tool properties
   * @param configuration.properties.queue - queue name where to publish healthCheck updates
   * @param {object} dependencies
   * @param {object} dependencies.messaging - cta-messaging instance for broadcast updates
   */
  constructor(dependencies, configuration) {
    const instance = super(dependencies, configuration);
    if (instance.singleton && instance.fullyInitialized) {
      return instance;
    }
    const that = this;
    this.healths = {
      status: '',
      statuses: {},
    };

    // configuring express instance
    if (!dependencies.express || dependencies.express === null) {
      throw new Error('express dependency is missing');
    }

    dependencies.express.get('/', function (req, res) {
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.type('application/json');
      res.statusCode = 200;
      res.send({ status: that.healths.status });
    });
    dependencies.express.get('/health', function (req, res) {
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.type('application/json');
      res.statusCode = 200;
      res.send(that.healths);
    });
    dependencies.express.start();
    this.fullyInitialized = true;
  }

  /**
   * update health status of a service (brick, tool...)
   * @param {string} id - unique id of the service
   * @param {object} data
   * @param {string} data.status - green, yellow, red
   * - green: service can be used properly
   * - yellow: service has reached a critic point, but it still can be used properly
   * - red: service can't be used properly
   * @param {string} data.reason - describe why green, why yellow, why red
   * @param {string} data.serviceName - optional, to identify the related internal service in case the service depends on multiple services
   */
  update(id, data) {
    try {
      if (!(data && typeof data === 'object')) {
        return 'invalid data';
      }
      if (!(id in this.healths.statuses)) {
        this.healths.statuses[id] = {
          status: '',
          current: {
            services: {},
          },
          previous: {},
        };
      }
      const health = this.healths.statuses[id];
      if (Object.keys(health.current.services).length) {
        health.previous = _.cloneDeep(health.current);
      }
      const serviceName = data.serviceName || 'default';
      health.current.services[serviceName] = {
        date: new Date().toISOString(),
        status: data.status,
      };
      if (data.reason) {
        health.current.services[serviceName].reason = data.reason;
      }
      const statuses = [];
      Object.keys(health.current.services).forEach((key) => {
        statuses.push(health.current.services[key].status);
      });
      if (statuses.indexOf('red') !== -1) {
        health.status = 'red';
      } else if (statuses.indexOf('yellow') !== -1) {
        health.status = 'yellow';
      } else {
        health.status = 'green';
      }
      const allStatuses = [];
      Object.keys(this.healths.statuses).forEach((key) => {
        allStatuses.push(this.healths.statuses[key].status);
      });
      if (allStatuses.indexOf('red') !== -1) {
        this.healths.status = 'red';
      } else if (allStatuses.indexOf('yellow') !== -1) {
        this.healths.status = 'yellow';
      } else {
        this.healths.status = 'green';
      }
      if (this.dependencies.messaging && this.properties.queue) {
        this.dependencies.messaging.produce({
          queue: this.properties.queue,
          json: {
            nature: {
              type: 'healthcheck',
              quality: 'update',
            },
            payload: {
              id,
              data,
            },
          },
        });
      }
      if (this.dependencies.messaging && this.properties.topic) {
        this.dependencies.messaging.publish({
          topic: this.properties.topic,
          json: {
            nature: {
              type: 'healthcheck',
              quality: 'update',
            },
            payload: {
              id,
              data,
            },
          },
        });
      }
    } catch (e) {
      return e.message;
    }
    return true;
  }
}

module.exports = HealthCheck;
