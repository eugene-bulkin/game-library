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
  var border = 2;

  this.element = s.circle(x, y, this.radius - 2 * border);
  this.element.attr({
    fill: this.color,
    strokeWidth: border,
    stroke: "#000"
  });

  this.element.click(this.onClick.bind(this));
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
  console.log("'" + e.data.name + "' achieved!");
}

var s = new Snap("#svg");

var game = new Game.Application();
game.init();

game.listen(game.state, onEvent);

game.listen(game.achievements, onAchievement);

var achievements = {
  "5 Blues": [ { name: "destroy", data: {color: "#44f"}, count: 5 } ],
  "5 Reds": [ { name: "destroy", data: {color: "#f44"}, count: 5 } ],
  "5 Greens": [ { name: "destroy", data: {color: "#4f4"}, count: 5 } ],
  "Quickfire": [ { name: "destroy", within: 1000, count: 3 } ]
};

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
  "#44f": 1,
  "#f44": 2,
  "#4f4": 3
};

var interval = setInterval(function() {
  if(Object.keys(circles).length > 15) {
    return;
  }
  var c = new Circle(randRange(25, 60), randChoice(Object.keys(colors)));
  game.state.addObject(c, s);
}, 750);