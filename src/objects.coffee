class Game.Object extends Game.Publisher
  constructor: () ->
    super
  added: () ->
    @fire('create')