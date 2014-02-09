///<reference path="./Event.ts" />
///<reference path="./Utils.ts" />

module Game {
  export class Messenger {
    private _id: string;
    private _subscribers: Messenger[];
    private _subjects: { [x: string]: Messenger };
    private _listeners: { [x: string]: (e: Event) => void };
    /**
     * A Messenger class. Can send and receive events.
     *
     * @constructor
     */
    constructor() {
      /**
       * @type {Game.Messenger[]}
       * @protected
       */
      this._subscribers = [];
      /**
       * @type {string}
       * @protected
       */
      this._id = Utils.guid();
      /**
       * @type {object.<string, Game.Messenger>}
       * @protected
       */
      this._subjects = {};
      /**
       * @type {object.<string, function>}
       * @protected
       */
      this._listeners = {};
    }

    /**
     * Getter for ID
     *
     * @return {string}
     */
    public getId() {
      return this._id;
    }

    public fire(e: Event, data?: any, ctx?: any): void;
    public fire(e: string, data?: any, ctx?: any): void;

    /**
     * Fires an event. Takes either a string (event type) or Game.Event. Optionally
     * takes data which will override the data in the original event if it exists.
     *
     * @param  {Game.Event|string} e
     * @param  {object=} data
     * @param  {object=} ctx Tells the observer what context to run the callback in
     */
    public fire(e: any, data?: any, ctx?: any): void {
      // If there is data passed, overwrite data in original event
      if(e instanceof Event) {
        e.data = data || e.data;
      } else {
        // Convert to an event
        e = new Event(e, data);
      }
      // Set event target to self
      e.target = this;
      // Notify all subscribers
      this._subscribers.forEach(function (sub) {
        sub.notify(this._id, e, ctx);
      }, this);
    }

    /**
     * Subscribe to an observer
     *
     * @param  {Game.Messenger} observer
     */
    private subscribe(observer: Messenger) {
      // We assume that the observer has not already been subscribed to
      this._subscribers.push(observer);
    }

    /**
     * Unsubscribe from an observer
     *
     * @param  {Game.Messenger} observer
     */
    private unsubscribe(observer: Messenger) {
      this._subscribers.forEach(function(sub: Messenger, i: number){
        if(sub === observer) {
          this._subscribers.splice(i, 1);
          return false;
        }
      }, this);
    }

    /**
     * Removes every handler listening to this object.
     */
    public destroy() {
      this._subscribers.forEach(function(sub) {
        sub.remove(this);
      }, this);
    }

    /**
     * Listen to an object for its events
     *
     * @param  {Game.Messenger} obj
     * @param  {Function} cb
     */
    public listen(obj: Messenger, cb: (e: Event) => void) {
      var oid = obj.getId();
      // If the object has not already been listened to, subscribe this to it
      if(!this._subjects.hasOwnProperty(oid)) {
        obj.subscribe(this);
        this._subjects[oid] = obj;
      }
      // Set the callback for this object.
      // Note that each object can only have *exactly one* callback.
      this._listeners[oid] = cb;
    }

    /**
     * Called by the Messenger to notify its subscriber of an event.
     *
     * @param  {string} objId
     * @param  {Game.Event} e
     * @param  {object=} ctx Context to run the callback in. Defaults to the Messenger itself.
     */
    private notify(objId: string, e: Event, ctx?: any) {
      ctx = (ctx == null) ? this : ctx;
      /*
       * If the object is being listened to, call that callback with the event,
       * having the callback bound to the optional context.
       */
      if(this._listeners.hasOwnProperty(objId)) {
        (this._listeners[objId].bind(ctx))(e);
      }
    }

    /**
     * Remove an object from this observer's listening
     *
     * @param  {Game.Messenger} subject
     */
    public remove(subject: Messenger) {
      var sid = subject.getId();
      if(this._subjects.hasOwnProperty(sid)) {
        var s = this._subjects[sid];
        // Tell object to stop notifying this Messenger
        s.unsubscribe(this);
        // Get rid of listeners associated with this Messenger and remove this subject
        // from the list of subjects
        delete this._listeners[sid];
        delete this._subjects[sid];
      }
    }
  }
}