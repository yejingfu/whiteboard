define(['document', 'painter', 'webrtc', 'util'], function(doclib, painterlib, webrtclib, util) {

  var Application = function() {
    this.painter = null;
    this.webrtc = null;
    this.doc = null;
  };

  Application.prototype = {
    init: function() {
      this.doc = doclib.createDocument(this);
      this.doc.initSharedDocument();
      this.painter = painterlib.create(this);
      this.webrtc = webrtclib.create(this);
      this.painter.init($('#canvas-main')[0]);
      this.webrtc.init();
    },

    run: function() {
      console.log('Application::run: ' + util.hello());
    }

  };

  return new Application();

});