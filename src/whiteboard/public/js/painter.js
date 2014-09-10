define(function() {

var ToolEnum = {
  Pointer: 'pointer',
  Stroke: 'stroke',
  Rectangle: 'rectangle',
  RoundRect: 'roundrect',
  Ellipse: 'ellipse',
  Fill: 'fill',
  None: 'none'
};

var Painter = function(app) {
  this.application = app;
  this.canvas = null;
  this.tools = {};
  this.activeTool = ToolEnum.None;
  this.defaultStyle = {
    strokeColor: '#FF0000',
    strokeWidth: 1
  };
  this.currentPath = null;
  this.startPoint = null;
  this.eatMouseUp = false;
  this.maxRoundRectRadius = 10;
};

Painter.prototype = {
  init: function(canvas) {
    console.log('Painter::init');
    this.canvas = canvas;
    paper.setup(this.canvas);
    this.initToolbar();
    paper.project.currentStyle = $.extend({}, this.defaultStyle);
  },

  initToolbar: function() {
    console.log('Application::initToolbar()');
    var self = this;
    self.initTools();
    // relative to document
    var parentPos = $('#canvas-main').offset();
    $('#canvas-toolbar').css({top:parentPos.top, left:parentPos.left});
    $('#canvas-toolbar').css('visibility', 'visible');
    $('#tb-pointer').click(function() {
      self.startTool(ToolEnum.Pointer);
    });
    $('#tb-stroke').click(function() {
      self.startTool(ToolEnum.Stroke);
    });
    $('#tb-rectangle').click(function() {
      self.startTool(ToolEnum.Rectangle);
    });
    $('#tb-roundrect').click(function() {
      self.startTool(ToolEnum.RoundRect);
    });
    $('#tb-ellipse').click(function() {
      self.startTool(ToolEnum.Ellipse);
    });
    $('#tb-fill').click(function() {
      self.startTool(ToolEnum.Fill);
    });
  },

  initTools: function() {
    var curTool;
    var self = this;

    var hookupClickEvent = function(kind) {
      var tool = new paper.Tool();
      self.tools[kind] = tool;
      tool.onMouseDown = function(e) {
        self.onClick(kind, e);
      };
    };

    var hookupMouseEvent = function(kind) {
      var tool = new paper.Tool();
      self.tools[kind] = tool;
      tool.onMouseDown = function(e) {
        self.drawBegin(kind, e);
      };
      tool.onMouseDrag = function(e) {
        self.drawMove(kind, e);
      };
      tool.onMouseUp = function(e) {
        self.drawEnd(kind, e);
      };
    };
    hookupClickEvent(ToolEnum.Pointer);
    hookupClickEvent(ToolEnum.Fill);
    hookupMouseEvent(ToolEnum.Stroke);
    hookupMouseEvent(ToolEnum.Rectangle);
    hookupMouseEvent(ToolEnum.RoundRect);
    hookupMouseEvent(ToolEnum.Ellipse);

    self.tools[ToolEnum.Pointer].activate();
  },

  startTool: function(kind) {
    if (this.activeTool !== ToolEnum.None)
      this.endTool();
    this.tools[kind].activate();
    this.activeTool = kind;
  },

  endTool: function() {
    this.activeTool = ToolEnum.None;
  },

  onClick: function(kind, e) {
    console.log('onClick:'+kind);
    switch (kind) {
    case ToolEnum.Pointer:
    break;
    case ToolEnum.Fill:
    break;
    default:
    break;
    };
  },

  addToolBarItem: function(name, cb) {
    var tbContainer = $('#canvas-toolbar');
    var html = '<div id="tb-'+name+'" class="btn"><span class=></span></div>';
    tbContainer.append();
  },

  drawBegin: function(kind, event) {
    console.log('drawBegin:'+kind);
    var self = this;
    if (self.currentPath) {
      self.currentPath.selected = false;
      self.currentPath = null;
    }
    self.startPoint = event.point.clone();
  },

  drawMove: function(kind, event) {
    console.log('drawMove:'+kind);
    var self = this;
    switch(kind) {
    case ToolEnum.Stroke: {
      if (!self.currentPath) {
        self.currentPath = new paper.Path();
        self.currentPath.add(self.startPoint);
        self.currentPath.add(event.point);
      }
      self.currentPath.lastSegment.point = event.point;
      break;
    }
    case ToolEnum.Rectangle: {
      if (self.currentPath) {
        self.currentPath.remove();
      }
      self.currentPath = paper.Path.Rectangle(self.startPoint, event.point);
      break;
    }
    case ToolEnum.RoundRect: {
      if (self.currentPath) {
        self.currentPath.remove();
      }
      var radius = self.maxRoundRectRadius;
      var rect = new paper.Rectangle(self.startPoint, event.point);
      var minSize = rect.width > rect.height ? rect.height : rect.width;
      var radius = minSize * 0.2;
      if (radius > self.maxRoundRectRadius)
        radius = self.maxRoundRectRadius;
      self.currentPath = paper.Path.Rectangle(rect, radius);
      break;
    }
    case ToolEnum.Ellipse: {
      if (self.currentPath) {
        self.currentPath.remove();
      }
      self.currentPath = paper.Path.Ellipse(new paper.Rectangle(self.startPoint, event.point));
      break;
    }
    default:
    break;
    };
  },

  drawEnd: function(kind, event) {
    console.log('drawEnd:'+kind);
    var self = this;
    if (!self.currentPath)
      return;
    switch(kind) {
    case ToolEnum.Stroke: {
      self.currentPath.lastSegment.remove();
      var midPoint = self.currentPath.firstSegment.point.add(event.point);
      midPoint.x /= 2;
      midPoint.y /= 2;
      self.currentPath.add(midPoint);
      self.currentPath.add(event.point);
      self.currentPath.selected = true;
      break;
    }
    case ToolEnum.Rectangle: {
      if (self.currentPath) {
        self.currentPath.remove();
      }
      self.currentPath = paper.Path.Rectangle(self.startPoint, event.point);
      self.currentPath.selected = true;
      break;
    }
    case ToolEnum.RoundRect: {
      if (self.currentPath) {
        self.currentPath.remove();
      }
      var radius = self.maxRoundRectRadius;
      var rect = new paper.Rectangle(self.startPoint, event.point);
      var minSize = rect.width > rect.height ? rect.height : rect.width;
      var radius = minSize * 0.2;
      if (radius > self.maxRoundRectRadius)
        radius = self.maxRoundRectRadius;
      self.currentPath = paper.Path.Rectangle(rect, radius);
      self.currentPath.selected = true;
      break;
    }
    case ToolEnum.Ellipse: {
      if (self.currentPath) {
        self.currentPath.remove();
      }
      self.currentPath = paper.Path.Ellipse(new paper.Rectangle(self.startPoint, event.point));
      self.currentPath.selected = true;
      break;
    }
    default:
    break;
    };
  }

};

return {
  create: function(app) {
    return new Painter(app);
  }
};

});