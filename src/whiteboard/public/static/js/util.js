define(function() {

var Util = {
  hello: function() {
    return 'Hello World';
  },

  uniqueID: function() {
    // var t = Math.random();
    // var s = t.toString(36);
    // return s.substr(2, 9);
    return Math.random().toString(36).substr(2, 9);
  }

};

return Util;

});