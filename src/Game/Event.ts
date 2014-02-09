module Game {
  export class Event {
    type: string;
    data: any;
    target: any;
    /**
     * Creates an Event class that stores some information about the event and
     * its context of firing.
     *
     * @param {string} type
     * @param {object=} data
     * @param {object=} target
     *
     * @constructor
     */
    constructor(type: string, data?: any, target?: any) {
      this.type = type;
      this.data = data;
      this.target = target;
    }
  }
}