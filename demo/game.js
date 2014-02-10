// utility functions
function randRange(min, max) {
  return (Math.random() * (max - min + 1) + min) | 0;
}

function randChoice(list) {
  return list[Math.random() * list.length | 0];
}

// circle object
function Circle(radius, color, ui) {
  Game.GameObject.call(this);

  this.radius = radius || 10;
  this.color = color || "#08f";
  this.ui = ui;
}
Game.Utils.extend(Circle, Game.GameObject);

Circle.prototype.added = function(s) {
  Game.GameObject.prototype.added.call(this);
  if(!s) {
    throw new Error("Need to specify the SVG canvas.");
  }

  var bounds = s.node.getBoundingClientRect();
  var x = randRange(this.radius, bounds.width - this.radius);
  var y = randRange(this.radius, bounds.height - this.radius);
  var border = 3;

  var hsl = Snap.rgb2hsl(Snap.getRGB(this.color));
  hsl.l = hsl.l / 2.5;

  this.element = s.circle(x, y, this.radius - 2 * border);
  this.element.attr({
    fill: this.color,
    strokeWidth: border,
    stroke: Snap.hsl2rgb(hsl).hex
  });

  this.element.click(this.onClick.bind(this));
  this.element.hover(function(){
    this.attr({ strokeWidth: 2 * border });
  }, function(){
    this.attr({ strokeWidth: border });
  });
};

Circle.prototype.onClick = function(e) {
  this.element.remove();
  delete this.element;
  var avg = (this.ui.sizeRange[0] + this.ui.sizeRange[1]) / 2;
  var score = this.ui.colors[this.color] * (1.5 - 1/(1 + Math.exp(-(this.radius - avg)/4)));
  score |= 0;
  score *= this.ui.multiplier;
  this.fire('score', Math.max(score, 1));
  this.fire("destroy", { id: this.getId(), color: this.color, size: this.radius });
};

// UI class
function UI() {
  this.snap = new Snap("#svg");

  this.app = new Game.Application();
  this.app.init();
  this.app.listen(this.app.state, this.onEvent.bind(this));
  this.app.listen(this.app.achievements, this.onAchievement.bind(this));

  this.colors = {
    "#44f": 5,
    "#f44": 10,
    "#4f4": 20,
    "#c0c0c0": 60,
    "#ffd700": 120
  };
  this.sizeRange = [35, 70];

  this.multiplier = 1;

  this.circles = {};
  this.interval = null;
}

UI.prototype.onEvent = function(e) {
  if(e.type === 'create') {
    this.circles[e.data.getId()] = e.data;
  } else if(e.type === 'destroy') {
    this.app.state.removeObject(this.circles[e.data.id]);
    this.circles[e.data.id].destroy();
    delete this.circles[e.data.id];
  } else if(e.type === 'scoreChange') {
    document.getElementById("score").innerHTML = e.data;
  }
};

UI.prototype.onAchievement = function(e) {
  if(e.data.name.match(/^Total/)) {
    this.multiplier += 0.5;
    document.getElementById("multiplier").innerHTML = this.multiplier;
  }
  document.querySelector('li[data-name="' + e.data.name + '"]').classList.add("achieved");
};

UI.prototype.startGame = function() {
  // initialize achievements
  var achievements = {
    "Colorful": [ { name: "a:Blue-1" }, { name: "a:Red-1" }, { name: "a:Green-1" } ],
    "Super Colorful": [ { name: "a:Colorful" }, { name: "a:Silver-1" }, { name: "a:Gold-1" } ],
    "Mega Colorful": [ { name: "a:Blue-5" }, { name: "a:Red-4" }, { name: "a:Green-3" }, { name: "a:Silver-2" }, { name: "a:Gold-1" } ],
    "Quickfire": [ { name: "destroy", within: 1000, count: 3 } ],
    "Quickfire - One of Each": [ { name: "destroy", data: {color: "#4f4"}, within: 1000 }, { name: "destroy", data: {color: "#44f"}, within: 1000 }, { name: "destroy", data: {color: "#f44"}, within: 1000 } ],
    "Score-1": [ { name: "scoreChange", data: { $gte: 500 } } ],
    "Score-2": [ { name: "scoreChange", data: { $gte: 1500 } } ],
    "Score-3": [ { name: "scoreChange", data: { $gte: 3500 } } ]
  };

  [["Blue", "44f"], ["Red", "f44"], ["Green", "4f4"], ["Silver", "c0c0c0"], ["Gold", "ffd700"]].forEach(function(pair, i){
    var color = pair[0], hex = pair[1];
    for(var j = 0; j < 5-i; j++) {
      achievements[color + "-" + (j + 1)] = [ { name: "destroy", data: {color: "#" + hex}, count: 5 * Math.pow(2, j) } ];
    }
  });

  for(var i = 0; i < 7; i++) {
    achievements["Total-" + (i + 1)] = [ { name: "destroy", count: 10 * Math.pow(2, i) } ];
  }

  var aList = document.getElementById('achievements');

  Object.keys(achievements).forEach(function(name) {
    var reqs = achievements[name];
    this.app.achievements.addAchievement(name, reqs);

    var li = document.createElement('li');
    li.setAttribute('data-name', name);
    li.innerHTML = name;

    aList.appendChild(li);
  }, this);
  // initialize object appearances
  var colorNames = Object.keys(this.colors);
  var freqs = colorNames.map(function(k){ return 1 / this.colors[k]; }, this);
  var total = freqs.reduce(function(a,b){ return a+b; }, 0);

  function roulette() {
    var selection = Math.random() * total;
    var running = 0, i = 0;
    while(selection > running) {
      running += freqs[i];
      i++;
    }
    return colorNames[i - 1];
  }

  this.interval = setInterval(function() {
    if(Object.keys(this.circles).length > 20) {
      return;
    }
    var c = new Circle(randRange(this.sizeRange[0], this.sizeRange[1]), roulette(), this);
    this.app.state.addObject(c, this.snap);
  }.bind(this), 500);
};

var ui = new UI();
ui.startGame();