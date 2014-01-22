class Game.State extends Game.TwoWay
  constructor: () ->
    @objects = {}
    @eventCounters = {}
    @eventHandlers = {}
    super
  onEvent: (e) ->
    # Add timestamped instance to the event counters object
    if e.type not of @eventCounters
      @eventCounters[e.type] = []
    @eventCounters[e.type].push new Date()
    # relay the event upward
    @fire(e)
    # call added callbacks
    @eventHandlers[e.type].forEach (cb) -> cb()
    return
  addObject: (obj) ->
    if obj not instanceof Game.Object
      throw new Game.Error(Game.Error.ErrorType.NOT_OBJECT)
    if obj.getId() of @objects
      throw new Game.Error(Game.Error.ErrorType.ALREADY_ADDED)
    @objects[obj.getId()] = obj
    @listen(obj, @onEvent)
    # call object added method
    obj.added()
  addEventHandler: (evtType, callback) ->
    if evtType not of @eventHandlers
      @eventHandlers[evtType] = []
    if callback not in @eventHandlers[evtType]
      @eventHandlers[evtType].push callback
    return