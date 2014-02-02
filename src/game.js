/**
 * @file The Application module. Handles the general state of the game.
 * @author Eugene Bulkin <eugene@eugenebulkin.name>
 */

/**
 * Application wrapper
 *
 * @mixes Game.Observer
 * @constructor
 */
Game.Application = function() {
  Game.Observer.call(this);
};
Game.Application.extend(Game.Observer);

/**
 * Initializes the state of the Game; has to be called manually because we have
 * to make sure other classes are loaded first.
 */
Game.Application.prototype.init = function() {
  // Create a new Game.State for use with the game
  /**
   * @type {Game.State}
   * @public
   */
  this.state = new Game.State();
  /**
   * @type {Game.Achievements}
   * @public
   */
  this.achievements = new Game.Achievements(this.state);
};