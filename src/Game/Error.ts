// apparently TypeScript thinks Error doesn't have a stack?
interface Error {
  stack: string;
}

module Game {
  export class GameError implements Error {
    public name: string = "GameError";
    public message: string;
    public stack: string;
    /**
     * Game's internal Error class
     *
     * @param {string} message
     * @constructor
     */
    constructor(message?: string) {
      this.message = message;
      this.stack = (new Error()).stack;
    }

    public toString() {
      return this.name + ": " + this.message;
    }

    /**
     * A hash of error types.
     *
     * @readonly
     * @type {String}
     */
    static ErrorType = {
      NOT_OBJECT: "You must call this method with a Game.Object instance.",
      ALREADY_ADDED: "Object already added to state.",
      NOT_ADDED: "Object was not added to state."
    };
  }
}