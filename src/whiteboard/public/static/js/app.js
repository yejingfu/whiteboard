define(['document', 'painter', 'webrtc', 'util'], function(doclib, painterlib, webrtclib, util) {

  var Application = function() {
    this.painter = null;
    this.webrtc = null;
    this.doc = null;
  };

  Application.prototype = {
    init: function() {
      var query = location.search;
      var pairs = {};
      if (query[0] === '?') {
        var params = query.substring(1).split('&');
        for (var i = 0, len = params.length; i < len; i++) {
          var pair = params[i].split('=');
          pairs[pair[0]] = pair[1];
        }
      }
      this.doc = doclib.createDocument(this);
      this.doc.initSharedDocument(pairs['channel']);
      this.painter = painterlib.create(this);
      this.webrtc = webrtclib.create(this);
      this.painter.init($('#canvas-main')[0]);
      this.webrtc.init(pairs['channel']);
    },

    run: function() {
      console.log('Application::run: ' + util.hello());
    }

  };

  return new Application();

});