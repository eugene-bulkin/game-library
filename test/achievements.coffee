Game = require('../build/game-library').Game
expect = require('chai').expect

describe 'Achievements', ->
  game = new Game.Application()
  game.init()
  state = game.state
  achievements = game.achievements
  describe 'Structure', ->
    it 'Should have an addAchievement method', ->
      expect(achievements).to.respondTo('addAchievement')
    it 'Should have an hasAchieved method', ->
      expect(achievements).to.respondTo('hasAchieved')
  describe 'Achievements', ->
    describe 'Basic achievement handling', ->
      observer = new Game.Observer()
      events = []
      callback = (e) ->
        events.push e
      observer.listen(achievements, callback)
      it 'Should add achievements properly', ->
        data = [
          ['test']
        ]
        achievements.addAchievement('test', data)
        expect(achievements.achievements).to.have.property('test', data)
      it 'Should fire achievement event when an achievement is achieved', ->
        state.fire('test')
        lastEvent = events.pop()
        expect(lastEvent).to.have.property('type', 'achievement')
        expect(lastEvent.data).to.have.property('name', 'test')
      observer.remove(achievements)
    describe 'Different kinds of achievements', ->
      data = {
        basicCount: [
          ['asdf', null, 5]
        ]
        countData: [
          ['asdf', { type: 1 }, 5]
        ]
        multiple: [
          ['asdf3']
          ['asdf4']
        ]
        countWithinTime: [
          ['asdf2', null, 5, 1000]
        ]
        withinTimeOf: [
          ['asdf', null, 1, 1000, 'asdf2']
        ]
        requireAchievement: [
          ['a:basicCount']
          ['asdf5']
        ]
      }
      for name, reqs of data
        try
          achievements.addAchievement(name, reqs)
        catch
          break
      it 'Should work with achievements that require a count', ->
        expect(achievements.hasAchieved('basicCount')).to.be.false
        for i in [1..5]
          state.fire('asdf', { type: (i / 3) | 0 })
        expect(achievements.hasAchieved('basicCount')).to.be.true
      it 'Should work with achievements that require a count with data', ->
        expect(achievements.hasAchieved('countData')).to.be.false
        for i in [1..2]
          state.fire('asdf', { type: 1 })
        expect(achievements.hasAchieved('countData')).to.be.true
      it 'Should work with multiple required events', ->
        expect(achievements.hasAchieved('multiple')).to.be.false
        state.fire('asdf3')
        expect(achievements.hasAchieved('multiple')).to.be.false
        state.fire('asdf4')
        expect(achievements.hasAchieved('multiple')).to.be.true
      it 'Should work with achievements that require a count within a time period', (done) ->
        this.timeout(2500)
        expect(achievements.hasAchieved('countWithinTime')).to.be.false
        times = []
        # Run the event 5 times in a 1500ms span
        for i in [1..4]
          state.fire('asdf2')
        setTimeout(() ->
          state.fire('asdf2')
          expect(achievements.hasAchieved('countWithinTime')).to.be.false
          times = []
          for i in [1..4]
            state.fire('asdf2')
        , 1250)
        # Run the event 5 times in a 750ms span
        setTimeout(() ->
          state.fire('asdf2')
          expect(achievements.hasAchieved('countWithinTime')).to.be.true
          done()
        , 1250 + 750)
      it 'Should work with achievements that require an event to be fired within a time period after another event', (done) ->
        this.timeout(2500)
        state.fire('asdf')
        expect(achievements.hasAchieved('withinTimeOf')).to.be.false
        setTimeout(() ->
          state.fire('asdf2')
          expect(achievements.hasAchieved('withinTimeOf')).to.be.false
          state.fire('asdf')
        , 1250)
        setTimeout(() ->
          state.fire('asdf2')
          expect(achievements.hasAchieved('withinTimeOf')).to.be.true
          done()
        , 1250 + 750)
      it 'Should work with achievements that require a prior achievement', ->
        expect(achievements.hasAchieved('basicCount')).to.be.true
        expect(achievements.hasAchieved('requireAchievement')).to.be.false
        state.fire('asdf5')
        expect(achievements.hasAchieved('requireAchievement')).to.be.true