///<reference path="./Utils.ts" />
///<reference path="./Error.ts" />
///<reference path="./State.ts" />
///<reference path="./StateTracker.ts" />

module Game {
  export interface Effect {
    fn?: Function;
    config?: { [x: string]: any };
  }
  export interface Level {
    data: any
    goals: Requirement[];
    effects: Effect[];
  }
  export class Plot extends StateTracker {
    public levels: Level[];
    public currentLevel: number = 0;

    constructor(state: State) {
      super(state);
    }

    public addLevel(data: any, goals?: Requirement[], effects?: Effect[]): number {
      this.levels.push({
        data: data,
        goals: goals || [],
        effects: effects || []
      });
      return this.levels.length - 1;
    }

    public removeLevel(id: number): void {
      if(id < 0 || id >= this.levels.length) {
        throw new GameError(GameError.ErrorType.LEVEL_NOT_EXIST, id);
      }
      if(id === this.currentLevel) {
        throw new GameError(GameError.ErrorType.REMOVE_CUR_LEVEL);
      }
      this.levels.splice(id, 1);
      // if the id was below the current level, maintain the correct order!
      if(id < this.currentLevel) {
        this.currentLevel -= 1;
      }
    }

    public addGoals(goals: Requirement[], id?: number): void {
      if(id < 0 || id >= this.levels.length) {
        throw new GameError(GameError.ErrorType.LEVEL_NOT_EXIST, id);
      }
      id = id || this.currentLevel;
      this.levels[id].goals.push.apply(this.levels[id].goals, goals);
    }

    public addEffects(effects: Effect[], id?: number): void {
      if(id < 0 || id >= this.levels.length) {
        throw new GameError(GameError.ErrorType.LEVEL_NOT_EXIST, id);
      }
      id = id || this.currentLevel;
      this.levels[id].effects.push.apply(this.levels[id].effects, effects);
    }

    public advance(id?: number): void {
      id = id || this.currentLevel + 1;
      if(id < 0 || id >= this.levels.length) {
        throw new GameError(GameError.ErrorType.LEVEL_NOT_EXIST, id);
      }
      if(id === this.currentLevel) {
        throw new GameError(GameError.ErrorType.ADVANCE_CUR_LEVEL);
      }
      this.currentLevel = id;
      this.fire('advance', this.currentLevel);
    }

    private satisfied(req: Requirement): boolean {
      if(!req.name) {
        return false;
      }
      // return false if they specify a prereq without a time period
      if(req.prereq && !req.within) {
        return false;
      }
      if(!this.eventCounters.hasOwnProperty(req.name)) {
        return false;
      }
      var counter: Counter[] = this.eventCounters[req.name];
      // set default count
      var count = (req.count && req.count > 0) ? req.count : 1;
      // filter out events that don't match the required data
      if(req.data) {
        counter = counter.filter(function(e: Counter) {
          return Utils.matchData(e.data, req.data);
        }, this);
      }
      // if there's a time, filter out all events that occurred before the last
      // however many milliseconds
      if(req.within) {
        var origin = new Date();
        if(req.prereq) {
          if(!this.eventCounters[req.prereq]) {
            return false;
          }
          origin = this.eventCounters[req.prereq].slice(-1)[0].time;
        }
        counter = counter.filter(function(e: Counter) {
          return (origin.getTime() - e.time.getTime() <= req.within);
        });
      }
      return (counter.length >= count);
    }

    public onEvent(e: Event): void {
      super.onEvent(e);
      // check goals of current level
      var goalsAchieved = this.levels[this.currentLevel].goals.every(this.satisfied, this);
      if(goalsAchieved) {
        this.fire('levelCompleted', this.currentLevel);
        this.eventCounters = {};
      }
    }
  }
}