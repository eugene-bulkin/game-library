# See http://stackoverflow.com/a/105074/28429
guid = () ->
  s4 = () ->
    Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1)
  "#{s4()}#{s4()}-#{s4()}-#{s4()}-#{s4()}-#{s4()}#{s4()}#{s4()}"

@Game ?= {}

class @Game.Event
  constructor: (@type, @data = null) ->

class @Game.Publisher
  constructor: () ->
    @subscribers_ = []
    @id_ = guid()

  fire: (e, data = null) ->
    if e instanceof Game.Event
      # If there is data passed, overwrite data in
      # original event if it does not exist yet.
      e.data ?= data
    else
      # if you're not trying to pass an event, convert to an event
      e = new Game.Event(e, data)
    @subscribers_.forEach (s) => s.notify(@id, e)
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

class @Game.Observer
  constructor: () ->
    @subjects_ = []
    @listeners_ = {}
  listen: (obj, e, cb) ->
    if obj not in @subjects_
      obj.subscribe @
      @subjects_.push obj.id
      @listeners_[obj.id] = {}
    # An individual event can only be listened to with one
    # callback per observed object.
    @listeners_[obj.id][e] = cb
    return
  notify: (objId, e, data) ->
    # if the event type is being listened to, call
    # that callback with the event
    if e.type of @listeners_[objId]
      @listeners_[objId][e.type] e
    return
  remove: (subject) ->
    for s, i in @subjects_
      if s is subject.id
        # Tell object to stop notifying this observer
        s.unsubscribe @
        # get rid of listeners associated with this object
        delete @listeners_[s.id]
        # remove this subject from the list of subjects
        @subjects_.splice(i, 1)
        break
    return
