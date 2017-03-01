'use strict';

const Tool = require('cta-tool');
const _ = require('lodash');
const jsonfile = require('jsonfile');
const os = require('os');
const path = require('path');
const validate = require('cta-common').validate;

class HealthCheck extends Tool {
  /**
   * Class constructor
   * @param configuration
   * @param configuration.properties - tool properties
   * @param {String} configuration.properties.file - full path to a file where to store healths for resiliency
   * @param {String} configuration.properties.url - api url of a server (basically the healthcheck data service) where to post healthCheck updates
   * @param {String} configuration.properties.queue - Messaging queue name where to produce healthCheck updates
   * @param {String} configuration.properties.topic - Messaging topic name where to publish healthCheck updates
   * @param {object} dependencies
   * @param {object} dependencies.express - cta-expresswrapper tool instance
   * @param {object} dependencies.messaging - cta-messaging tool instance
   * @param {object} dependencies.request - cta-request tool instance
   */
  constructor(dependencies, configuration) {
    const instance = super(dependencies, configuration);
    if (instance.singleton && instance.fullyInitialized) {
      return instance;
    }
    const that = this;
    if (!dependencies.express || dependencies.express === null) {
      throw new Error('express dependency is missing');
    }
    this.properties = validate(configuration.properties, {
      type: 'object',
      optional: true,
      defaultToOptionals: true,
      items: {
        file: {
          type: 'string',
          optional: true,
          defaultTo: path.join(os.tmpDir(), 'healthcheck.json'),
        },
      },
    }).output;
    this.logger.verbose(`File set to "${this.properties.file}"`);
    let content = null;
    try {
      content = jsonfile.readFileSync(this.properties.file);
    } catch (e) {
      this.logger.verbose(`File "${this.properties.file}" not found, it will be generated on the first healthcheck update`);
    }
    this.healths = content || {
      status: '',
      statuses: {},
    };
    dependencies.express.get('/healthcheck', function (req, res) {
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.type('application/json');
      res.statusCode = 200;

      let response = { status: that.healths.status };
      if (req.query.mode === 'full') {
        response = _.cloneDeep(that.healths);
      } else if (req.query.mode === 'current') {
        response = _.cloneDeep(that.healths);
        if (response.statuses) {
          Object.keys(response.statuses).forEach((name) => {
            delete response.statuses[name].previous;
          });
        }
      } else if (req.query.mode === 'previous') {
        response = _.cloneDeep(that.healths);
        if (response.statuses) {
          Object.keys(response.statuses).forEach((name) => {
            delete response.statuses[name].current;
          });
        }
      }
      res.send(response);
    });
    dependencies.express.start();
    this.fullyInitialized = true;
  }

  /**
   * send health status of a service (app, brick, tool...)
   * @param {object} data - object of parameters
   * @param {string} data.name - name of the service
   * @param {string} [data.child] - optional, name of a child service in case the service depends on multiple child services
   * @param {string} data.status - status of the child service: green, yellow, red
   * - green: child service can be used properly
   * - yellow: child service has reached a critic point, but it still can be used properly
   * - red: child service can't be used properly
   * @param {string} data.reason - reason of the given child status
   * @return {Object} : { result: 'ok' } if ok, { error: * } if not
   */
  update(data) {
    const that = this;
    try {
      const vData = validate(data, {
        type: 'object',
        items: {
          name: 'string',
          child: { type: 'string', optional: true, defaultTo: 'default' },
          status: 'string',
          reason: { type: 'string', optional: true },
        },
      }, { throwErr: true }).output;
      if (!(vData.name in this.healths.statuses)) {
        this.healths.statuses[vData.name] = {
          status: '',
          current: {
            services: {},
          },
          previous: {},
        };
      }
      const health = this.healths.statuses[vData.name];
      if (Object.keys(health.current.services).length) {
        health.previous = _.cloneDeep(health.current);
      }
      health.current.services[vData.child] = {
        date: new Date().toISOString(),
        status: vData.status,
      };
      if (vData.reason) {
        health.current.services[vData.child].reason = vData.reason;
      }

      // status aggregation of current service
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

      // status aggregation of all services
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

      // push update
      if (this.dependencies.request && this.properties.url) {
        this.dependencies.request.post(this.properties.url, vData);
      }
      if (this.dependencies.messaging && this.properties.queue) {
        this.dependencies.messaging.produce({
          queue: this.properties.queue,
          content: {
            nature: {
              type: 'healthcheck',
              quality: 'update',
            },
            payload: vData,
          },
        });
      }
      if (this.dependencies.messaging && this.properties.topic) {
        this.dependencies.messaging.publish({
          topic: this.properties.topic,
          content: {
            nature: {
              type: 'healthcheck',
              quality: 'update',
            },
            payload: vData,
          },
        });
      }
      jsonfile.writeFile(this.properties.file, this.healths, null, () => {
        that.logger.verbose('healthcheck saved into disk');
      });
      return { result: 'ok' };
    } catch (e) {
      return { error: e.message };
    }
  }
}

module.exports = HealthCheck;
