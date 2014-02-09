module Game {
  export class Utils {
    static guid(): string {
      var s4 = function() {
        return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1)
      };
      return s4() + s4() + "-" + s4() + "-" + s4() + "-" + s4() + "-" + s4() + s4() + s4();
    }

    static extend(child: any, parent: any): void {
      if(!parent) {
        return;
      }
      child.prototype = Object.create(parent.prototype);
    }
  }
}