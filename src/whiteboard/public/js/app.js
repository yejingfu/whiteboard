define(['util'], function(util) {

  var Application = function() {

  };

  Application.prototype = {
    init: function() {
      this.initToolbar();
      paper.setup($('#canvas-main')[0]);
    },

    run: function() {
      console.log('Application::run: ' + util.hello());
      this.draw();
    },

    initToolbar: function() {
      console.log('Application::initToolbar()');
      var self = this;
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

    draw: function() {
      var path = new paper.Path();
      path.strokeColor = 'black';
      var startPos = new paper.Point(10, 10);
      path.moveTo(startPos);
      path.lineTo(startPos.add([200, 100]));
      paper.view.draw();
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