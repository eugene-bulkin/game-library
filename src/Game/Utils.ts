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

    /**
     * Check whether data is a subset of object
     *
     * @param  {object} object
     * @param  {object} data
     *
     * @return {Boolean}
     */
    static matchData(object: any, data: any): boolean {
      var relations = ["$gt", "$lt", "$lte", "$gte"];
      var isRelation = typeof data === 'object' && relations.some(function(k){ return data[k]; });
      if(isRelation) {
        var result = true;
        relations.forEach(function(k){
          var v = data[k];
          if(v) {
            switch(k) {
              case "$gt":
                result = result && object > v;
                break;
              case "$lt":
                result = result && object < v;
                break;
              case "$gte":
                result = result && object >= v;
                break;
              case "$lte":
                result = result && object <= v;
                break;
              default:
                break;
            }
          }
        });
        return result;
      }
      if(typeof data !== typeof object) {
        return false;
      } else if(typeof data === 'object') {
        return Object.keys(data).every(function(key) {
          return Utils.matchData(object[key], data[key]);
        }, this);
      } else {
        return data === object;
      }
    }
  }
}