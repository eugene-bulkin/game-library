var Game = require('../build/game-library').Game;
var expect = require('chai').expect;

describe('Setup', function() {
  var game = new Game.Application();
  it('Should be able to initialize Application', function() {
    game.init();
  });
  it('Should have a state variable', function() {
    expect(game.state).to.exist;
  });
  it('Should have an achievements variable', function() {
    expect(game.achievements).to.exist;
  });
});