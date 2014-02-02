var Game = require('../build/game-library').Game;
var expect = require('chai').expect;

describe('Achievements', function() {
  var game = new Game.Application();
  game.init();
  var state = game.state;
  var achievements = game.achievements;
  describe('Structure', function() {
    it('Should have an addAchievement method', function() {
      expect(achievements).to.respondTo('addAchievement');
    });
    it('Should have an hasAchieved method', function() {
      expect(achievements).to.respondTo('hasAchieved');
    });
  });
  describe('Achievements', function() {
    describe('Basic achievement handling', function() {
      var observer = new Game.Observer();
      var events = [];
      var callback = function(e) {
        events.push(e);
      };
      observer.listen(achievements, callback);
      it('Should add achievements properly', function() {
        var data = [
          ['test']
        ];
        achievements.addAchievement('test', data);
        expect(achievements.achievements).to.have.property('test', data);
      });
      it('Should fire achievement event when an achievement is achieved', function() {
        state.fire('test');
        lastEvent = events.pop();
        expect(lastEvent).to.have.property('type', 'achievement');
        expect(lastEvent.data).to.have.property('name', 'test');
      });
      observer.remove(achievements);
    });
    describe('Different kinds of achievements', function() {
      var data = {
        basicCount: [
          ['asdf', null, 5]
        ],
        countData: [
          ['asdf', { type: 1 }, 5]
        ],
        multiple: [
          ['asdf3'],
          ['asdf4']
        ],
        countWithinTime: [
          ['asdf2', null, 5, 1000]
        ],
        withinTimeOf: [
          ['asdf', null, 1, 1000, 'asdf2']
        ],
        requireAchievement: [
          ['a:basicCount'],
          ['asdf5']
        ],
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
          state.fire('asdf', { type: (i / 3) | 0 });
        }
        expect(achievements.hasAchieved('basicCount')).to.be.true;
      });
      it('Should work with achievements that require a count with data', function() {
        expect(achievements.hasAchieved('countData')).to.be.false;
        for(var i = 1; i <= 2; i++) {
          state.fire('asdf', { type: 1 });
        }
        expect(achievements.hasAchieved('countData')).to.be.true;
      });
      it('Should work with multiple required events', function() {
        expect(achievements.hasAchieved('multiple')).to.be.false;
        state.fire('asdf3');
        expect(achievements.hasAchieved('multiple')).to.be.false;
        state.fire('asdf4');
        expect(achievements.hasAchieved('multiple')).to.be.true;
      });
      it('Should work with achievements that require a count within a time period', function(done) {
        this.timeout(2500);
        expect(achievements.hasAchieved('countWithinTime')).to.be.false;
        times = [];
        // Run the event 5 times in a 1500ms span
        for(var i = 1; i <= 4; i++) {
          state.fire('asdf2');
        }
        setTimeout(function() {
          state.fire('asdf2');
          expect(achievements.hasAchieved('countWithinTime')).to.be.false;
          times = [];
          for(var i = 1; i <= 4; i++) {
            state.fire('asdf2');
          }
        }, 1250);
        // Run the event 5 times in a 750ms span
        setTimeout(function() {
          state.fire('asdf2');
          expect(achievements.hasAchieved('countWithinTime')).to.be.true;
          done();
        }, 1250 + 750);
      });
      it('Should work with achievements that require an event to be fired within a time period after another event', function(done) {
        this.timeout(2500);
        state.fire('asdf');
        expect(achievements.hasAchieved('withinTimeOf')).to.be.false;
        setTimeout(function() {
          state.fire('asdf2');
          expect(achievements.hasAchieved('withinTimeOf')).to.be.false;
          state.fire('asdf');
        }, 1250);
        setTimeout(function() {
          state.fire('asdf2');
          expect(achievements.hasAchieved('withinTimeOf')).to.be.true;
          done();
        }, 1250 + 750);
      });
      it('Should work with achievements that require a prior achievement', function() {
        expect(achievements.hasAchieved('basicCount')).to.be.true;
        expect(achievements.hasAchieved('requireAchievement')).to.be.false;
        state.fire('asdf5');
        expect(achievements.hasAchieved('requireAchievement')).to.be.true;
      });
    });
  });
});