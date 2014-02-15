///<reference path="./Utils.ts" />
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
        // throw error here
      }
      if(id === this.currentLevel) {
        // throw error here
      }
      this.levels.splice(id, 1);
    }

    public addGoals(goals: Requirement[], id?: number): void {
      if(id < 0 || id >= this.levels.length) {
        // throw error here
      }
      id = id || this.currentLevel;
      this.levels[id].goals.push.apply(this.levels[id].goals, goals);
    }

    public addEffects(effects: Effect[], id?: number): void {
      if(id < 0 || id >= this.levels.length) {
        // throw error here
      }
      id = id || this.currentLevel;
      this.levels[id].effects.push.apply(this.levels[id].effects, effects);
    }

    public advance(id?: number): void {
      id = id || this.currentLevel + 1;
      if(id < 0 || id >= this.levels.length) {
        // throw error here
      }
      if(id === this.currentLevel) {
        // throw error here
      }
      this.currentLevel = id;
      this.fire('advance', this.currentLevel);
    }

    public onEvent(e: Event): void {
      super.onEvent(e);
      // check goals of current level
    }
  }
}