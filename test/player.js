var Game = require('../build/game-library').Game;

var Player = function() {
  Game.Object.call(this);

  this.hp = 100;
  this.mp = 50;
};
Game.Utils.extend(Player, Game.Object, true);

Player.prototype.useMP = function(amt) {
  if(amt > this.mp) {
    this.fire('useMP_fail', { amount: amt, curMP: this.mp });
    return false;
  }
  this.mp -= amt;
  this.fire('useMP', { amount: amt, curMP: this.mp });
  return true;
};
Player.prototype.damage = function(amt) {
  if(amt > this.hp) {
    this.hp = 0;
  } else {
    this.hp -= amt;
  }
  this.fire('damage', { amount: amt, curHP: this.hp });
  return true;
};

module.exports = Player;