define(function() {

var Painter = function(app) {
  this.application = app;
  this.canvas = null;
};

Painter.prototype = {
  init: function(canvas) {
    console.log('Painter::init');
    this.canvas = canvas;
    paper.setup(this.canvas);
    this.initToolbar();
  },

  initToolbar: function() {
    console.log('Application::initToolbar()');
    var self = this;
    // relative to document
    var parentPos = $('#canvas-main').offset();
    // var html = '<div id="canvas-toolbar" style="position:absolute; background-color:gray;'+
    //   +' top:'+parentPos.top+'; left:'+parentPos.left+'" class="btn-group btn-group-horizontal"></div>';
    // $(document).append(html);



    
    $('#canvas-toolbar').css({top:parentPos.top, left:parentPos.left});
    $('#canvas-toolbar').css('visibility', 'visible');
    $('#tb-stroke').click(function() {
      self.onDrawPointer();
    });
    $('#draw-rectangle').click(function() {
      self.onDrawLine();
    });
    $('#draw-roundrect').click(function() {
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
  },

  draw: function() {
    // var path = new paper.Path();
    // path.strokeColor = 'black';
    // var startPos = new paper.Point(10, 10);
    // path.moveTo(startPos);
    // path.lineTo(startPos.add([200, 100]));
    // paper.view.draw();
  },

  addToolBarItem: function(name, cb) {
    var tbContainer = $('#canvas-toolbar');
    var html = '<div id="tb-'+name+'" class="btn"><span class=></span></div>';
    tbContainer.append();
  }

};

return {
  create: function(app) {
    return new Painter(app);
  }
};

});