/**
 * @file The achievements module. Takes care of firing events relevant to
 *       achievements as well as noticing when achievements take place.
 * @author Eugene Bulkin <eugene@eugenebulkin.name>
 */

/**
 * Achievements controller.
 *
 * @constructor
 * @extends Game.Messenger
 */
Game.Achievements = function(state) {
  Game.Messenger.call(this);

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

  this.init();
};
extend(Game.Achievements, Game.Messenger);

Game.Achievements.prototype.init = function() {
  this.listen(this.state, this.onEvent);
};

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
  this.achievements[name] = requirements;
};