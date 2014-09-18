define(['document', 'painter', 'webrtc', 'util'], function(doclib, painterlib, webrtclib, util) {

  var Application = function() {
    this.painter = null;
    this.webrtc = null;
    this.doc = null;
    this.defaultChannelKey = "46a910fc-d481-41e1-b06c-26cb9a9e62c4";
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
      var channel = pairs['channel'];
      if (typeof channel === 'string')
        this.defaultChannelKey = channel;
      this.doc = doclib.createDocument(this);
      this.doc.initSharedDocument(this.defaultChannelKey);
      this.painter = painterlib.create(this);
      this.webrtc = webrtclib.create(this);
      this.painter.init($('#canvas-main')[0]);
      this.webrtc.init(this.defaultChannelKey);
    },

    run: function() {
      console.log('Application::run: ' + util.hello());
    }

  };

  return new Application();

});