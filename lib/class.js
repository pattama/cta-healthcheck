'use strict';

const express = require('express');
// const path = require('path');
const _ = require('lodash');
const Messaging = require('cta-messaging');

class HealthCheck {
  /**
   * Class constructor
   * @param params
   * @param params.port - ui board port
   * @param {object} dependencies
   * @param {object} dependencies.messaging - cta-messaging instance for fanout updates
   */
  constructor(params, dependencies) {
    const that = this;
    this.healths = {
      status: '',
      statuses: {},
    };
    this.port = params && params.port ? params.port : 8080;
    this.queue = params && params.queue ? params.queue : 'healthcheck';
    this.dependencies = dependencies;
    if (dependencies && dependencies.messaging) {
      this.messaging = dependencies.messaging;
    } else {
      this.messaging = new Messaging();
    }
    const app = express();
    /* app.set('views', path.join(__dirname, 'views'));
    app.set('view engine', 'ejs');
    app.use(express.static(path.join(__dirname, 'public')));
    app.get('/board', function(req, res, next) {
      res.render('index');
    });*/
    app.get('/', function(req, res, next) {
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.type('application/json');
      res.statusCode = 200;
      res.send({status: that.healths.status});
    });
    app.listen(that.port);
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
    const that = this;
    if (!(data && typeof data === 'object')) {
      return;
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
    this.messaging.publish({
      queue: that.queue,
      json: that.healths,
    });
  }
}

module.exports = HealthCheck;
