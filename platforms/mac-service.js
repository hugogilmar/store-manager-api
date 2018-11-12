var Service = require('node-mac').Service;

// Create a new service object
var svc = new Service({
  name:'Store Manager',
  description: 'Store Manager API Loopback Server.',
  script: '/path/to/server.js'
});

// Listen for the "install" event, which indicates the
// process is available as a service.
svc.on('install', function(){
  svc.start();
});

svc.install();
