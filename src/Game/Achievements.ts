///<reference path="./State.ts" />
///<reference path="./Messenger.ts" />

module Game {
  export class Achievements extends Messenger {
    public state: State;
    public achievements: { [x: string]: any[] };
    public achieved: { [x: string]: any[] };

    /**
     * Achievements controller.
     *
     * @constructor
     * @extends Game.Messenger
     */
    constructor(state: State) {
      super();

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
      this.achievements = {}

      /**
       * Internal achievements hash. Keeps track of attained achievements.
       *
       * @type {object.<string, array>}
       * @protected
       */
      this.achieved = {}

      this.init();
    }

    /**
     * Init function. Called from constructor to listen to the state.
     */
    public init(): void {
      this.listen(this.state, this.onEvent);
    }

    /**
     * Check whether data is a subset of object
     *
     * @param  {object} object
     * @param  {object} data
     *
     * @return {Boolean}
     */
    private matchData(object: any, data: any): boolean {
      return Object.keys(data).every(function(key) {
        if(typeof data[key] !== typeof object[key]) {
          return false;
        } else if(typeof data[key] === 'object') {
          return this.matchData(object[key], data[key]);
        } else {
          return data[key] === object[key];
        }
      });
    }

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
    private satisfied(req: any[]): boolean {
      if(req.length === 0) {
        return false;
      }
      var achMatch = req[0].match(/^a:(\w+)$/);
      if(achMatch) {
        return this.hasAchieved(achMatch[1]);
      }
      if(!this.state.eventCounters.hasOwnProperty(req[0])) {
        return false;
      }
      var counter: Counter[] = this.state.eventCounters[req[0]];
      // only one argument means just check that the event occurred once
      if(req.length === 1) {
        return (counter.length > 0);
      }
      // filter out events that don't match the required data
      if(req[1] != null) {
        counter = counter.filter(function(e: Counter) {
          return this.matchData(e.data, req[1]);
        }, this);
      }
      // if there's a time, filter out all events that occurred before the last
      // however many milliseconds
      if(req.length >= 4) {
        if(!req[3]) {
          return false;
        }
        var origin = new Date();
        if(req[4]) {
          if(!this.state.eventCounters[req[4]]) {
            return false;
          }
          origin = this.state.eventCounters[req[4]].slice(-1)[0].time;
        }
        counter = counter.filter(function(e: Counter) {
          return (origin.getTime() - e.time.getTime() <= req[3]);
        });
      }
      // set a count for how many we want
      var count = 1;
      if(req.length >= 3) {
        count = (req[2] > 0) ? req[2] : count;
      }
      return (counter.length >= count);
    }

    /**
     * Event handler
     *
     * @param  {Game.Event} e
     */
    private onEvent(e) {
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
    }

    /**
     * Whether this achievement has been achieved or not.
     *
     * @param  {string} name
     *
     * @return {Boolean}
     */
    public hasAchieved(name) {
      return this.achieved.hasOwnProperty(name);
    }

    /**
     * Adds an achievement to be tracked
     *
     * @param {string} name
     * @param {array} requirements
     */
    public addAchievement(name, requirements) {
      this.achievements[name] = requirements;
    }
  }
}