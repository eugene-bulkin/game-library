var Game = require('../build/game-library').Game;
var chai = require('chai');
chai.use(require('chai-things'));
var expect = chai.expect;

describe('Events', function() {
  var parent = new Game.Observer(),
      child1 = new Game.Publisher(),
      child2 = new Game.Publisher(),
      lastEvent = null,
      lastCtx = null;
  var callback = function(e) {
    lastCtx = this;
    lastEvent = e;
  };
  describe('Listening', function() {
    it('Should be able to listen to children', function() {
      parent.listen(child1, callback);
      parent.listen(child2, callback);
    });
    it('Child subscribers should contain parent', function() {
      expect(child1._subscribers).to.contain.something.that.deep.equals(parent);
      expect(child2._subscribers).to.contain.something.that.deep.equals(parent);
    });
    it('Parent should have children in subjects and listeners', function() {
      expect(parent._subjects).to.have.property(child1.getId());
      expect(parent._subjects).to.have.property(child2.getId());
      expect(parent._listeners).to.have.property(child1.getId());
      expect(parent._listeners).to.have.property(child2.getId());
    });
  });
  describe('Firing events', function() {
    it('Should be able to fire string event and cast to Game.Event', function() {
      child1.fire('test');
      expect(lastEvent).to.be.instanceof(Game.Event);
      expect(lastEvent.type).to.equal('test');
      expect(lastEvent.target).to.equal(child1);
    });
    it('Should be able to fire Game.Event', function() {
      var evt = new Game.Event('test2');
      child1.fire(evt);
      expect(lastEvent).to.be.instanceof(Game.Event);
      expect(lastEvent.type).to.equal('test2');
      expect(lastEvent.target).to.equal(child1);
    });
    it('Should be able to fire event with data', function() {
      data = 1234;
      child2.fire('test', data);
      expect(lastEvent.data).to.equal(data);
    });
    it("Should be able to fire event with data overwriting old event's data", function() {
      var evt = new Game.Event('test', 1234);
      var data = 567;
      child2.fire(evt, data);
      expect(lastEvent.data).to.equal(data);
    });
    it('Should be able to fire event with different context', function() {
      var ctx = { thing: 4 };
      child1.fire('test', null, ctx);
      expect(lastCtx).to.equal(ctx);
    });
  });
  describe('Unlistening', function() {
    it('Should be able to remove subject', function() {
      lastEvent = null;
      parent.remove(child1);
      expect(child1._subscribers).to.not.contain(parent);
      expect(parent._subjects).to.not.have.property(child1.getId());
      expect(parent._listeners).to.not.have.property(child1.getId());
    });
    it('Should not recieve events anymore', function() {
      child1.fire('test');
      expect(lastEvent).to.be.null;
    });
  });
});