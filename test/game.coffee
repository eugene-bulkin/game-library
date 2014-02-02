Game = require('../build/game-library').Game
expect = require('chai').expect

describe 'Setup', ->
  game = new Game.Application()
  it 'Should be able to initialize Application', ->
    game.init()
  it 'Should have a state variable', ->
    expect(game.state).to.exist
  it 'Should have an achievements variable', ->
    expect(game.achievements).to.exist