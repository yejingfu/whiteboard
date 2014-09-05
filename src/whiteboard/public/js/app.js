define(['util'], function(util) {

  var Application = function() {

  };

  Application.prototype = {
    init: function() {
      this.initToolbar();
    },

    run: function() {
      console.log('Application::run: ' + util.hello());
    },

    initToolbar: function() {
      console.log('Application::initToolbar()');
      var self = this;
      debugger;
      // relative to document
      var parentPos = $('#canvas-main').offset();
      $('#canvas-toolbar').css({top:parentPos.top, left:parentPos.left});
      $('#canvas-toolbar').css('visibility', 'visible');
      $('#draw-pointer').click(function() {
        self.onDrawPointer();
      });
      $('#draw-line').click(function() {
        self.onDrawLine();
      });
      $('#draw-circle').click(function() {
        self.onDrawCircle();
      });
    },

    onDrawPointer: function() {
      console.log('Application::onDrawPointer()');
    },

    onDrawLine: function() {
      console.log('Application::onDrawLine()');
    },

    onDrawCircle: function() {
      console.log('Application::onDrawCircle()');
    }
  };

  return new Application();

});