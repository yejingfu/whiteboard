define(['painter', 'webrtc', 'util'], function(painterlib, webrtclib, util) {

  var Application = function() {
    this.painter = null;
    this.webrtc = null;
  };

  Application.prototype = {
    init: function() {
      this.painter = painterlib.create(this);
      this.webrtc = webrtclib.create(this);
      this.painter.init($('#canvas-main')[0]);
      this.webrtc.init();
    },

    run: function() {
      console.log('Application::run: ' + util.hello());
      this.painter.draw();
    }

  };

  return new Application();

});