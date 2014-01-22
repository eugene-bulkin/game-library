class Game.Application
  constructor: () ->
  init: () ->
    @state = new Game.State()
    @achievements = new Game.Achievements(@state)
    return