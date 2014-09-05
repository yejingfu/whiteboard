// entry point
requirejs.config({
  baseUrl: '/js',
  paths: {
    lib: '/libs',
    signals: '/libs/signals'
  }
});

requirejs(['app'], function(app) {
  app.init();
  app.run();
});