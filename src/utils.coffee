# # utils
# The utility module. Contains various useful functions and classes.

# Generates a GUID randomly. See
# [this StackOverflow answer](http://stackoverflow.com/a/105074/28429).
guid = () ->
  s4 = () ->
    Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1)
  "#{s4()}#{s4()}-#{s4()}-#{s4()}-#{s4()}-#{s4()}#{s4()}#{s4()}"

# ## Game.Event
# Creates an Event class that stores some information about the event and
# its context of firing.
class Game.Event
  constructor: (@type, @data = null, @target = null) ->

# ## Game.Publisher
class Game.Publisher
  constructor: () ->
    @subscribers_ = []
    @id_ = guid()
  # ### Game.Publisher.getId
  # ID getter.
  getId: () -> @id_
  # ### Game.Publisher.fire
  # Fires an event. Takes either a string (event type) or Game.Event.
  # Optionally takes data which will override the data in the original event if
  # it exists. Also optionally takes a context for the Observer to run the
  # callback in.
  fire: (e, data = null, ctx = null) ->
    # If there is data passed, overwrite data in original event
    if e instanceof Game.Event
      e.data = data or e.data
    # if you're not trying to pass an event, convert to an event
    else
      e = new Game.Event(e, data)
    # Set event target to self
    e.target = @
    # Notify all subscribers
    @subscribers_.forEach (s) => s.notify(@id_, e, ctx)
    return
  # ### Game.Publisher.subscribe
  # Subscribe to an observer
  subscribe: (observer) ->
    # Here we assume that the observer has not already been subscribed
    @subscribers_.push observer
    return
  # ### Game.Publisher.unsubscribe
  # Unsubscribe from an observer
  unsubscribe: (observer) ->
    # Removes the observer from the subscriber list
    for s, i in @subscribers_
      if s is observer
        @subscribers_.splice(i, 1)
        break
    return
  # ### Game.Publisher.destroy
  # Removes every handler listening to this object.
  destroy: () ->
    # Unsubscribe every subscriber
    @subscribers_.forEach (s) => s.remove @
    return

# ## Game.Observer
class Game.Observer
  constructor: () ->
    @subjects_ = {}
    @listeners_ = {}
  # ### Game.Observer.listen
  # Listen to an object for its events.
  listen: (obj, cb) ->
    oid = obj.getId()
    # If the object has not already been listened to, subscribe this to it
    if oid not of @subjects_
      obj.subscribe @
      @subjects_[oid] = obj
    # Set the callback for this object.
    # Note that each object can only have *exactly one* callback.
    @listeners_[oid] = cb
    return
  # ### Game.Observer.notify
  # Called by the Publisher to notify the Observer of an event.
  notify: (objId, e, ctx = @) ->
    # If the object is being listened to, call
    # that callback with the event, having the callback bound to the
    # optional context.
    if objId of @listeners_
      (@listeners_[objId].bind ctx) e
    return
  # ### Game.Observer.remove
  # Remove an object from this Observer's listening.
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

# ## Game.TwoWay
# Because CoffeeScript does not support mixins, this class was made manually
# to allow for a class to be both a Publisher and an Observer.
class Game.TwoWay extends Game.Publisher
  # Extend this prototype with that of Game.Observer
  for name, method of Game.Observer::
    @::[name] = method
  constructor: () ->
    super
    # Crudely extend Game.Observer
    Game.Observer.call @

# ## Game.GameError
# A custom error class.
class Game.GameError extends Error
  # ### Game.GameError.ErrorType
  # A hash with a set of constants for error messages.
  @ErrorType = {
    NOT_OBJECT: "You must call this method with a Game.Object instance."
    ALREADY_ADDED: "Object already added to state."
    NOT_ADDED: "Object was not added to state."
  }
  constructor: (message) ->
    @name = 'GameError'
    @message = message
    @stack = (new Error()).stack