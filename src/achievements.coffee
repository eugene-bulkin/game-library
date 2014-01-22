class Game.Achievements extends Game.TwoWay
  constructor: (@state) ->
    super
    @achievements = {}