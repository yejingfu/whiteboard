define(function() {

var WebRTC = function(app) {
  this.application = app;
};

WebRTC.prototype = {
  init: function() {
    console.log('WebRTC::init');
    debugger;
    rtc.connect('ws://10.239.37.128:3001');
    rtc.createStream({'video':true, 'audio':true}, function(stream) {
      rtc.attachStream(stream, 'video-local');
    });
  }
};

return {
  create: function(app) {
    return new WebRTC(app);
  }
};

});