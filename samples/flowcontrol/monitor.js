'use strict';

const Messaging = require('cta-messaging');
const messaging = new Messaging();
messaging.subscribe({
  queue: 'healthcheck',
  cb: () => {},
}).then((res) => {
  console.log(res);
}).catch((err) => {
  console.error(err);
});
