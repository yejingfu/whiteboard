define(['selectionset', 'util'], function(sslib, util) {

var ShapeItemType = {
  Line: 'line',
  Rectangle: 'rectangle',
  RoundRect: 'roundrect',
  Ellipse: 'ellipse'
};

var SharedChannelKey = "46a910fc-d481-41e1-b06c-26cb9a9e62c4";

var ShapeItem = function(path, key) {
  this.path = path;
  this.key = key || util.uniqueID();
};

ShapeItem.prototype = {
  toJsonObject: function() {
    return {
      'key': this.key,
      'path': this.path.exportJSON({asString:true, precision:5})
    };
  },
  
  fromJsonObject: function(obj) {
    this.key = obj.key;
    this.path = new paper.Path();
    this.path.importJSON(obj.path);
  }
};

var ShapeRoot = function(doc) {
  this.doc = doc;
  this.shapes = {};

  this.addedShapes = [];
  this.removedShapes = [];
  this.updatedShapes = [];
};

ShapeRoot.prototype = {
  addPath: function(path) {
    if (!this.existPath(path)) {
      var shape = this.addShapeItem(new ShapeItem(path));
      return shape;
    }
  },

  removePath: function(path) {
    var item;
    this.traverseShapes(false, function(shape) {
      if (shape.path === path) {
        item = shape;
        return true;
      }
    });
    if (item)
      this.removeShapeItem(item.key);
  },

  updatePath: function(path, propName, propValue) {
    var item;
    this.traverseShapes(false, function(shape) {
      if (shape.path === path) {
        item = shape;
        return true;
      }
    });
    if (item)
      this.updateShapeItem(item, propName, propValue);
  },
  
  addShapeItem: function(shape) {
    var id = shape.key;
    if (!(id in this.shapes)) {
      this.shapes[id] = shape;
      if (this.doc.isChanging) {
        var idx = this.findInArray(shape, this.removedShapes);
        if (idx >= 0) {
          this.removedShapes.splice(idx, 1);
        }
        this.addedShapes.push(shape);
      }
    }
  },

  updateShapeItem: function(shape, propName, propValue) {
    var id = shape.key;
    if (id in this.shapes) {
      shape.path[propName] = propValue;
      if (this.doc.isChanging) {
          this.updatedShapes.push({'key': shape.key, 'name':propName, 'value':propValue});
      }
    }
  },
  
  removeShapeItem: function(id) {
    if (id in this.shapes) {
      if (this.doc.isChanging) {
        var idx = this.findInArray(this.shapes[id], this.addedShapes);
        if (idx >= 0) {
          this.addedShapes.splice(idx, 1);
        }
        this.removedShapes.push(this.shapes[id]);
      }
      this.shapes[id].path.remove();
      delete this.shapes[id];
    }
  },
  
  findInArray: function(item, items) {
    for (var i = 0, len = items.length; i < len; i++) {
      if (item === items[i])
        return i;
    }
    return -1;
  },

  existPath: function(path) {
    var exist = false;
    this.traverseShapes(false, function(shape) {
      if (shape.path === path) {
        exist = true;
        return true;
      }
    });
  },

  existShapeItem: function(item) {
    var key;
    if (item instanceof ShapeItem)
      key = item.key;
    else 
      key = item;
    var exist = false;
    this.traverseShapes(false, function(shape) {
      if (shape.key === key) {
        exist = true;
        return true;
      }
    });
    return exist;
  },

  traverseShapes: function(inversed, cb) {
    var ks = Object.keys(this.shapes);
    var k;
    var stop = false;
    for (var i = 0, len = ks.length; !stop && i < len; i++) {
      if (inversed)
        k = ks[len - i -1];
      else
        k = ks[i];
      stop = cb(this.shapes[k]);
    }
  },
  
  toJsonObject: function() {
    var obj = {};
    obj.shapes = [];
    this.traverseShapes(false, function(shape) {
      if (shape instanceof ShapeItem) {
        obj.shapes.push(shape.toJsonObject());
      }
    })
    return obj;
  },
  
  fromJsonObject: function(obj) {
    if (!obj || !obj.shapes) {
      return;
    }
    var shapes = obj.shapes;
    for (var i = 0, len = shapes.length; i < len; i++) {
      var shape = new ShapeItem();
      shape.fromJsonObject(shapes[i]);
      this.addShapeItem(shape);
    }
  }
};

var Document = function(app) {
  this.application = app;
  this.shapeRoot = new ShapeRoot(this);
  this.ss = new sslib.createSelectionSet();
  this.isChanging = false;
  
  // sharejs stuffs
  this.sharedDocument = null;
  this.shapeKeys = null;
};

Document.prototype = {
  beginChange: function() {
    console.log('Document::beginChange');
    this.shapeRoot.addedShapes.length = 0;
    this.shapeRoot.removedShapes.length = 0;
    this.shapeRoot.updatedShapes.length = 0;
    this.shapeKeys = {};
    for (k in this.shapeRoot.shapes) {
      this.shapeKeys[k] = true;
    }
    this.isChanging = true;
  },

  endChange: function() {
    console.log('Document::endChange');
    for (var len = this.shapeRoot.addedShapes.length, i = len - 1; i >= 0; i--) {
      var k = this.shapeRoot.addedShapes[i].key;
      if (this.shapeKeys[k])
        this.shapeRoot.addedShapes.splice(i, 1);
    }
    for (var len = this.shapeRoot.removedShapes.length, i = len - 1; i >= 0; i--) {
      var k = this.shapeRoot.removedShapes[i].key;
      if (!this.shapeKeys[k]) {
        this.shapeRoot.removedShapes.splice(i, 1);
      }
    }
    this.pushSharedDeltaState();
    this.isChanging = false;
  },
  
  initSharedDocument: function(key) {
    var self = this;
    if (!key)
      key = SharedChannelKey;
    sharejs.open(key, 'json', function(err, doc) {
      if (err) {
        console.error('Failed to setup sharejs connection: ' + err);
        return;
      }
      self.sharedDocument = doc;
      self.sharedDocument.on('change', function(op) {
        console.log('sharejs document changed: ' + JSON.stringify(op));
        self.pullSharedDeltaState(op);
      });
      
      if(self.sharedDocument.created) {
        // The shared document is created at first time on server side.
        self.saveSharedDocument();
      } else {
        // The shared document is already created on server side.
        self.loadSharedDocument();
      }
    });
  },
  
  saveSharedDocument: function() {
    debugger;
    var obj = this.shapeRoot.toJsonObject();
    this.sharedDocument.submitOp([{p:[], od:null, oi:obj}]);
  },
  
  loadSharedDocument: function() {
    debugger;
    var self = this;
    var snapshot = self.sharedDocument.snapshot;
    self.shapeRoot.fromJsonObject(snapshot);
    paper.view.update();
  },
  
  pushSharedDeltaState: function() {
    var self = this;
    var snapshot = self.sharedDocument.snapshot;
    var len = snapshot.shapes.length;
    var delta;
    self.shapeRoot.addedShapes.forEach(function(shape) {
      delta = {p:['shapes', len++], li: shape.toJsonObject()};
      self.sharedDocument.submitOp([delta]);
    });
    self.shapeRoot.removedShapes.forEach(function(shape) {
      delta = {p:['shapes', 0], ld: shape.toJsonObject()};
      self.sharedDocument.submitOp([delta]);
    });
    self.shapeRoot.updatedShapes.forEach(function(shape) {
      debugger;
      if (shape.key in self.shapeRoot.shapes) {
        var realShape = self.shapeRoot.shapes[shape.key];
        delta = {p:['shapes', 'update'], ld:realShape[shape.name], li:shape};
        self.sharedDocument.submitOp([delta]);
      }
    });
  },
  
  pullSharedDeltaState: function(op) {
    debugger;
    var self = this;
    if (!op || op.length === 0)
      return;
    var updated = false;
    for (var i = 0, len = op.length; i < len; i++) {
      var path = op[i].p;
      var addedObj = op[i].li;
      var deletedObj = op[i].ld;
      var obj;
      if (path.length === 2) {
         if(path[0] === 'shapes' && path[1] !== 'update') {
          if (addedObj && !self.shapeRoot.existShapeItem(addedObj.key)) {
            var shapeItem = new ShapeItem();
            shapeItem.fromJsonObject(addedObj);
            self.shapeRoot.addShapeItem(shapeItem);
            updated = true;
          }
          if (deletedObj && self.shapeRoot.existShapeItem(deletedObj.key)) {
            self.shapeRoot.removeShapeItem(deletedObj.key);
            updated = true;
          }
        } else if (path[0] === 'shapes' && path[1] === 'update') {
          updated = true;
        }
      }
    }
    if (updated)
      paper.view.update();
  }

};

return {
  createDocument: function(app) {
    return new Document(app);
  },

  createShapeItem: function(path) {
    return new ShapeItem(path);
  }
}

});