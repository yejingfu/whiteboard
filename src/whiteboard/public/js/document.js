define(['selectionset'], function(sslib) {

var ShapeItemType = {
  Line: 'line',
  Rectangle: 'rectangle',
  RoundRect: 'roundrect',
  Ellipse: 'ellipse'
};

var ShapeItem = function(path) {
  this.path = path;
};

ShapeItem.prototype = {
  
};

var ShapeRoot = function(doc) {
  this.doc = doc;
  this.shapes = {};
};

ShapeRoot.prototype = {
  addPath: function(path) {
    if (!this.existPath(path)) {
      var shape = new ShapeItem(path);
      this.shapes[path.id] = shape;
    }
  },

  removePath: function(path) {
    delete this.shapes[path.id];
  },

  existPath: function(path) {
    return this.shapes[path.id] ? true : false;
  },

  traverseShapes: function(inversed, cb) {
    var ids = Object.keys(this.shapes);
    var id;
    var stop = false;
    for (var i = 0, len = ids.length; !stop && i < len; i++) {
      if (inversed)
        id = ids[len - i -1];
      else
        id = ids[i];
      stop = cb(this.shapes[id]);
    }
  }
};

var Document = function(app) {
  this.application = app;
  this.shapeRoot = new ShapeRoot(this);
  this.ss = new sslib.createSelectionSet();
};

Document.prototype = {
  beginChange: function() {
    console.log('Document::beginChange');
  },

  endChange: function() {
    console.log('Document::endChange');
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