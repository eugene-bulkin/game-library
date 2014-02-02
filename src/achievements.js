/**
 * @file The achievements module. Takes care of firing events relevant to
 *       achievements as well as noticing when achievements take place.
 * @author Eugene Bulkin <eugene@eugenebulkin.name>
 */

/**
 * Achievements controller.
 *
 * @constructor
 * @mixes Game.Observer
 * @mixes Game.Publisher
 */
Game.Achievements = function(state) {
  Game.Observer.call(this);
  Game.Publisher.call(this);

  /**
   * @type {Game.State}
   * @protected
   */
  this.state = state;

  /**
   * Internal achievements hash. Keys are the names of the achievements,
   * and the array is the data describing them.
   *
   * @type {object.<string, array>}
   * @protected
   */
  this.achievements = {};

  this.listen(this.state, this.onEvent);
};
Game.Achievements.extend(Game.Observer);
Game.Achievements.extend(Game.Publisher);

/**
 * Event handler
 *
 * @param  {Game.Event} e
 */
Game.Achievements.prototype.onEvent = function(e) {
  console.log(e.type, e.data, new Date().getTime());
};

/**
 * Whether this achievement has been achieved or not.
 *
 * @param  {string} name
 *
 * @return {Boolean}
 */
Game.Achievements.prototype.hasAchieved = function(name) {
  return false;
};

/**
 * Adds an achievement to be tracked
 *
 * @param {string} name
 * @param {array} requirements
 */
Game.Achievements.prototype.addAchievement = function(name, requirements) {
};