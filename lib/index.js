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
    this.appName = dependencies.cement.configuration.name || 'unknown';
    this.properties = validate(configuration.properties, {
      type: 'object',
      optional: true,
      defaultToOptionals: true,
      items: {
        file: {
          type: 'string',
          optional: true,
          defaultTo: path.join(os.tmpDir(), `healthcheck-${that.appName}.json`),
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
   * @param {string} [data.name] - application name, optional since it's set automatically
   * @param {string} data.service - name of the service (brick/tool name, brick/tool micro service name... etc)
   * @param {string} data.status - status of the service: green, yellow, red
   * - green: service can be used properly
   * - yellow: service has reached a critic point, but it still can be used properly
   * - red: service can't be used properly
   * @param {string} data.reason - reason of the given status
   * @return {Object} : { result: 'ok' } if ok, { error: * } if not
   */
  update(data) {
    const that = this;
    try {
      const vData = validate(data, {
        type: 'object',
        items: {
          name: { type: 'string', optional: true, defaultTo: that.appName },
          service: 'string',
          status: 'string',
          reason: { type: 'string', optional: true },
        },
      }, { throwErr: true }).output;

      if (!(vData.name in this.healths.statuses)) {
        this.healths.statuses[vData.name] = {
          current: {
            status: '',
            services: {},
          },
          previous: {
            services: {},
          },
        };
      }
      const health = this.healths.statuses[vData.name];
      if (!(vData.service in health.current.services)) {
        health.current.services[vData.service] = {
          status: '',
        };
      }
      if (!(vData.service in health.previous.services)) {
        health.previous.services[vData.service] = {
          status: '',
        };
      }
      if (vData.status !== health.current.services[vData.service].status) {
        health.previous.services[vData.service] = _.cloneDeep(health.current.services[vData.service]);
      }
      health.current.services[vData.service] = {
        date: new Date().toISOString(),
        status: vData.status,
      };
      if (vData.reason) {
        health.current.services[vData.service].reason = vData.reason;
      }

      // status aggregation of current service
      const statuses = [];
      Object.keys(health.current.services).forEach((key) => {
        statuses.push(health.current.services[key].status);
      });
      if (statuses.indexOf('red') !== -1) {
        health.current.status = 'red';
      } else if (statuses.indexOf('yellow') !== -1) {
        health.current.status = 'yellow';
      } else {
        health.current.status = 'green';
      }

      // status aggregation of all services
      const allStatuses = [];
      Object.keys(this.healths.statuses).forEach((key) => {
        allStatuses.push(this.healths.statuses[key].current.status);
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
