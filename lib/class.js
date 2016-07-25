'use strict';

const express = require('express');
const path = require('path');

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
    this.healths = {};
    this.port = params && params.port ? params.port : 8080;
    this.dependencies = dependencies;
    this.messaging = (dependencies && dependencies.messaging) ? dependencies.messaging : require('cta-messaging')();
    const app = express();
    app.set('views', path.join(__dirname, 'views'));
    app.set('view engine', 'ejs');
    app.use(express.static(path.join(__dirname, 'public')));
    app.get('/board', function(req, res, next) {
      res.render('index');
    });
    app.get('/', function(req, res, next) {
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.type('application/json');
      res.statusCode = 200;
      res.send(that.healths);
    });
    app.listen(that.port);
  }

  update(id, status) {
    this.healths[id] = status;
    this.messaging.publish({
      json: {
        nature: {
          type: 'healthCheck',
          quality: 'update',
        },
        payload: {
          id: id,
          status: status,
        },
      },
    });
  }
}

module.exports = HealthCheck;
