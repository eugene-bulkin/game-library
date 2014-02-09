///<reference path="./Messenger.ts" />
///<reference path="./State.ts" />
///<reference path="./Achievements.ts" />

module Game {
  export class Application extends Messenger {
    public state: State;
    public achievements: Achievements;
    /**
     * Application wrapper
     *
     * @extends Game.Messenger
     * @constructor
     */
    constructor() {
      super();
    }
    /**
     * Initializes the state of the Game; has to be called manually because we have
     * to make sure other classes are loaded first.
     */
    public init() {
      // Create a new Game.State for use with the game
      /**
       * @type {Game.State}
       * @public
       */
      this.state = new State();
      /**
       * @type {Game.Achievements}
       * @public
       */
      this.achievements = new Achievements(this.state);
    }
  }
}