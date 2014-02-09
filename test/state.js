var Game = require('../build/game-library').Game;
var expect = require('chai').expect;
var Player = require('./player');

describe('Game State', function() {
  describe('Adding/removing objects', function() {
    var game = new Game.Application();
    game.init();
    var state = game.state;
    var p = new Player();
    var pid = p.getId();
    var addedTime = null;
    describe('Adding objects', function() {
      it('Should have addObject method', function() {
        expect(state).to.respondTo('addObject');
      });
      it('Should add an object correctly', function() {
        state.addObject(p);
        addedTime = new Date();
        expect(state.objects).to.have.property(pid, p, 'Object must be stored in state.objects');
      });
      it('Should notice creation event', function() {
        // Game.GameObject.added fires a create method
        expect(state.eventCounters).to.have.property('create')
          .that.have.length(1, 'create event must have been fired once');
      });
      it("Shouldn't let you add non Game.GameObject instance", function() {
        addNonObject = function() {
          state.addObject('asdf');
        };
        expect(addNonObject).to.throw(Game.GameError, Game.GameError.ErrorType.NOT_OBJECT);
      });
      it("Shouldn't let you add object more than once", function() {
        addObjectTwice = function() {
          state.addObject(p);
        };
        expect(addObjectTwice).to.throw(Game.GameError, Game.GameError.ErrorType.ALREADY_ADDED);
      });
    });
    describe('Removing objects', function() {
      it('Should have removebject method', function() {
        expect(state).to.respondTo('removeObject');
      });
      it('Should remove an object correctly', function() {
        state.removeObject(p);
        expect(state.objects).to.not.have.property(pid);
      });
      it("Shouldn't let you remove non Game.GameObject instance", function() {
        removeNonObject = function() {
          state.removeObject('asdf');
        };
        expect(removeNonObject).to.throw(Game.GameError, Game.GameError.ErrorType.NOT_OBJECT);
      });
      it("Shouldn't let you remove object type", function() {
        removeObjectTwice = function() {
          state.removeObject(p);
        };
        expect(removeObjectTwice).to.throw(Game.GameError, Game.GameError.ErrorType.NOT_ADDED);
      });
    });
  });
  describe('Event handling', function() {
    var game = new Game.Application();
    game.init();
    var state = game.state;
    var p = new Player();
    var pid = p.getId();
    try {
      state.addObject(p);
    } catch(e) {
      console.log(e);
      return;
    }
    var events = [];
    var cb = function(e) {
      events.push(e);
    };
    it('Should have addEventHandler method', function() {
      expect(state).to.respondTo('addEventHandler');
    });
    it('Should be able to add an event handler properly', function() {
      state.addEventHandler('damage', cb);
      expect(state.eventHandlers).to.have.property('damage')
        .that.contain(cb, 'damage event handler must be added');
    });
    it('Should handle the event properly', function() {
      var damage = (Math.random() * 100) | 0;
      p.damage(damage);
      expect(state.eventCounters['damage']).to.have.length(1, 'Must have been counted only once');
      expect(events).to.have.length(1, 'Must have only one event be fired');
      expect(events[0]).to.be.instanceof(Game.Event)
        .and.to.have.property('type', 'damage');
      expect(events[0]).to.have.property('data');
      expect(events[0].data).to.have.property('amount', damage);
      expect(events[0].data).to.have.property('curHP', 100 - damage);
    });
    it('Should handle multiple callbacks', function() {
      state.addEventHandler('useMP', cb);
      state.addEventHandler('useMP_fail', cb);
      var damage = (Math.random() * 100) | 0;
      var mp = (Math.random() * 50) | 0;
      p.damage(damage);
      p.useMP(mp);
      p.useMP(100);
      expect(events).to.have.length(4, 'Registered all 3 events');
      expect(events[1]).to.have.property('type', 'damage');
      expect(events[1]).to.have.property('data').with.property('amount', damage);
      expect(events[2]).to.have.property('type', 'useMP');
      expect(events[2]).to.have.property('data');
      expect(events[2].data).to.have.property('amount', mp);
      expect(events[2].data).to.have.property('curMP', 50 - mp);
      expect(events[3]).to.have.property('type', 'useMP_fail');
      expect(events[3]).to.have.property('data');
      expect(events[3].data).to.have.property('amount', 100);
      expect(events[3].data).to.have.property('curMP', 50 - mp);
    });
    it('Should have removeEventHandler method', function() {
      expect(state).to.respondTo('removeEventHandler');
    });
    it('Should remove event handler properly', function() {
      state.removeEventHandler('damage', cb);
      expect(state.eventHandlers.damage).to.not.contain(cb);
      p.damage(50);
      expect(events).to.have.length(4, 'Damage event not triggered after event handler removed');
    });
  });
});