/**
 * @file The utility module. Contains various useful functions and classes.
 * @author Eugene Bulkin <eugene@eugenebulkin.name>
 */

Game.Utils = {};

/**
 * Extend method for Objects.
 *
 * @param  {Object} child Child "class"
 * @param  {Object} parent Parent "class"
 */
var extend = function (child, parent) {
  if(!parent) return;
  child.prototype = Object.create(parent.prototype);
};
Game.Utils.extend = extend;

/**
 * Generates a GUID randomly. See
 * {@link http://stackoverflow.com/a/105074/28429 this StackOverflow answer}.
 *
 * @return {string}
 */
var guid = function() {
  var s4 = function() {
    return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
  };

  return s4() + s4() + "-" + s4() + "-" + s4() + "-" + s4() + "-" + s4() + s4() + s4();
};
Game.Utils.guid = guid;

/**
 * Creates an Event class that stores some information about the event and
 * its context of firing.
 *
 * @param {string} type
 * @param {object=} data
 * @param {object=} target
 *
 * @constructor
 */
Game.Event = function(type, data, target) {
  if(!type) {
    throw new Game.Error('Game.Event requires a type.');
  }
  /**
   * @type {!string}
   * @public
   */
  this.type = type;
  /**
   * @type {?object}
   * @public
   */
  this.data = (data == null) ? null : data;
  /**
   * @type {?object}
   * @public
   */
  this.target = (target == null) ? null : target;
};

/**
 * A Messenger class. Can send and receive events.
 *
 * @constructor
 */
Game.Messenger = function() {
  /**
   * @type {Game.Messenger[]}
   * @protected
   */
  this._subscribers = [];
  /**
   * @type {string}
   * @protected
   */
  this._id = guid();
  /**
   * @type {object.<string, Game.Messenger>}
   * @protected
   */
  this._subjects = {};
  /**
   * @type {object.<string, function>}
   * @protected
   */
  this._listeners = {};
};

/**
 * Getter for ID
 *
 * @return {string}
 */
Game.Messenger.prototype.getId = function() {
  return this._id;
};

/**
 * Fires an event. Takes either a string (event type) or Game.Event. Optionally
 * takes data which will override the data in the original event if it exists.
 *
 * @param  {Game.Event|string} e
 * @param  {object=} data
 * @param  {object=} ctx Tells the observer what context to run the callback in
 */
Game.Messenger.prototype.fire = function(e, data, ctx) {
  // If there is data passed, overwrite data in original event
  if(e instanceof Game.Event) {
    e.data = data || e.data;
  } else {
    // Convert to an event
    e = new Game.Event(e, data);
  }
  // Set event target to self
  e.target = this;
  // Notify all subscribers
  this._subscribers.forEach(function (sub) {
    sub.notify(this._id, e, ctx);
  }, this);
};

/**
 * Subscribe to an observer
 *
 * @param  {Game.Messenger} observer
 */
Game.Messenger.prototype.subscribe = function(observer) {
  // We assume that the observer has not already been subscribed to
  this._subscribers.push(observer);
};

/**
 * Unsubscribe from an observer
 *
 * @param  {Game.Messenger} observer
 */
Game.Messenger.prototype.unsubscribe = function(observer) {
  this._subscribers.forEach(function(sub, i){
    if(sub === observer) {
      this._subscribers.splice(i, 1);
      return false;
    }
  }, this);
};

/**
 * Removes every handler listening to this object.
 */
Game.Messenger.prototype.destroy = function() {
  this._subscribers.forEach(function(sub) {
    sub.remove(this);
  }, this);
};

/**
 * Listen to an object for its events
 *
 * @param  {Game.Messenger} obj
 * @param  {Function} cb
 */
Game.Messenger.prototype.listen = function(obj, cb) {
  var oid = obj.getId();
  // If the object has not already been listened to, subscribe this to it
  if(!this._subjects.hasOwnProperty(oid)) {
    obj.subscribe(this);
    this._subjects[oid] = obj;
  }
  // Set the callback for this object.
  // Note that each object can only have *exactly one* callback.
  this._listeners[oid] = cb;
};

/**
 * Called by the Messenger to notify its subscriber of an event.
 *
 * @param  {string} objId
 * @param  {Game.Event} e
 * @param  {object=} ctx Context to run the callback in. Defaults to the Messenger itself.
 */
Game.Messenger.prototype.notify = function(objId, e, ctx) {
  ctx = (ctx == null) ? this : ctx;
  /*
   * If the object is being listened to, call that callback with the event,
   * having the callback bound to the optional context.
   */
  if(this._listeners.hasOwnProperty(objId)) {
    (this._listeners[objId].bind(ctx))(e);
  }
};

/**
 * Remove an object from this observer's listening
 *
 * @param  {Game.Messenger} subject
 */
Game.Messenger.prototype.remove = function(subject) {
  var sid = subject.getId();
  if(this._subjects.hasOwnProperty(sid)) {
    var s = this._subjects[sid];
    // Tell object to stop notifying this Messenger
    s.unsubscribe(this);
    // Get rid of listeners associated with this Messenger and remove this subject
    // from the list of subjects
    delete this._listeners[sid];
    delete this._subjects[sid];
  }
};

/**
 * Game's internal Error class
 *
 * @param {string} message
 * @constructor
 */
Game.Error = function(message) {
  this.name = 'GameError';
  this.message = message;
  this.stack = (new Error()).stack;
  this.toString = function() {
    return this.name + ": " + this.message;
  };
};
extend(Game.Error, window.Error);

/**
 * A hash of error types.
 *
 * @readonly
 * @type {String}
 */
Game.Error.ErrorType = {
  NOT_OBJECT: "You must call this method with a Game.Object instance.",
  ALREADY_ADDED: "Object already added to state.",
  NOT_ADDED: "Object was not added to state."
};