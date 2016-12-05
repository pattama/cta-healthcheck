'use strict';

module.exports = {
  status: 'red',
  statuses: {
    foo: {
      status: 'red',
      current: {
        services: {
          alpha: {
            date: '2016-12-05T13:00:00.000Z',
            status: 'red',
          },
          beta: {
            date: '2016-12-05T11:00:00.000Z',
            status: 'green',
          },
        },
      },
      previous: {
        services: {
          alpha: {
            date: '2016-12-05T12:00:00.000Z',
            status: 'green',
          },
        },
      },
    },
  },
};
