///<reference path="./State.ts" />
///<reference path="./Messenger.ts" />

module Game {
  export interface Requirement {
    name: string;
    data?: any;
    count?: number;
    within?: number;
    prereq?: string;
  }
  export class Achievements extends Messenger {
    public state: State;
    public achievements: { [x: string]: Requirement[] };
    public achieved: { [x: string]: Requirement[] };

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
      this.achievements = {};

      /**
       * Internal achievements hash. Keeps track of attained achievements.
       *
       * @type {object.<string, array>}
       * @protected
       */
      this.achieved = {};

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
     * Requirement object format:
     *
     * - name: name of event or "a:" + name of achievement
     * - data: event data (must be a subset of the event data)
     * - count: number of occurrences of event
     * - within: time window observed
     * - prereq: name of event that must have occurred within the time window
     *
     * Only the first argument is required. The time window argument is only
     * required if the last argument is specified.
     *
     * @param  {Array} req An array detailing an achievement requirement
     *
     * @return {Boolean}
     */
    private satisfied(req: Requirement): boolean {
      if(!req.name) {
        return false;
      }
      // return false if they specify a prereq without a time period
      if(req.prereq && !req.within) {
        return false;
      }
      var achMatch = req.name.match(/^a:(\w+)$/);
      if(achMatch) {
        return this.hasAchieved(achMatch[1]);
      }
      if(!this.state.eventCounters.hasOwnProperty(req.name)) {
        return false;
      }
      var counter: Counter[] = this.state.eventCounters[req.name];
      // set default count
      var count = (req.count && req.count > 0) ? req.count : 1;
      // filter out events that don't match the required data
      if(req.data) {
        counter = counter.filter(function(e: Counter) {
          return this.matchData(e.data, req.data);
        }, this);
      }
      // if there's a time, filter out all events that occurred before the last
      // however many milliseconds
      if(req.within) {
        var origin = new Date();
        if(req.prereq) {
          if(!this.state.eventCounters[req.prereq]) {
            return false;
          }
          origin = this.state.eventCounters[req.prereq].slice(-1)[0].time;
        }
        counter = counter.filter(function(e: Counter) {
          return (origin.getTime() - e.time.getTime() <= req.within);
        });
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
          this.fire('achievement', { name: name, reqs: reqs });
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
    public hasAchieved(name: string): boolean {
      return this.achieved.hasOwnProperty(name);
    }

    /**
     * Adds an achievement to be tracked
     *
     * @param {string} name
     * @param {object} requirements
     */
    public addAchievement(name: string, requirements: Requirement[]): void {
      this.achievements[name] = requirements;
    }
  }
}