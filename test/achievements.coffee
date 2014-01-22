Game = require('../build/game-library').Game
expect = require('chai').expect

describe 'Achievements', ->
  game = new Game.Application()
  game.init()
  state = game.state
  achievements = game.achievements
  observer = new Game.Observer()
  events = []
  callback = (e) ->
    events.push e
  observer.listen(achievements, callback)