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
  export class StateTracker extends Messenger {
    public state: State;
    public eventCounters: { [x: string]: Counter[] }

    constructor(state: State) {
      super();

      /**
       * @type {Game.State}
       * @protected
       */
      this.state = state;

      /**
       * Set up a hash to count instances of events occurring. The keys are the
       * event types, and the values are arrays of the timestamps at which the
       * events were noticed by the state.
       *
       * @type {object.<string, Date[]>}
       * @protected
       */
      this.eventCounters = {};

      this.init();
    }

    /**
     * Init function. Called from constructor to listen to the state.
     */
    public init(): void {
      this.listen(this.state, this.onEvent);
    }

    public onEvent(e: Event): void {
      if(!this.eventCounters.hasOwnProperty(e.type)) {
        this.eventCounters[e.type] = [];
      }
      // Add timestamped instance to event counters object
      this.eventCounters[e.type].push({
        time: new Date(),
        data: e.data
      });
    }
  }
}