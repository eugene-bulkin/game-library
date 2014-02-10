var Game = require('../build/game-library').Game;
var expect = require('chai').expect;

describe('Achievements', function() {
  var game = new Game.Application();
  game.init();
  var state = game.state;
  var achievements = game.achievements;
  var o = new Game.GameObject();
  state.addObject(o);
  describe('Structure', function() {
    it('Should have an addAchievement method', function() {
      expect(achievements).to.respondTo('addAchievement');
    });
    it('Should have an hasAchieved method', function() {
      expect(achievements).to.respondTo('hasAchieved');
    });
  });
  describe('Achievements', function() {
    var observer = new Game.Messenger();
    after(function() {
      observer.remove(achievements);
    });
    describe('Basic achievement handling', function() {
      var events = [];
      var callback = function(e) {
        events.push(e);
      };
      observer.listen(achievements, callback);
      it('Should add achievements properly', function() {
        var data = [
          { name: 'test' }
        ];
        achievements.addAchievement('test', data);
        expect(achievements.achievements).to.have.property('test', data);
      });
      it('Should fire achievement event when an achievement is achieved', function() {
        o.fire('test');
        lastEvent = events.pop();
        expect(lastEvent).to.not.be.undefined;
        expect(lastEvent).to.have.property('type', 'achievement');
        expect(lastEvent.data).to.have.property('name', 'test');
      });
    });
    describe('Different kinds of achievements', function() {
      var data = {
        basicCount: [
          { name: 'asdf', count: 5 }
        ],
        countData: [
          { name: 'asdf', count: 5, data: { type: 1 } }
        ],
        multiple: [
          { name: 'asdf3' },
          { name: 'asdf4' }
        ],
        countWithinTime: [
          { name: 'asdf2', count: 5, within: 1000 }
        ],
        withinTimeOf: [
          { name: 'asdf', count: 1, within: 1000, prereq: 'asdf6' }
        ],
        requireAchievement: [
          { name: 'a:basicCount' },
          { name: 'asdf5' }
        ],
        exactScore: [
          { name: 'scoreChange', data: 100 }
        ],
        atLeastScore: [
          { name: 'scoreChange', data: { $gt: 150 } }
        ]
      };
      Object.keys(data).forEach(function(name) {
        var reqs = data[name];
        try {
          achievements.addAchievement(name, reqs);
        } catch(e) {
          return false;
        }
      });
      it('Should work with achievements that require a count', function() {
        expect(achievements.hasAchieved('basicCount')).to.be.false;
        for(var i = 1; i <= 5; i++) {
          o.fire('asdf', { type: (i / 3) | 0 });
        }
        expect(achievements.hasAchieved('basicCount')).to.be.true;
      });
      it('Should work with achievements that require a count with data', function() {
        expect(achievements.hasAchieved('countData')).to.be.false;
        for(var i = 1; i <= 2; i++) {
          o.fire('asdf', { type: 1, blah: 4 });
        }
        expect(achievements.hasAchieved('countData')).to.be.true;
      });
      it('Should work with multiple required events', function() {
        expect(achievements.hasAchieved('multiple')).to.be.false;
        o.fire('asdf3');
        expect(achievements.hasAchieved('multiple')).to.be.false;
        o.fire('asdf4');
        expect(achievements.hasAchieved('multiple')).to.be.true;
      });
      it('Should work with achievements that require a count within a time period', function(done) {
        this.timeout(2500);
        expect(achievements.hasAchieved('countWithinTime')).to.be.false;
        times = [];
        // Run the event 5 times in a 1500ms span
        for(var i = 1; i <= 4; i++) {
          o.fire('asdf2');
        }
        setTimeout(function() {
          o.fire('asdf2');
          expect(achievements.hasAchieved('countWithinTime')).to.be.false;
          times = [];
          for(var i = 1; i <= 4; i++) {
            o.fire('asdf2');
          }
        }, 1250);
        // Run the event 5 times in a 750ms span
        setTimeout(function() {
          o.fire('asdf2');
          expect(achievements.hasAchieved('countWithinTime')).to.be.true;
          done();
        }, 1250 + 750);
      });
      it('Should work with achievements that require an event to be fired within a time period after another event', function(done) {
        this.timeout(2500);
        o.fire('asdf');
        expect(achievements.hasAchieved('withinTimeOf')).to.be.false;
        setTimeout(function() {
          o.fire('asdf6');
          expect(achievements.hasAchieved('withinTimeOf')).to.be.false;
          o.fire('asdf');
        }, 1250);
        setTimeout(function() {
          o.fire('asdf6');
          expect(achievements.hasAchieved('withinTimeOf')).to.be.true;
          done();
        }, 1250 + 750);
      });
      it('Should work with achievements that require a prior achievement', function() {
        expect(achievements.hasAchieved('basicCount')).to.be.true;
        expect(achievements.hasAchieved('requireAchievement')).to.be.false;
        o.fire('asdf5');
        expect(achievements.hasAchieved('requireAchievement')).to.be.true;
      });
      it('Should work with exact score achievements', function() {
        expect(achievements.hasAchieved('exactScore')).to.be.false;
        o.fire('score', 50);
        expect(achievements.hasAchieved('exactScore')).to.be.false;
        o.fire('score', 50);
        expect(achievements.hasAchieved('exactScore')).to.be.true;
      });
      it('Should work with at least score achievements', function() {
        expect(achievements.hasAchieved('atLeastScore')).to.be.false;
        o.fire('score', 30);
        expect(achievements.hasAchieved('atLeastScore')).to.be.false;
        o.fire('score', 30);
        expect(achievements.hasAchieved('atLeastScore')).to.be.true;
      });
    });
  });
});