///<reference path="./Messenger.ts" />
///<reference path="./Object.ts" />
///<reference path="./Event.ts" />
///<reference path="./Error.ts" />

module Game {
  export interface Counter {
    time: Date;
    data: any;
  }
  export class State extends Messenger {
    public objects: { [x: string]: GameObject }
    public eventCounters: { [x: string]: Counter[] }
    public eventHandlers: { [x: string]: { (e: Event): void; } [] }
    /**
     * State controller.
     *
     * @constructor
     * @extends Game.Messenger
     */
    constructor() {
      super();

      /**
       * Keeps track of objects added to state.
       * @type {object.<string, Game.GameObject>}
       * @protected
       */
      this.objects = {}

      /**
       * Set up a hash to count instances of events occurring. The keys are the
       * event types, and the values are arrays of the timestamps at which the
       * events were noticed by the state.
       *
       * @type {object.<string, Date[]>}
       * @protected
       */
      this.eventCounters = {}

      /**
       * Set up a hash for specific event handlers, because the state will at
       * times want to handle certain event types differently.
       *
       * @type {object.<string, function[]>}
       * @protected
       */
      this.eventHandlers = {}
    }

    /**
     * Generic event handler. Takes an event. This is the callback
     * used when objects are added to the state.
     *
     * @param  {Game.Event} e
     */
    private onEvent(e) {
      // Initialize the counter/handler arrays for this event type
      if(!this.eventCounters.hasOwnProperty(e.type)) {
        this.eventCounters[e.type] = [];
      }
      if(!this.eventHandlers.hasOwnProperty(e.type)) {
        this.eventHandlers[e.type] = [];
      }
      // Add timestamped instance to event counters object
      this.eventCounters[e.type].push({
        time: new Date(),
        data: e.data
      });
      // Relay the event upward
      this.fire(e);
      // Call additional callbacks if there are any
      this.eventHandlers[e.type].forEach(function(cb) {
        cb(e);
      });
    }

    /**
     * Used by the game controller when an object needs to be added to the state
     * of the game.
     *
     * @param  {Game.GameObject} obj
     *
     * @throws {Game.Error.ErrorType.NOT_OBJECT} If obj is not a {@link Game.GameObject} instance.
     * @throws {Game.Error.ErrorType.ALREADY_ADDED} If obj was already added to the state.
     */
    public addObject(obj: GameObject) {
      if(!(obj instanceof GameObject)) {
        throw new GameError(GameError.ErrorType.NOT_OBJECT);
      }
      var oid = obj.getId();
      if(this.objects.hasOwnProperty(oid)) {
        throw new GameError(GameError.ErrorType.ALREADY_ADDED);
      }
      // Add object to internal objects hash
      this.objects[oid] = obj;
      // Listen to the object for any event
      this.listen(obj, this.onEvent);
      // Call the object's added method so it knows it has been added
      obj.added();
    }

    /**
     * Used by the game controller to remove an object from the internal state.
     *
     * @param  {Game.GameObject} obj
     *
     * @throws {Game.Error.ErrorType.NOT_OBJECT} If obj is not a {@link Game.GameObject} instance.
     * @throws {Game.Error.ErrorType.NOT_ADDED} If obj was never added to the state.
     */
    public removeObject(obj: GameObject) {
      if(!(obj instanceof GameObject)) {
        throw new GameError(GameError.ErrorType.NOT_OBJECT);
      }
      var oid = obj.getId();
      // If object is in the internal state...
      if(this.objects.hasOwnProperty(oid)) {
        // Remove it from the internal objects hash
        delete this.objects[oid];
        // Unlisten to the object
        this.remove(obj);
      }
      else {
        throw new GameError(GameError.ErrorType.NOT_ADDED);
      }
    }

    /**
     * Adds a handler to call a callback when a specific event occurs. Takes the
     * event type string and a callback.
     *
     * @param {string} evtType
     * @param {Function} callback
     */
    public addEventHandler(evtType: string, callback: (e: Event) => void) {
      if(!this.eventHandlers.hasOwnProperty(evtType)) {
        this.eventHandlers[evtType] = [];
      }
      // If the callback hasn't been added yet, add it
      if(this.eventHandlers[evtType].indexOf(callback) === -1) {
        this.eventHandlers[evtType].push(callback);
      }
    }

    /**
     * Removes a specific event handler
     *
     * @param {string} evtType
     * @param {Function} callback
     */
    public removeEventHandler(evtType: string, callback: (e: Event) => void) {
      if(this.eventHandlers.hasOwnProperty(evtType)) {
        this.eventHandlers[evtType].forEach(function(cb, i) {
          if(cb === callback) {
            this.eventHandlers[evtType].splice(i, 1);
            return false;
          }
        }, this);
      }
    }
  }
}