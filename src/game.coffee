class Game.Application extends Game.Observer
  constructor: () ->
    super
  init: () ->
    @state = new Game.State()
    @achievements = new Game.Achievements(@state)
    return