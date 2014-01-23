# # state
# The State module. Keeps track of the internal game state and relays events
# upwards for external use.

# ## Game.State
# Game.State is an instance of Game.TwoWay and thus we must call super at the
# beginning of the constructor.
class Game.State extends Game.TwoWay
  constructor: () ->
    super
    # Keep track of objects added to the state.
    @objects = {}
    # Set up a hash to count instances of events occurring.
    # The keys are the event types, and the values are arrays of the timestamps
    # at which the events were noticed by the state.
    @eventCounters = {}
    # Set up a hash for specific event handlers, because the state will at times
    # want to handle certain event types differently.
    @eventHandlers = {}
  # ### Game.State.onEvent
  # Generic event handler. Takes an event. This is the callback used when
  # objects are added to the state.
  onEvent: (e) ->
    # Initialize `@eventCounters[e.type]` if it doesn't exist
    if e.type not of @eventCounters
      @eventCounters[e.type] = []
    # Add timestamped instance to the event counters object
    @eventCounters[e.type].push new Date()
    # Relay the event upward
    @fire(e)
    # Call additional callbacks
    @eventHandlers[e.type]?.forEach (cb) -> cb(e)
    return
  # ### Game.State.addObject
  # Used by the game controller when an object needs to be added to the state
  # of the game. Must take a Game.Object instance.
  addObject: (obj) ->
    # Throw error if `obj` is not a Game.Object instance.
    if obj not instanceof Game.Object
      throw new Game.GameError(Game.GameError.ErrorType.NOT_OBJECT)
    oid = obj.getId()
    # Throw error if `obj` is already in `@objects`.
    if oid of @objects
      throw new Game.GameError(Game.GameError.ErrorType.ALREADY_ADDED)
    # Add objects to internal objects hash
    @objects[oid] = obj
    # Listen to the object for any event.
    @listen(obj, @onEvent)
    # Call the object's `added` method so it knows it has been added
    obj.added()
  # ### Game.State.removeObject
  # Used by the game controller to remove an object from the internal state.
  # Must take a Game.Object instance.
  removeObject: (obj) ->
    # Throw error if `obj` is not a Game.Object instance.
    if obj not instanceof Game.Object
      throw new Game.GameError(Game.GameError.ErrorType.NOT_OBJECT)
    oid = obj.getId()
    # If object is in the internal state...
    if oid of @objects
      # Remove it from the internal objects hash
      delete @objects[oid]
      # Unlisten to the object
      @remove obj
    # ...otherwise throw an error because the object was never added.
    else
      throw new Game.GameError(Game.GameError.ErrorType.NOT_ADDED)
  # ### Game.State.addEventHandler
  # Adds a handler to call a callback when a specific event occurs. Takes the
  # event type string and a callback.
  addEventHandler: (evtType, callback) ->
    if evtType not of @eventHandlers
      @eventHandlers[evtType] = []
    # If this callback has not been added yet, add it
    if callback not in @eventHandlers[evtType]
      @eventHandlers[evtType].push callback
    return
  # ### Game.State.removeEventHandler
  # Removes a specific event handler
  removeEventHandler: (evtType, callback) ->
    if evtType of @eventHandlers
      for cb, i in @eventHandlers[evtType]
        if cb is callback
          @eventHandlers[evtType].splice(i, 1)
          break
    return