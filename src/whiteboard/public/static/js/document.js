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
  
  addShapeItem: function(shape) {
    var id = shape.key;
    if (!(id in this.shapes)) {
      this.shapes[id] = shape;
      var idx = this.findInArray(shape, this.removedShapes);
      if (idx >= 0) {
        this.removedShapes.splice(idx, 1);
      }
      this.addedShapes.push(shape);
    }
  },
  
  removeShapeItem: function(id) {
    if (id in this.shapes) {
      var idx = this.findInArray(this.shapes[id], this.addedShapes);
      if (idx >= 0) {
        this.addedShapes.splice(idx, 1);
      }
      this.removedShapes.push(this.shapes[id]);
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
  
  // sharejs stuffs
  this.sharedDocument = null;
  this.sharedDelta = null;
};

Document.prototype = {
  beginChange: function() {
    console.log('Document::beginChange');
    this.shapeRoot.addedShapes.length = 0;
    this.shapeRoot.removedShapes.length = 0;
  },

  endChange: function() {
    console.log('Document::endChange');
    this.pushSharedDeltaState();
  },
  
  initSharedDocument: function(key) {
    var self = this;
    if (!key)
      key = SharedChannelKey;
    debugger;
    //sharejs.open('abc', 'text', function(err, doc) {
    sharejs.open(key, 'json', function(err, doc) {
      debugger;
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
    var snapshot = self.sharedDocument.snapshot;
    this.shapeRoot.fromJsonObject(snapshot);
  },
  
  pushSharedDeltaState: function() {
    var snapshot = this.sharedDocument.snapshot;
    var len = snapshot.shapes.length;
  },
  
  pullSharedDeltaState: function(op) {
    var self = this;
    if (!op || op.length === 0)
      return;
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