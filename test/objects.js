var Game = require('../build/game-library').Game;
var expect = require('chai').expect;
var Player = require('./player');

describe('Objects', function() {
  describe('Custom Player object', function() {
    var p = new Player();
    describe('Test construction', function() {
      it('Should have MP and HP at defaults', function() {
        expect(p.hp).to.equal(100);
        expect(p.mp).to.equal(50);
      });
      it('Should have inherited Game.Object methods', function() {
        expect(p).to.respondTo('added');
        expect(p).to.be.an.instanceof(Game.Object);
      });
      it('Should have inherited Game.Messenger methods', function() {
        expect(p).to.have.property('_id');
        expect(p).to.respondTo('getId');
        expect(p).to.respondTo('fire');
        expect(p).to.respondTo('subscribe');
        expect(p).to.respondTo('unsubscribe');
        expect(p).to.respondTo('destroy');
        expect(p).to.respondTo('listen');
        expect(p).to.respondTo('notify');
        expect(p).to.respondTo('remove');
        expect(p).to.be.an.instanceof(Game.Messenger);
      });
    });
    describe('Test methods', function() {
      beforeEach(function() {
        // reset player hp and mp each time
        p.hp = 100;
        p.mp = 50;
      });
      it('Should take damage', function() {
        var result = p.damage(15);
        expect(result).to.be.true;
        expect(p.hp).to.equal(85);
      });
      it('Should have HP go to zero if damage is greater than HP', function() {
        var result = p.damage(150);
        expect(result).to.be.true;
        expect(p.hp).to.equal(0);
      });
      it('Should be able to use MP', function() {
        var result = p.useMP(15);
        expect(result).to.be.true;
        expect(p.mp).to.equal(35);
      });
      it('Should not allow you to use more MP than you have', function() {
        var result = p.useMP(150);
        expect(result).to.be.false;
        expect(p.mp).to.equal(50);
      });
    });
  });
});