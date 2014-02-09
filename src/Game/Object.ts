///<reference path="./Messenger.ts" />

module Game {
  export class GameObject extends Messenger {
    /**
     * A native class that sends some useful events.
     *
     * @constructor
     * @extends Game.Messenger
     */
    constructor() {
      super();
    }
    /**
     * Called when the object is added to a state.
     */
    public added() {
      // When the object is added to a state, the object will fire a create event
      this.fire('create', this);
    }
  }
}