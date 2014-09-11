define(function() {

var incrementalId = 0;

var SelectionItem = function(path, segment, type, id) {
  this.path = path;
  this.segment = segment;
  this.type = type;
  this.id = id || (++incrementalId);
};

SelectionItem.prototype = {

};

var SelectionSet = function() {
  this.items = {};
};

SelectionSet.prototype = {
  add: function(item) {
    if (item.id in this.items) {
      //console.error('Failed to add item, the item already exists:' + item.id);
      return;
    }
    this.items[item.id] = item;
    if (item.path)
      item.path.selected = true;
  },

  remove: function(id) {
    if (this.items[id]) {
      if (this.items[id].path) {
        this.items[id].path.selected = false;
      }
      delete this.items[id];
    }
  },

  addPath: function(path) {
    var item = new SelectionItem(path, null, null, 'path:' + path.id);
    this.add(item);
  },

  removePath: function(path) {
    this.remove('path:'+path.id);
  },

  removeAll: function() {
    var id;
    for (id in this.items) {
      if (this.items[id].path)
        this.items[id].path.selected = false;
    }
    this.items = {};
  },

  empty: function() {
    return Object.keys(this.items).length === 0;
  }
};

return {
  createItem: function(path, segment, type) {
    return new SelectionItem(path, segment, type, 'path:'+path.id);
  },

  createSelectionSet: function() {
    return new SelectionSet();
  }
};

});