'use strict';

const express = require('express');
const path = require('path');

class HealthCheck {
  /**
   * Class contructor
   * @param config
   * @param config.port - ui port
   * @param config.messaging - cta-messaging instance for fanout updates
   */
  constructor(config) {
    const that = this;
    this.healths = {};
    this.port = config && config.port ? config.port : 8080;
    this.messaging = config && config.messaging ? config.messaging : require('cta-messaging')();
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
