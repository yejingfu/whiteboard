define(['gear'], function(gearLib) {

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
  this.welcome = false;

  this.hitOptions = {
    segments: true,    // can select each segment within stroke/path
    stroke: true,      // can select stroke
    fill: true,        // can select fill
    tolerance: 3
  };

  this.sampleGears = [];
  this.animation = false;
};

Painter.prototype = {
  init: function(canvas) {
    console.log('Painter::init');
    this.canvas = canvas;
    paper.setup(this.canvas);
    this.initToolbar();
    paper.project.currentStyle = $.extend({}, this.defaultStyle);

  // show welcome
  this.welcome = new paper.PointText({
    point: [150, 150],
    content: 'Welcome!',
    fillColor: 'rgba(200, 200, 200, 0.4)',
    strokeColor: 'rgba(255, 200, 200, 0.6)',
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
          if (e.key === 'delete') {
            //debugger;
            if (e.event.shiftKey)
              self.removeAll();
            else
              self.removeSelection();
          }
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
    addToolbarItem('more', function() {
      console.log('TODO: zoomin');
      self.drawBaseGear();
    });
    addToolbarItem('setting', function() {
      console.log('TODO: setting');
      var ret = $('#gear-setting').modal();
      console.log('gear-setting: ' + ret);
    });
    addToolbarItem('play', function() {
      console.log('TODO: zoomout');
      self.playGearAnimation();
    });
    addToolbarSeparator();
    addToolbarItem('grid', function() {
      console.log('TODO: grid');
      self.drawGearSample();
    });
    addToolbarItem('ruler', function() {
      console.log('TODO: ruler');
      self.triggerGearAnimation();
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

    self.canvas.addEventListener('touchstart', function(e) {
    }, false);

    self.canvas.addEventListener('touchend', function(e) {
    }, false);

    self.canvas.addEventListener('touchmove', function(e) {
    });

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
          self.doc.shapeRoot.updateShapeItemProp(shape, 'fillColor', self.activeColor);
          self.doc.endChange();
          self.doc.beginChange();
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
        if (path.name && path.name.indexOf('gear-') === 0) {
          // move gear
          var gear = self.doc.shapeRoot.findGearByChildGroup(path);
          if (gear) {
            gear.moveDelta(event.delta);
          }
        } else {
          path.position = path.position.add(event.delta);
        }
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
    if (kind === ToolEnum.Pointer) {
      if (!event.point.equals(self.startPoint)) {
        for (var i in self.ss.items) {
          var path = self.ss.items[i].path;
          //path.position = path.position.add(event.delta);
          self.doc.shapeRoot.updatePathProp(path, 'position', path.position);
        }
      }
      self.doc.endChange();
      return;
    }
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
    if (path === this.welcome) {
      this.welcome.remove();
      this.welcome = null;
    } else {
        this.doc.shapeRoot.removePath(path);
    }
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
      var getRootItem = function(item) {
        var parent = item;
        while (parent.parent && !(parent.parent instanceof paper.Layer))
          parent = parent.parent;
        return parent;
      };
      this.ss.addPath(getRootItem(path));
    }
  },

  deselectPath: function(path) {
    if (!path) {
      // deselect all
      this.ss.removeAll();
      // workaround
      this.doc.shapeRoot.traverseShapes(false, function(shape) {
        if (shape.path && shape.path.selected)
        shape.path.selected = false;
      });
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
  },

  removeAll: function() {
    this.deselectPath();
    //1, paper.project.clear();
    // 2, 
    // this.doc.beginChange();
    // this.doc.shapeRoot.removeAllShapeItems();
    // this.doc.endChange();
    // 3,
    while (this.doc.shapeRoot.count() > 0) {
      this.doc.beginChange();
      this.doc.shapeRoot.removeFirstItem();
      this.doc.endChange();
    }
  },

  drawBaseGear: function() {
    var self = this;
    self.doc.beginChange();
    var p = new paper.Point(this.canvas.width / 3, this.canvas.height / 3);
    var gear = gearLib.createGear(p, 9, '#ff0ff0', 30, true);
    self.doc.shapeRoot.gears.push(gear);
    self.addPath(gear);
    self.doc.endChange();
  },

  drawGearSample: function() {
    if (this.sampleGears.length > 0)
      return;
    var width = this.canvas.width;
    var height = this.canvas.height;
    var config = [{'numTeeth': 15, 'color': '#ee2a33', 'angle':0},   // red
        {'numTeeth': 4, 'color': '#00aeef', 'angle': 102},       // blue  (100)
        {'numTeeth': 41, 'color': '#52b755', 'angle': 52},     //green
        {'numTeeth': 6, 'color': '#d03c3a', 'angle': 320},      // dark red (324)
        {'numTeeth': 9, 'color': '#f00ff0', 'angle': 30},       // light purple
        {'numTeeth': 4, 'color': '#fec01e', 'angle': 298},      // yellow
        {'numTeeth': 21, 'color': '#e0cb61', 'angle': 248},     // beige
        {'numTeeth': 11, 'color': '#f69c9f', 'angle': 214},     // pink (210)
        {'numTeeth': 8, 'color': '#157d6b', 'angle': 124}/*,   //dark green
        {'numTeeth': 11, 'color': '#52b755', 'angle':0}*/   // orange
    ];

    var p = new paper.Point(width / 7, height / 3 + 30);
    var clockwise = true;
    var speed = 0.75;
    var gear = gearLib.createGear(p, config[0].numTeeth, config[0].color, speed, clockwise);   // red
    this.sampleGears.push(gear);
    clockwise = !clockwise;
    var ret = {'point': p, 'gear': gear, 'speed': speed};
    for (var i = 1, len = config.length; i < len; i++) {
      ret = this.addGear(ret.point, ret.gear, config[i].numTeeth, config[i].color, ret.speed, config[i].angle, clockwise);
      clockwise = !clockwise;
    }
  },

  addGear: function(pt, gear, g2, color, speed, angle, clockwise) {
    var scale = gearLib.defaultScale;
    var size = gearLib.defaultToothSize;
    var r1 = gear.teethCount * scale / 2;
    var r2 = g2 * scale / 2;
    var p2 = new paper.Point(pt.x + ((r1 + r2 + size - 2) * Math.cos((angle / 180)*Math.PI)),
        pt.y + ((r1 + r2 + size - 2) * Math.sin(angle/180 * Math.PI)));
    var dupGear = gearLib.createGear(p2, g2, color, speed * gear.teethCount / g2, clockwise);
    this.sampleGears.push(dupGear);
    // rotate
    var wedge = 360 / gear.teethCount;
    var tooth = Math.floor((angle - gear.rotation) / wedge);
    var t = 2 * Math.PI * tooth / gear.teethCount;
    var x = Math.round((r1 + size / 1.85) * Math.cos(t));
    var y = Math.round((r1 + size / 1.85) * Math.sin(t));
    var rad = gear.rotation * Math.PI / 180;
    var x1 = (Math.cos(rad) * x) - (Math.sin(rad) * y);
    var y1 = (Math.cos(rad) * y) - (Math.sin(rad) * x);
    x = x1;
    y = y1;
    var pa1 = new paper.Point(gear.pos.x + x, gear.pos.y + y);
    t = 2 * Math.PI * 0.5 / dupGear.teethCount;
    x = Math.round(r2 * Math.cos(t));
    y = Math.round(r2 * Math.sin(t));
    var pad = new paper.Point(dupGear.pos.x + x, dupGear.pos.y + y);
    var pa2 = dupGear.pos;
    var v = pa1.subtract(pa2);
    var v2 = pad.subtract(pa2);
    dupGear.rotate(v.angle - v2.angle);
    return {
      'point': p2,
      'speed': speed * gear.teethCount / g2,
      'gear': dupGear
    }
  },

  triggerGearAnimation: function() {
    var self = this;
    var _animation = function() {
      if (self.animation) {
        requestAnimationFrame(_animation);
        for (var i = 0, len = self.sampleGears.length; i < len; i++) {
          self.sampleGears[i].spin();
        }
        paper.project.view.update();
      }
    };
    self.animation = !self.animation;
    if (self.animation)
      _animation();
  },
  
  playGearAnimation: function() {
    var self = this;
    var _animation = function() {
      if (self.animation) {
        requestAnimationFrame(_animation);
        for (var i = 0, len = self.doc.shapeRoot.gears.length; i < len; i++) {
          self.doc.shapeRoot.gears[i].spin();
        }
        paper.project.view.update();
      }
    };
    self.animation = !self.animation;
    if (self.animation)
      _animation();
  },
};

return {
  create: function(app) {
    return new Painter(app);
  }
};


});