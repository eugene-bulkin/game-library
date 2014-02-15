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
    constructor(message?: string, ...data: any[]) {
      // replace {{n}} with data[n-1] everywhere
      message = message || "";
      this.message = message.replace(/{{(\d+)}}/g, function(match, id) {
        return data[id - 1] || "";
      });
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
      NOT_ADDED: "Object was not added to state.",
      BAD_SCORE_DATA: "Score can only change by numerical amounts.",
      LEVEL_NOT_EXIST: "Specified level {{1}} does not exist.",
      REMOVE_CUR_LEVEL: "Cannot remove current level.",
      ADVANCE_CUR_LEVEL: "Cannot advance to current level."
    };
  }
}