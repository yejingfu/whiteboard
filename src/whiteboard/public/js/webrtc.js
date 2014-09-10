define(function() {

var WebRTC = function(app) {
  this.application = app;
};

WebRTC.prototype = {
  init: function() {
    console.log('WebRTC::init');
  }
};

return {
  create: function(app) {
    return new WebRTC(app);
  }
};

});