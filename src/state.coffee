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
    @eventHandlers[e.type]?.forEach (cb) -> cb(e)
    return
  addObject: (obj) ->
    if obj not instanceof Game.Object
      throw new Game.GameError(Game.GameError.ErrorType.NOT_OBJECT)
    oid = obj.getId()
    if oid of @objects
      throw new Game.GameError(Game.GameError.ErrorType.ALREADY_ADDED)
    @objects[oid] = obj
    @listen(obj, @onEvent)
    # call object added method
    obj.added()
  removeObject: (obj) ->
    if obj not instanceof Game.Object
      throw new Game.GameError(Game.GameError.ErrorType.NOT_OBJECT)
    oid = obj.getId()
    if oid of @objects
      delete @objects[oid]
      @remove obj
    else
      throw new Game.GameError(Game.GameError.ErrorType.NOT_ADDED)
  addEventHandler: (evtType, callback) ->
    if evtType not of @eventHandlers
      @eventHandlers[evtType] = []
    if callback not in @eventHandlers[evtType]
      @eventHandlers[evtType].push callback
    return
  removeEventHandler: (evtType, callback) ->
    if evtType of @eventHandlers
      for cb, i in @eventHandlers[evtType]
        if cb is callback
          @eventHandlers[evtType].splice(i, 1)
          break
    return