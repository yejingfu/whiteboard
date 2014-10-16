define(['selectionset', 'util', 'gear'], function(sslib, util, gearLib) {

var ShapeItem = function(path, key) {
  this.path = path;
  this.key = key || util.uniqueID();
  if (gearLib.isGearType(path))
    this.key = 'gear-' + this.key;
};

ShapeItem.prototype = {
  toJsonObject: function() {
    var jsonStr = '';
    if (this.key.indexOf('gear-') >= 0)
      jsonStr = this.path.group.exportJSON({asString: true, precision: 5});
    else
      jsonStr = this.path.exportJSON({asString:true, precision:5});

    return {
      'key': this.key,
      'path': jsonStr
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
  count: function() {
    return Object.keys(this.shapes).length;
  },

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
      if (this.doc.isChanging) {
        var idx = this.findInArray(shape, this.removedShapes);
        if (idx >= 0) {
          this.removedShapes.splice(idx, 1);
        }
        this.addedShapes.push(shape);
      }
    }
  },
  
  updatePathProp: function(path, propName, propValue, isPulling) {
    var item;
    this.traverseShapes(false, function(shape) {
      if (shape.path === path) {
        item = shape;
        return true;
      }
    });
    if (item)
      this.updateShapeItemProp(item, propName, propValue, isPulling);
  },
  
  updatePropByShapeId: function(shapeId, propName, propValue, isPulling) {
    var item;
    this.traverseShapes(false, function(shape) {
      if (shape.key === shapeId) {
        item = shape;
        return true;
      }
    });
    if (item)
      this.updateShapeItemProp(item, propName, propValue, isPulling);
  },

  updateShapeItemProp: function(shape, propName, propValue, isPulling) {
    var id = shape.key;
    var propValueStr;
    if (typeof propValue === 'string')
      propValueStr = propValue;
    else
      propValueStr = JSON.stringify(propValue);
      if (id in this.shapes) {
      if (propName === 'position') {
        if (propValue instanceof paper.Point) {
          shape.path[propName] = propValue;
        } else {
          var obj = JSON.parse(propValue);
          var pt = new paper.Point(obj[1], obj[2]);
          shape.path[propName] = pt;
        }
      } else {
        shape.path[propName] = propValue;
      }
      if (this.doc.isChanging && !isPulling) {
          this.updatedShapes.push({'key': shape.key, 'name':propName, 'value':propValueStr});
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

  removeAllShapeItems: function() {
    for (id in this.shapes) {
      this.removedShapes.push(this.shapes[id]);
      this.shapes[id].path.remove();
      delete this.shapes[id];
    }
  },

  removeFirstItem: function() {
    var ks = Object.keys(this.shapes);
    if (ks.length === 0)
      return;
    this.removeShapeItem(ks[0]);
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
    var shapes = [];
    this.traverseShapes(false, function(shape) {
      if (shape instanceof ShapeItem) {
        shapes.push(shape.toJsonObject());
      }
    })
    return shapes;
  },
  
  fromJsonObject: function(shapes) {
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
    if (!key || key === '')
      key = 'unknown';
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
    //var obj = this.shapeRoot.toJsonObject();
    //this.sharedDocument.submitOp([{p:[], od:null, oi:obj}]);
    var obj = {'shapes': this.shapeRoot.toJsonObject(), 'updates': []};
    this.sharedDocument.submitOp([{p:[], od:null, oi:obj}]);
  },
  
  loadSharedDocument: function() {
    var self = this;
    var snapshot = self.sharedDocument.snapshot;
    self.shapeRoot.fromJsonObject(snapshot.shapes);
    // updating...
    for (var i = 0, len = snapshot.updates.length; i < len; i++) {
      self.updateShapeProperty(snapshot.updates[len - i - 1]);
    }
    paper.view.update();
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
        //delta = {p:['shapes', idx], ld: shape.toJsonObject()};
        delta = {p:['shapes', idx], ld: null};
        //delta = {p:['shapes', shape.key], ld: shape.toJsonObject()};
        self.sharedDocument.submitOp([delta]);
      }
    });
    self.shapeRoot.updatedShapes.forEach(function(shape) {
      idx = self.findInSnapshot(shape, snapshot);
      if (idx >= 0) {
        if (shape.key in self.shapeRoot.shapes) {
          //var realShape = self.shapeRoot.shapes[shape.key];
          //var jsonVal = JSON.stringify(shape);
          delta = {p:['updates', 0], li:shape};
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
      if (path.length === 2 && path[0] === 'shapes') {
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
      } else if (path.length === 2 && path[0] === 'updates') { //else if (path.length === 3) {
        //var updatedObj = JSON.parse(op[i].oi);
        var updatedObj = op[i].li;//JSON.parse(op[i].li);
        var shapeInSnapshot;
        var realShape;
        //if (updatedObj && (shapeInSnapshot = self.sharedDocument.snapshot.shapes[path[1]])) {
        if (updatedObj && (null !== self.shapeRoot.shapes[updatedObj.key])) {
          //var realShape = self.shapeRoot.shapes[shapeInSnapshot.key];
          //realShape.deserializePath(updatedObj);
          //realShape.updateProperty(updatedObj);
          //self.shapeRoot.updatePropByShapeId(updatedObj.key, updatedObj.name, updatedObj.value, true);
          self.updateShapeProperty(updatedObj);
          updated = true;
        }
      }
    }
    if (updated)
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
  
  updateShapeProperty: function(updateData) {
    var self = this;
    if (updateData && (null !== self.shapeRoot.shapes[updateData.key])) {
      self.shapeRoot.updatePropByShapeId(updateData.key, updateData.name, updateData.value, true);
    }
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