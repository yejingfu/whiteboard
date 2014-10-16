define(function() {

  var gSpeed = 0.75;
  var gScale = 15;
  var gToothSize = 28;
  var gClockwise = false;

  var gWidth = 720;
  var gHeight = 600;
  var started = true;

  var Gear = function() {
    this.group = new paper.Group();
    this.speed = gSpeed;
    this.clockwise = gClockwise;
    this.pos = null;
    this.teethCount = 0;
    this.rotation = 0.0;
  };

  Gear.prototype = {
    init: function(pt, numOfTeeth, color, speed, clockwise) {
      this.pos = pt.clone();
      this.speed = speed || this.speed;
      this.clockwise = clockwise || this.clockwise;
      var d = numOfTeeth * gScale;
      var outerCircle = new paper.Path.Circle(pt, d / 2);
      outerCircle.fillColor = color;
      var innerCircle = new paper.Path.Circle(pt, d / 8);
      innerCircle.fillColor = 'white';
      this.group.addChild(this.drawTeeth(d/2-5, d/gScale, color));
      this.group.addChild(outerCircle);
      this.group.addChild(innerCircle);
    },

    drawTeeth: function(d, plots, c) {
      var createToothSymbol = function(color) {
        var path = new paper.Path();
        path.add(new paper.Point(-(gToothSize / 4) + 2, -(gToothSize / 2)));  // upper left
        path.add(new paper.Point((gToothSize / 4) - 2, -(gToothSize / 2)));  //upper right
        var throughPoint = new paper.Point(gToothSize / 4, -(gToothSize / 2) + 4);
        var toPoint = new paper.Point(gToothSize / 2, gToothSize / 2);
        path.arcTo(throughPoint, toPoint);  // curve to bottom right 
        path.add(new paper.Point(-(gToothSize / 2), gToothSize / 2));  // bottom left
        throughPoint = new paper.Point(-(gToothSize / 4), -(gToothSize / 2) + 4);
        toPoint = new paper.Point(-(gToothSize / 4) + 2, -(gToothSize / 2));
        path.arcTo(throughPoint, toPoint);  // curve to top left
        path.closePath();
        path.fillColor = color;
        return new paper.Symbol(path);
      };
      var increase = Math.PI * 2 / plots;
      var angle = 0;
      var teeth = new paper.Group();
      var symbol = createToothSymbol(c);
      for (var i = 0; i < plots; i++) {
        var t = 2 * Math.PI * i / plots;
        var x = Math.round((d + gToothSize / 2) * Math.cos(t));
        var y = Math.round((d + gToothSize / 2) * Math.sin(t));
        var placed = symbol.place(new paper.Point(this.pos.x + x, this.pos.y + y));
        placed.rotate(180 / Math.PI * angle + 90);
        teeth.addChild(placed);
        angle += increase;
      }
      this.teethCount = plots;
      return teeth;
    },

    rotate: function(angle) {
      this.group.rotate(angle);
      this.rotation += angle;
    },

    spin: function() {
      if (this.clockwise) {
        this.group.rotate(this.speed);
      } else {
        this.group.rotate(-this.speed);
      }
    }
  };

  return {
    createGear: function(pt, NumOfTeeth, color, speed, clockwise) {
      var g = new Gear();
      g.init(pt, NumOfTeeth, color, speed, clockwise);
      return g;
    },

    isGearType: function(obj) {
      return (obj instanceof Gear);
    },

    defaultScale: gScale,
    defaultToothSize: gToothSize
  };

});
