# See http://stackoverflow.com/a/105074/28429
guid = () ->
  s4 = () ->
    Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1)
  "#{s4()}#{s4()}-#{s4()}-#{s4()}-#{s4()}-#{s4()}#{s4()}#{s4()}"

class Game.Event
  constructor: (@type, @data = null, @target = null) ->

class Game.Publisher
  constructor: () ->
    @subscribers_ = []
    @id_ = guid()
  getId: () -> @id_
  fire: (e, data = null, ctx = null) ->
    if e instanceof Game.Event
      # If there is data passed, overwrite data in original event
      e.data = data or e.data
    else
      # if you're not trying to pass an event, convert to an event
      e = new Game.Event(e, data)
    e.target = @
    @subscribers_.forEach (s) => s.notify(@id_, e, ctx)
    return
  subscribe: (observer) ->
    # here we assume that the observer has not already been subscribed
    @subscribers_.push observer
    return
  unsubscribe: (observer) ->
    for s, i in @subscribers_
      if s is observer
        @subscribers_.splice(i, 1)
        break
    return
  destroy: () ->
    @subscribers_.forEach (s) => s.remove @
    return

class Game.Observer
  constructor: () ->
    @subjects_ = {}
    @listeners_ = {}
  listen: (obj, cb) ->
    oid = obj.getId()
    if oid not of @subjects_
      obj.subscribe @
      @subjects_[oid] = obj
    # Add callback to the listeners object
    @listeners_[oid] = cb
    return
  notify: (objId, e, ctx = @) ->
    # if the object is being listened to, call
    # that callback with the event
    if objId of @listeners_
      (@listeners_[objId].bind ctx) e
    return
  remove: (subject) ->
    sid = subject.getId()
    if sid of @subjects_
      s = @subjects_[sid]
      # Tell object to stop notifying this observer
      s.unsubscribe @
      # get rid of listeners associated with this object
      delete @listeners_[sid]
      # remove this subject from the list of subjects
      delete @subjects_[sid]
    return

# Can observe and publish; CoffeeScript doesn't do mixins...
class Game.TwoWay extends Game.Publisher
  for name, method of Game.Observer::
    @::[name] = method
  constructor: () ->
    super
    # Crudely extend Game.Observer
    Game.Observer.call @

class Game.GameError extends Error
  @ErrorType = {
    NOT_OBJECT: "You must call this method with a Game.Object instance."
    ALREADY_ADDED: "Object already added to state."
    NOT_ADDED: "Object was not added to state."
  }
  constructor: (message) ->
    @name = 'GameError'
    @message = message
    @stack = (new Error()).stack