class Game.State extends Game.TwoWay
  constructor: () ->
    @objects = {}
    @eventCounters = {}
    super
  onEvent: (e) ->
    # Add timestamped instance to the event counters object
    if e.type not of @eventCounters
      @eventCounters[e.type] = []
    @eventCounters[e.type].push new Date()
    # relay the event upward
    @fire(e)
  addObject: (obj) ->
    if obj not instanceof Game.Object
      throw new Game.Error(Game.Error.ErrorType.NOT_OBJECT)
    if obj.getId() of @objects
      throw new Game.Error(Game.Error.ErrorType.ALREADY_ADDED)
    @objects[obj.getId()] = obj
    @listen(obj, @onEvent)
    # call object added method
    obj.added()