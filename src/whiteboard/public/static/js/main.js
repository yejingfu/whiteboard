// entry point
//requirejs.config({
//  baseUrl: '/static/js'
//});

requirejs(['app'], function(app) {
  app.init();
  app.run();
});