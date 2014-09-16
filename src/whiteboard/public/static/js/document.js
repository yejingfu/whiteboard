define(['selectionset', 'util'], function(sslib, util) {

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
  },

  serializePath: function() {
    return this.path.exportJSON({asString: true, precision:5});
  },

  deserializePath: function(str) {
    if (this.path)
      this.path.remove();
    this.path = new paper.Path();
    this.path.importJSON(str);
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
      //shape.path.fillColor = propValue;
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
    var obj = this.shapeRoot.toJsonObject();
    this.sharedDocument.submitOp([{p:[], od:null, oi:obj}]);
  },
  
  loadSharedDocument: function() {
    var self = this;
    var snapshot = self.sharedDocument.snapshot;
    self.shapeRoot.fromJsonObject(snapshot);
    paper.view.update();
  },
  
  findInSnapshot: function(shape, snapshot) {
    for (var i = 0, count = snapshot.shapes.length; i < count; i++) {
      if (snapshot.shapes[i].key === shape.key) {
        return i;
      }
    }
    return -1;
  },

  pushSharedDeltaState: function() {
    var self = this;
    if (!self.sharedDocument)
      return;
    var snapshot = self.sharedDocument.snapshot;
    var len = snapshot.shapes.length;
    var delta;
    var idx;

    self.shapeRoot.addedShapes.forEach(function(shape) {
      delta = {p:['shapes', len++], li: shape.toJsonObject()};
      self.sharedDocument.submitOp([delta]);
    });
    self.shapeRoot.removedShapes.forEach(function(shape) {
      idx = self.findInSnapshot(shape, snapshot);
      if (idx >= 0) {
        delta = {p:['shapes', idx], ld: shape.toJsonObject()};
        //delta = {p:['shapes', shape.key], ld: shape.toJsonObject()};
        self.sharedDocument.submitOp([delta]);
      }
    });
    self.shapeRoot.updatedShapes.forEach(function(shape) {
      idx = self.findInSnapshot(shape, snapshot);
      if (idx >= 0) {
        if (shape.key in self.shapeRoot.shapes) {
          var realShape = self.shapeRoot.shapes[shape.key];
          //delta = {p:['shapes', idx], od:realShape[shape.name], oi:shape};
          delta = {p:['shapes', idx, 'path'], od: null, oi:realShape.serializePath()};
          self.sharedDocument.submitOp([delta]);
        }
      }
    });
  },
  
  pullSharedDeltaState: function(op) {
    var self = this;
    if (!self.sharedDocument || !op || op.length === 0)
      return;
    var updated = false;
    for (var i = 0, len = op.length; i < len; i++) {
      var path = op[i].p;
      var obj;
      if (path.length === 2) {
        var addedObj = op[i].li;
        var deletedObj = op[i].ld;
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
      } else if (path.length === 3) {
        var updatedObj = op[i].oi;
        var shapeInSnapshot;
        if (updatedObj && (shapeInSnapshot = self.sharedDocument.snapshot.shapes[path[1]])) {
          var realShape = self.shapeRoot.shapes[shapeInSnapshot.key];
          if (realShape) {
            realShape.deserializePath(updatedObj);
            updated = true;
          }
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