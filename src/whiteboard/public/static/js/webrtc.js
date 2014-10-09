define(function() {

var WebRTC = function(app) {
  this.application = app;
  this.serverURL = 'ws://10.239.37.128:3001';
  this.localVideoId = 'video-local';
  this.parentVideoNode = $('#video-container')[0];
  this.localVideoNode = $('#video-local')[0];
  this.videoNodes = {};
  this.channelKey;
  this.PeerConnection;
};

WebRTC.prototype = {
  init: function(channel) {
    console.log('WebRTC::init');
    var self = this;
    if (!rtc.dataChannelSupport)
      return false;
    self.PeerConnection = window.PeerConnection || window.webkitPeerConnection00 || window.webkitRTCPeerConnection;
    if (!self.PeerConnection) {
      console.error('The browser does not support WebRTC, please enable it by going to chrome://flags');
      return false;
    }
    // local video
    rtc.createStream({'video':true, 'audio':true}, function(stream) {
      rtc.attachStream(stream, self.localVideoId);
      self.videoNodes[self.localVideoId] = self.localVideoNode;
    });

    // remote video
    self.channelKey = channel;
    rtc.connect(self.serverURL, self.channelKey);
    rtc.on('add remote stream', function(stream, socId) {
      console.log('add remote stream: ' + socId);
      var newVideo = self.cloneVideo(socId);
      rtc.attachStream(stream, newVideo.id);
    });

    rtc.on('disconnect stream', function(sockedId) {
      console.log('disconnect stream: ' + socketId);
      self.removeVideo(socketId);
    });
  },

  cloneVideo: function(socketId) {
    var self = this;
    var cloneVideo = self.localVideoNode.cloneNode(false);
    cloneVideo.id = 'video_remote_' + socketId;
    self.parentVideoNode.appendChild(cloneVideo);
    self.videoNodes[cloneVideo.id] = cloneVideo;
    return cloneVideo;
  },

  removeVideo: function(socketId) {
    var self = this;
    var id = 'video_remote_'+socketId;
    var node = $('#'+id)[0];
    if (node) {
      delete self.videoNodes[id];
      self.parentVideoNode.removeChild(node);
    }
  }
};

return {
  create: function(app) {
    return new WebRTC(app);
  }
};

});