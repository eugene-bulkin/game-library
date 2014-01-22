Game = require('../build/game-library').Game
expect = require('chai').expect

describe 'Achievements', ->
  game = new Game.Application()
  game.init()
  {state, achievements} = game