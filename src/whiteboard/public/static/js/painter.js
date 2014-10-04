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
  this.doc = app.doc;
  this.ss = this.doc.ss;
  this.canvas = null;
  this.tools = {};
  this.activeTool = ToolEnum.None;
  this.defaultStyle = {
    strokeColor: '#000000',
    strokeWidth: 1
  };
  this.activePath = null;
  this.startPoint = null;
  this.eatMouseUp = false;
  this.maxRoundRectRadius = 10;
  this.activeColor = '#000000';

  this.hitOptions = {
    segments: true,    // can select each segment within stroke/path
    stroke: true,      // can select stroke
    fill: true,        // can select fill
    tolerance: 3
  };
};

Painter.prototype = {
  init: function(canvas) {
    console.log('Painter::init');
    this.canvas = canvas;
    paper.setup(this.canvas);
    this.initToolbar();
    paper.project.currentStyle = $.extend({}, this.defaultStyle);
	
	// show welcome
	var text = new paper.PointText({
		point: [150, 150],
		content: 'Welcome!',
		fillColor: '#eee',
		fontFamily: 'Courier New',
		fontWeight: 'bold',
		fontSize: 80});
	
	this.startTool(ToolEnum.Pointer);
  },

  initToolbar: function() {
    console.log('Application::initToolbar()');
    var self = this;
	var toolbar = $('#canvas-toolbar');
	
	var addToolbarItem = function(name, onclick) {
	  var html = '<div id="tb-'+name+'" class="toolbaritem img-'+name+'-32x32-normal"></div>';
	  toolbar.append(html);
	  var btn = $('#tb-'+name);
	  btn.hover(function() {
	    self.changeToolbarItemState(name, 'hover');
	  }, function() {
		self.changeToolbarItemState(name, 'normal');
	  });
	  if (onclick !== undefined && typeof onclick === 'function') {
	    btn.click(function() {
	      onclick();
	    });
	  }
	};
	
	var addToolbarSeparator = function() {
	  toolbar.append('<div class="toolbarsep img-seperate-32x4-normal"></div>');
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
      if (kind === ToolEnum.Pointer) {
        tool.onKeyDown = function(e) {
          if (e.key === 'delete')
            self.removeSelection();
        };
        tool.onKeyUp = function(e) {

        };
      }
    };
    hookupMouseEvent(ToolEnum.Pointer);
    hookupMouseEvent(ToolEnum.Fill);
    hookupMouseEvent(ToolEnum.Stroke);
    hookupMouseEvent(ToolEnum.Rectangle);
    hookupMouseEvent(ToolEnum.RoundRect);
    hookupMouseEvent(ToolEnum.Ellipse);
	
	addToolbarItem('new', function() {
	  console.log('TODO: new');
	});
	addToolbarItem('save', function() {
	  console.log('TODO: save');
	});
	addToolbarSeparator();
	addToolbarItem('pointer', function() {
	  self.startTool(ToolEnum.Pointer);
	});
	addToolbarItem('stroke', function() {
	  self.startTool(ToolEnum.Stroke);
	});
	addToolbarItem('rectangle', function() {
	  self.startTool(ToolEnum.Rectangle);
	});
	addToolbarItem('roundrect', function() {
	  self.startTool(ToolEnum.RoundRect);
	});
	addToolbarItem('ellipse', function() {
	  self.startTool(ToolEnum.Ellipse);
	});
	addToolbarItem('fill', function() {
	  self.startTool(ToolEnum.Fill);
	});
	addToolbarSeparator();
	addToolbarItem('undo', function() {
	  console.log('TODO: undo');
	});
	addToolbarItem('redo', function() {
	  console.log('TODO: redo');
	});
	addToolbarSeparator();
	addToolbarItem('zoomin', function() {
	  console.log('TODO: zoomin');
	});
	addToolbarItem('zoomout', function() {
	  console.log('TODO: zoomout');
	});
	addToolbarSeparator();
	addToolbarItem('grid', function() {
	  console.log('TODO: grid');
	});
	addToolbarItem('ruler', function() {
	  console.log('TODO: ruler');
	});
	addToolbarSeparator();

	addToolbarItem('color');
    // colorpicker
    $('#tb-color').ColorPicker({
      color: self.activeColor,
      onShow: function (colpkr) {
        $(colpkr).fadeIn(500);
        return false;
      },
      onHide: function (colpkr) {
        $(colpkr).fadeOut(500);
        return false;
      },
      onChange: function (hsb, hex, rgb) {
        self.activeColor = '#' + hex;
        paper.project.currentStyle.strokeColor = '#'+hex;
      }
    });
	
	self.enableToolbarItem('undo', false);
	self.enableToolbarItem('redo', false);
	
    // relative to document
	var onWinResize = function() {
      var parentPos = $('#canvas-main').offset();
      toolbar.css({top:parentPos.top, left:parentPos.left});
	};
	$(window).resize(function() {
	  onWinResize();
	});
	onWinResize();
	toolbar.css('visibility', 'visible');
  },
  
  changeToolbarItemState: function(name, state, force) {
    var btn = $('#tb-'+name);
	if (!btn)
	  return;
	var normalClass = 'img-'+name+'-32x32-normal';
	var activeClass = 'img-'+name+'-32x32-active';
	var hoverClass = 'img-'+name+'-32x32-hover';
	var curClass = 'img-'+name+'-32x32-'+state;
	if (!force && btn.hasClass(activeClass))
	  return;
	if (btn.hasClass(normalClass) && normalClass !== curClass)
	  btn.removeClass(normalClass);
	if (btn.hasClass(activeClass) && activeClass !== curClass)
	  btn.removeClass(activeClass);
	if (btn.hasClass(hoverClass) && hoverClass !== curClass)
	  btn.removeClass(hoverClass);
	if (!btn.hasClass(curClass))
	  btn.addClass(curClass);
  },
  
  enableToolbarItem: function(name, enable) {
    var btn = $('#tb-'+name);
	if (!btn)
	  return;
	if (enable === undefined)
      enable = true;
	var disableClass = 'toolbaritemdisable';
	if (!enable && !btn.hasClass(disableClass))
	  btn.addClass(disableClass);
	if (enable && btn.hasClass(disableClass))
	  btn.removeClass(disableClass);
  },

  startTool: function(kind) {
    if (this.activeTool !== ToolEnum.None)
      this.endTool();
    if (kind == ToolEnum.Fill) {
      this.deselectPath();
    }
    this.tools[kind].activate();
    this.activeTool = kind;
	this.changeToolbarItemState(kind, 'active');
  },

  endTool: function() {
    this.changeToolbarItemState(this.activeTool, 'normal', true);
    this.activeTool = ToolEnum.None;
  },

  addToolBarItem: function(name, cb) {
    var tbContainer = $('#canvas-toolbar');
    var html = '<div id="tb-'+name+'" class="btn"><span class=></span></div>';
    tbContainer.append();
  },

  drawBegin: function(kind, event) {
    console.log('drawBegin:'+kind);
    var self = this;
    self.doc.beginChange();

    self.activePath = null;
    self.startPoint = event.point.clone();

    if (kind === ToolEnum.Pointer) {
      var hitResult = paper.project.hitTest(event.point, self.hitOptions);
      if (hitResult) {
        self.selectPath(hitResult.item);
      } else {
        self.deselectPath();
      }
    } else if (kind === ToolEnum.Fill) {
      self.doc.shapeRoot.traverseShapes(true, function(shape) {
        if (shape.path && shape.path.closed && shape.path.contains(event.point)) {
          //shape.path.fillColor = self.activeColor;
          self.doc.shapeRoot.updateShapeItem(shape, 'fillColor', self.activeColor);
          return true;
        }
      });
    }
  },

  drawMove: function(kind, event) {
    console.log('drawMove:'+kind);
    var self = this;
    switch(kind) {
    case ToolEnum.Pointer: {
      for (var i in self.ss.items) {
        var path = self.ss.items[i].path;
        path.position = path.position.add(event.delta);
      }
      break;
    }
    case ToolEnum.Stroke: {
      if (!self.activePath) {
        self.activePath = self.addPath();
        self.activePath.add(self.startPoint);
        self.activePath.add(event.point);
      }
      if (event.event.shiftKey) {
        // draw line
        self.activePath.lastSegment.point = event.point;
      } else {
        // draw curve
        //if (!self.activePath.lastSegment.point.equals(event.point))
        self.activePath.add(event.point);
      }
      break;
    }
    case ToolEnum.Rectangle: {
      self.activePath = self.updatePath(self.activePath, paper.Path.Rectangle(self.startPoint, event.point));
      break;
    }
    case ToolEnum.RoundRect: {
      var radius = self.maxRoundRectRadius;
      var rect = new paper.Rectangle(self.startPoint, event.point);
      var minSize = rect.width > rect.height ? rect.height : rect.width;
      var radius = minSize * 0.2;
      if (radius > self.maxRoundRectRadius)
        radius = self.maxRoundRectRadius;
      self.activePath = self.updatePath(self.activePath, paper.Path.Rectangle(rect, radius));
      break;
    }
    case ToolEnum.Ellipse: {
      self.activePath = self.updatePath(self.activePath, paper.Path.Ellipse(new paper.Rectangle(self.startPoint, event.point)));
      break;
    }
    default:
    break;
    };
  },

  drawEnd: function(kind, event) {
    console.log('drawEnd:'+kind);
    var self = this;
    if (!self.activePath) {
      self.doc.endChange();
      return;
    }
    switch(kind) {
    case ToolEnum.Stroke: {
      if (event.event.shiftKey) {
        self.activePath.lastSegment.remove();
        var midPoint = self.activePath.firstSegment.point.add(event.point);
        midPoint.x /= 2;
        midPoint.y /= 2;
        self.activePath.add(midPoint);
        self.activePath.add(event.point);
      } else {
        self.activePath.add(event.point);
        self.activePath.simplify(10);
      }
      break;
    }
    case ToolEnum.Rectangle: {
      self.activePath = self.updatePath(self.activePath, paper.Path.Rectangle(self.startPoint, event.point));
      //self.activePath.selected = true;
      break;
    }
    case ToolEnum.RoundRect: {
      var radius = self.maxRoundRectRadius;
      var rect = new paper.Rectangle(self.startPoint, event.point);
      var minSize = rect.width > rect.height ? rect.height : rect.width;
      var radius = minSize * 0.2;
      if (radius > self.maxRoundRectRadius)
        radius = self.maxRoundRectRadius;
      self.activePath = self.updatePath(self.activePath, paper.Path.Rectangle(rect, radius));
      //self.activePath.selected = true;
      break;
    }
    case ToolEnum.Ellipse: {
      self.activePath = self.updatePath(self.activePath, paper.Path.Ellipse(new paper.Rectangle(self.startPoint, event.point)));
      //self.activePath.selected = true;
      break;
    }
    default:
    break;
    };
    self.doc.endChange();
  },

  addPath: function(path) {
    if (!path)
      path = new paper.Path();
    this.doc.shapeRoot.addPath(path);
    return path;
  },

  deletePath: function(path) {
    if (!path) return;
    this.doc.shapeRoot.removePath(path);
  },

  updatePath: function(oldPath, newPath) {
    if (oldPath)
      this.deletePath(oldPath);
    return this.addPath(newPath);
  },

  selectPath: function(path) {
    if (!path) {
      // select all
      var self = this;
      this.doc.shapeRoot.traverseShapes(false, function(shape) {
        if (shape.path)
          self.ss.addPath(shape.path);
      });
    } else {
      this.ss.addPath(path);
    }
  },

  deselectPath: function(path) {
    if (!path) {
      // deselect all
      this.ss.removeAll();
    } else {
      this.ss.removePath(path);
    }
  },

  removeSelection: function() {
    this.doc.beginChange();
    for (k in this.ss.items) {
      this.deletePath(this.ss.items[k].path);
    }
    this.deselectPath();
    this.doc.endChange();
  }

};

return {
  create: function(app) {
    return new Painter(app);
  }
};

});