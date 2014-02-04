/**
 * @file The State module. Keeps track of the internal game state and relays
 *       events upwards for external use.
 * @author Eugene Bulkin <eugene@eugenebulkin.name>
 */

/**
 * State controller.
 *
 * @constructor
 * @extends Game.Messenger
 */
Game.State = function() {
  Game.Messenger.call(this);

  /**
   * Keeps track of objects added to state.
   * @type {object.<string, Game.Object>}
   * @protected
   */
  this.objects = {};

  /**
   * Set up a hash to count instances of events occurring. The keys are the
   * event types, and the values are arrays of the timestamps at which the
   * events were noticed by the state.
   *
   * @type {object.<string, Date[]>}
   * @protected
   */
  this.eventCounters = {};

  /**
   * Set up a hash for specific event handlers, because the state will at
   * times want to handle certain event types differently.
   *
   * @type {object.<string, function[]>}
   * @protected
   */
  this.eventHandlers = {};
};
extend(Game.State, Game.Messenger);

/**
 * Generic event handler. Takes an event. This is the callback
 * used when objects are added to the state.
 *
 * @param  {Game.Event} e
 */
Game.State.prototype.onEvent = function(e) {
  // Initialize the counter/handler arrays for this event type
  if(!this.eventCounters.hasOwnProperty(e.type)) {
    this.eventCounters[e.type] = [];
  }
  if(!this.eventHandlers.hasOwnProperty(e.type)) {
    this.eventHandlers[e.type] = [];
  }
  // Add timestamped instance to event counters object
  this.eventCounters[e.type].push({
    time: new Date(),
    data: e.data
  });
  // Relay the event upward
  this.fire(e);
  // Call additional callbacks if there are any
  this.eventHandlers[e.type].forEach(function(cb) {
    cb(e);
  });
};

/**
 * Used by the game controller when an object needs to be added to the state
 * of the game.
 *
 * @param  {Game.Object} obj
 *
 * @throws {Game.Error.ErrorType.NOT_OBJECT} If obj is not a {@link Game.Object} instance.
 * @throws {Game.Error.ErrorType.ALREADY_ADDED} If obj was already added to the state.
 */
Game.State.prototype.addObject = function(obj) {
  if(!(obj instanceof Game.Object)) {
    throw new Game.Error(Game.Error.ErrorType.NOT_OBJECT);
  }
  var oid = obj.getId();
  if(this.objects.hasOwnProperty(oid)) {
    throw new Game.Error(Game.Error.ErrorType.ALREADY_ADDED);
  }
  // Add object to internal objects hash
  this.objects[oid] = obj;
  // Listen to the object for any event
  this.listen(obj, this.onEvent);
  // Call the object's added method so it knows it has been added
  obj.added();
};

/**
 * Used by the game controller to remove an object from the internal state.
 *
 * @param  {Game.Object} obj
 *
 * @throws {Game.Error.ErrorType.NOT_OBJECT} If obj is not a {@link Game.Object} instance.
 * @throws {Game.Error.ErrorType.NOT_ADDED} If obj was never added to the state.
 */
Game.State.prototype.removeObject = function(obj) {
  if(!(obj instanceof Game.Object)) {
    throw new Game.Error(Game.Error.ErrorType.NOT_OBJECT);
  }
  var oid = obj.getId();
  // If object is in the internal state...
  if(this.objects.hasOwnProperty(oid)) {
    // Remove it from the internal objects hash
    delete this.objects[oid];
    // Unlisten to the object
    this.remove(obj);
  }
  else {
    throw new Game.Error(Game.Error.ErrorType.NOT_ADDED);
  }
};

/**
 * Adds a handler to call a callback when a specific event occurs. Takes the
 * event type string and a callback.
 *
 * @param {string} evtType
 * @param {Function} callback
 */
Game.State.prototype.addEventHandler = function(evtType, callback) {
  if(!this.eventHandlers.hasOwnProperty(evtType)) {
    this.eventHandlers[evtType] = [];
  }
  // If the callback hasn't been added yet, add it
  if(this.eventHandlers[evtType].indexOf(callback) === -1) {
    this.eventHandlers[evtType].push(callback);
  }
};

/**
 * Removes a specific event handler
 *
 * @param {string} evtType
 * @param {Function} callback
 */
Game.State.prototype.removeEventHandler = function(evtType, callback) {
  if(this.eventHandlers.hasOwnProperty(evtType)) {
    this.eventHandlers[evtType].forEach(function(cb, i) {
      if(cb === callback) {
        this.eventHandlers[evtType].splice(i, 1);
        return false;
      }
    }, this);
  }
};