function randRange(min, max) {
  return (Math.random() * (max - min + 1) + min) | 0;
}

function randChoice(list) {
  return list[Math.random() * list.length | 0];
}

function Circle(radius, color) {
  Game.GameObject.call(this);

  this.radius = radius || 10;
  this.color = color || "#08f";
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
  this.fire("destroy", { id: this.getId(), color: this.color, size: this.radius });
};

var circles = {};

function onEvent(e) {
  if(e.type === 'create') {
    circles[e.data.getId()] = e.data;
  } else if(e.type === 'destroy') {
    delete circles[e.data.id];
  }
}

function onAchievement(e) {
  document.querySelector('li[data-name="' + e.data.name + '"]').classList.add("achieved");
}

var s = new Snap("#svg");

var game = new Game.Application();
game.init();

game.listen(game.state, onEvent);

game.listen(game.achievements, onAchievement);

var achievements = {
  "Colorful": [ { name: "a:Blue-1" }, { name: "a:Red-1" }, { name: "a:Green-1" } ],
  "Super Colorful": [ { name: "a:Colorful" }, { name: "a:Silver-1" }, { name: "a:Gold-1" } ],
  "Quickfire": [ { name: "destroy", within: 1000, count: 3 } ],
  "Quickfire - One of Each": [ { name: "destroy", data: {color: "#4f4"}, within: 1000 }, { name: "destroy", data: {color: "#44f"}, within: 1000 }, { name: "destroy", data: {color: "#f44"}, within: 1000 } ]
};

[["Blue", "44f"], ["Red", "f44"], ["Green", "4f4"], ["Silver", "c0c0c0"], ["Gold", "ffd700"]].forEach(function(pair, i){
  var color = pair[0], hex = pair[1];
  var max = (color === "Gold") ? 1 : (color === "Silver") ? 2 : 4;
  for(var j = 0; j < 5-i; i++) {
    achievements[color + "-" + (j + 1)] = [ { name: "destroy", data: {color: "#" + hex}, count: 5 * Math.pow(2, j) } ];
  }
});

var aList = document.getElementById('achievements');

Object.keys(achievements).forEach(function(name) {
  var reqs = achievements[name];
  game.achievements.addAchievement(name, reqs);

  var li = document.createElement('li');
  li.setAttribute('data-name', name);
  li.innerHTML = name;

  aList.appendChild(li);
});

var colors = {
  "#44f": 5,
  "#f44": 10,
  "#4f4": 20,
  "#c0c0c0": 65,
  "#ffd700": 130
};
var colorNames = Object.keys(colors);
var freqs = colorNames.map(function(k){ return 1 / colors[k]; });
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

var interval = setInterval(function() {
  if(Object.keys(circles).length > 15) {
    return;
  }
  var c = new Circle(randRange(25, 60), roulette());
  game.state.addObject(c, s);
}, 750);