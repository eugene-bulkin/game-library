class Game.Achievements extends Game.TwoWay
  constructor: (@state) ->
    super
    @achievements = {}
    @listen(@state, @onEvent)
  onEvent: (e) ->
    console.log e.type, e.data, new Date().getTime()
  hasAchieved: (name) ->
    false
  addAchievement: (name, requirements) ->
    return