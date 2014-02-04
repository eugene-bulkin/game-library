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
   * and the array is the data describing them. This hash only contains
   * unattained achievements.
   *
   * @type {object.<string, array>}
   * @protected
   */
  this.achievements = {};

  /**
   * Internal achievements hash. Keeps track of attained achievements.
   *
   * @type {object.<string, array>}
   * @protected
   */
  this.achieved = {};

  this.init();
};
extend(Game.Achievements, Game.Messenger);

/**
 * Init function. Called from constructor to listen to the state.
 */
Game.Achievements.prototype.init = function() {
  this.listen(this.state, this.onEvent);
};

/**
 * Called to check whether a particular requirement is satisfied.
 *
 * Requirement array format:
 *
 * - `0`: name of event or "a:" + name of achievement
 * - `1`: event data (must be a subset of the event data)
 * - `2`: number of occurrences of event
 * - `3`: time window observed
 * - `4`: name of event that must have occurred within the time window
 *
 * Only the first argument is required. The time window argument is only
 * required if the last argument is specified.
 *
 * @param  {Array} req An array detailing an achievement requirement
 *
 * @return {Boolean}
 */
Game.Achievements.prototype.satisfied = function(req) {
  if(req.length === 1) {
    // only one argument means just check that the event occurred once
    if (this.state.eventCounters.hasOwnProperty(req[0]) &&
        this.state.eventCounters[req[0]].length > 0) {
      return true;
    }
  }
  return false;
};

/**
 * Event handler
 *
 * @param  {Game.Event} e
 */
Game.Achievements.prototype.onEvent = function(e) {
  console.log(e.type, e.data, new Date().getTime());
  Object.keys(this.achievements).forEach(function(name) {
    var reqs = this.achievements[name];
    var achieved = reqs.every(this.satisfied, this);
    if(achieved) {
      this.fire('achievement', { name: name });
      // shift the achievement to the already achieved hash
      // since we don't want to worry about it later
      // plus this separates achieved from unachieved achievements
      this.achieved[name] = reqs;
      delete this.achievements[name];
    }
  }, this);
};

/**
 * Whether this achievement has been achieved or not.
 *
 * @param  {string} name
 *
 * @return {Boolean}
 */
Game.Achievements.prototype.hasAchieved = function(name) {
  return this.achieved.hasOwnProperty(name);
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