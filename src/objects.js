/**
 * @file The Objects module. Handles native Game.Object class which fires some
 * useful events.
 * @author Eugene Bulkin <eugene@eugenebulkin.name>
 */

/**
 * A native class that sends some useful events.
 *
 * @constructor
 * @mixes Game.Publisher
 */
Game.Object = function() {
  Game.Publisher.call(this);
};
extend(Game.Object, Game.Publisher, true);

/**
 * Called when the object is added to a state.
 */
Game.Object.prototype.added = function() {
  // When the object is added to a state, the object will fire a create event
  this.fire('create');
};