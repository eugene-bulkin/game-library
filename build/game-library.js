;(function( window, undefined ){ 
 "use strict";
var Game;
(function (Game) {
    var Utils = (function () {
        function Utils() {
        }
        Utils.guid = function () {
            var s4 = function () {
                return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
            };
            return s4() + s4() + "-" + s4() + "-" + s4() + "-" + s4() + "-" + s4() + s4() + s4();
        };

        Utils.extend = function (child, parent) {
            if (!parent) {
                return;
            }
            child.prototype = Object.create(parent.prototype);
        };

        Utils.matchData = function (object, data) {
            var relations = ["$gt", "$lt", "$lte", "$gte"];
            var isRelation = typeof data === 'object' && relations.some(function (k) {
                return data[k];
            });
            if (isRelation) {
                var result = true;
                relations.forEach(function (k) {
                    var v = data[k];
                    if (v) {
                        switch (k) {
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
            if (typeof data !== typeof object) {
                return false;
            } else if (typeof data === 'object') {
                return Object.keys(data).every(function (key) {
                    return Utils.matchData(object[key], data[key]);
                }, this);
            } else {
                return data === object;
            }
        };
        return Utils;
    })();
    Game.Utils = Utils;
})(Game || (Game = {}));
var Game;
(function (Game) {
    var Event = (function () {
        function Event(type, data, target) {
            this.type = type;
            this.data = data;
            this.target = target;
        }
        return Event;
    })();
    Game.Event = Event;
})(Game || (Game = {}));
var Game;
(function (Game) {
    var Messenger = (function () {
        function Messenger() {
            this._subscribers = [];

            this._id = Game.Utils.guid();

            this._subjects = {};

            this._listeners = {};
        }
        Messenger.prototype.getId = function () {
            return this._id;
        };

        Messenger.prototype.fire = function (e, data, ctx) {
            if (e instanceof Game.Event) {
                e.data = data || e.data;
            } else {
                e = new Game.Event(e, data);
            }

            e.target = this;

            this._subscribers.forEach(function (sub) {
                sub.notify(this._id, e, ctx);
            }, this);
        };

        Messenger.prototype.subscribe = function (observer) {
            this._subscribers.push(observer);
        };

        Messenger.prototype.unsubscribe = function (observer) {
            this._subscribers.forEach(function (sub, i) {
                if (sub === observer) {
                    this._subscribers.splice(i, 1);
                    return false;
                }
            }, this);
        };

        Messenger.prototype.destroy = function () {
            this._subscribers.forEach(function (sub) {
                sub.remove(this);
            }, this);
        };

        Messenger.prototype.listen = function (obj, cb) {
            var oid = obj.getId();

            if (!this._subjects.hasOwnProperty(oid)) {
                obj.subscribe(this);
                this._subjects[oid] = obj;
            }

            this._listeners[oid] = cb;
        };

        Messenger.prototype.notify = function (objId, e, ctx) {
            ctx = (ctx == null) ? this : ctx;

            if (this._listeners.hasOwnProperty(objId)) {
                (this._listeners[objId].bind(ctx))(e);
            }
        };

        Messenger.prototype.remove = function (subject) {
            var sid = subject.getId();
            if (this._subjects.hasOwnProperty(sid)) {
                var s = this._subjects[sid];

                s.unsubscribe(this);

                delete this._listeners[sid];
                delete this._subjects[sid];
            }
        };
        return Messenger;
    })();
    Game.Messenger = Messenger;
})(Game || (Game = {}));
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Game;
(function (Game) {
    var GameObject = (function (_super) {
        __extends(GameObject, _super);
        function GameObject() {
            _super.call(this);
        }
        GameObject.prototype.added = function () {
            this.fire('create', this);
        };
        return GameObject;
    })(Game.Messenger);
    Game.GameObject = GameObject;
})(Game || (Game = {}));

var Game;
(function (Game) {
    var GameError = (function () {
        function GameError(message) {
            var data = [];
            for (var _i = 0; _i < (arguments.length - 1); _i++) {
                data[_i] = arguments[_i + 1];
            }
            this.name = "GameError";
            message = message || "";
            this.message = message.replace(/{{(\d+)}}/g, function (match, id) {
                return data[id - 1] || "";
            });
            this.stack = (new Error()).stack;
        }
        GameError.prototype.toString = function () {
            return this.name + ": " + this.message;
        };

        GameError.ErrorType = {
            NOT_OBJECT: "You must call this method with a Game.Object instance.",
            ALREADY_ADDED: "Object already added to state.",
            NOT_ADDED: "Object was not added to state.",
            BAD_SCORE_DATA: "Score can only change by numerical amounts.",
            LEVEL_NOT_EXIST: "Specified level {{1}} does not exist.",
            REMOVE_CUR_LEVEL: "Cannot remove current level.",
            ADVANCE_CUR_LEVEL: "Cannot advance to current level."
        };
        return GameError;
    })();
    Game.GameError = GameError;
})(Game || (Game = {}));
var Game;
(function (Game) {
    var State = (function (_super) {
        __extends(State, _super);
        function State() {
            _super.call(this);

            this.objects = {};

            this.eventCounters = {};

            this.eventHandlers = {};

            this.score = 0;
        }
        State.prototype.onScore = function (e) {
            if (typeof e.data !== 'number') {
                throw new Game.GameError(Game.GameError.ErrorType.BAD_SCORE_DATA);
            }
            this.score += e.data;
            e.target.fire('scoreChange', this.score);
        };

        State.prototype.onEvent = function (e) {
            if (e.type === 'score') {
                this.onScore(e);
            }

            if (!this.eventCounters.hasOwnProperty(e.type)) {
                this.eventCounters[e.type] = [];
            }
            if (!this.eventHandlers.hasOwnProperty(e.type)) {
                this.eventHandlers[e.type] = [];
            }

            this.eventCounters[e.type].push({
                time: new Date(),
                data: e.data
            });

            this.fire(e);

            this.eventHandlers[e.type].forEach(function (cb) {
                cb(e);
            });
        };

        State.prototype.addObject = function (obj) {
            var args = [];
            for (var _i = 0; _i < (arguments.length - 1); _i++) {
                args[_i] = arguments[_i + 1];
            }
            if (!(obj instanceof Game.GameObject)) {
                throw new Game.GameError(Game.GameError.ErrorType.NOT_OBJECT);
            }
            var oid = obj.getId();
            if (this.objects.hasOwnProperty(oid)) {
                throw new Game.GameError(Game.GameError.ErrorType.ALREADY_ADDED);
            }

            this.objects[oid] = obj;

            this.listen(obj, this.onEvent);

            obj.added.apply(obj, args);
        };

        State.prototype.removeObject = function (obj) {
            if (!(obj instanceof Game.GameObject)) {
                throw new Game.GameError(Game.GameError.ErrorType.NOT_OBJECT);
            }
            var oid = obj.getId();

            if (this.objects.hasOwnProperty(oid)) {
                delete this.objects[oid];

                this.remove(obj);
            } else {
                throw new Game.GameError(Game.GameError.ErrorType.NOT_ADDED);
            }
        };

        State.prototype.addEventHandler = function (evtType, callback) {
            if (!this.eventHandlers.hasOwnProperty(evtType)) {
                this.eventHandlers[evtType] = [];
            }

            if (this.eventHandlers[evtType].indexOf(callback) === -1) {
                this.eventHandlers[evtType].push(callback);
            }
        };

        State.prototype.removeEventHandler = function (evtType, callback) {
            if (this.eventHandlers.hasOwnProperty(evtType)) {
                this.eventHandlers[evtType].forEach(function (cb, i) {
                    if (cb === callback) {
                        this.eventHandlers[evtType].splice(i, 1);
                        return false;
                    }
                }, this);
            }
        };
        return State;
    })(Game.Messenger);
    Game.State = State;
})(Game || (Game = {}));
var Game;
(function (Game) {
    var StateTracker = (function (_super) {
        __extends(StateTracker, _super);
        function StateTracker(state) {
            _super.call(this);

            this.state = state;

            this.eventCounters = {};

            this.init();
        }
        StateTracker.prototype.init = function () {
            this.listen(this.state, this.onEvent);
        };

        StateTracker.prototype.onEvent = function (e) {
            if (!this.eventCounters.hasOwnProperty(e.type)) {
                this.eventCounters[e.type] = [];
            }

            this.eventCounters[e.type].push({
                time: new Date(),
                data: e.data
            });
        };
        return StateTracker;
    })(Game.Messenger);
    Game.StateTracker = StateTracker;
})(Game || (Game = {}));
var Game;
(function (Game) {
    var Achievements = (function (_super) {
        __extends(Achievements, _super);
        function Achievements(state) {
            _super.call(this, state);

            this.achievements = {};

            this.achieved = {};
        }
        Achievements.prototype.satisfied = function (req) {
            if (!req.name) {
                return false;
            }

            if (req.prereq && !req.within) {
                return false;
            }
            var achMatch = req.name.match(/^a:(.+)$/);
            if (achMatch) {
                return this.hasAchieved(achMatch[1]);
            }
            if (!this.eventCounters.hasOwnProperty(req.name)) {
                return false;
            }
            var counter = this.eventCounters[req.name];

            var count = (req.count && req.count > 0) ? req.count : 1;

            if (req.data) {
                counter = counter.filter(function (e) {
                    return Game.Utils.matchData(e.data, req.data);
                }, this);
            }

            if (req.within) {
                var origin = new Date();
                if (req.prereq) {
                    if (!this.eventCounters[req.prereq]) {
                        return false;
                    }
                    origin = this.eventCounters[req.prereq].slice(-1)[0].time;
                }
                counter = counter.filter(function (e) {
                    return (origin.getTime() - e.time.getTime() <= req.within);
                });
            }
            return (counter.length >= count);
        };

        Achievements.prototype.onEvent = function (e) {
            _super.prototype.onEvent.call(this, e);
            Object.keys(this.achievements).forEach(function (name) {
                var reqs = this.achievements[name];
                var achieved = reqs.every(this.satisfied, this);
                if (achieved) {
                    this.fire('achievement', { name: name, reqs: reqs });

                    this.achieved[name] = reqs;
                    delete this.achievements[name];
                }
            }, this);
        };

        Achievements.prototype.hasAchieved = function (name) {
            return this.achieved.hasOwnProperty(name);
        };

        Achievements.prototype.addAchievement = function (name, requirements) {
            this.achievements[name] = requirements;
        };
        return Achievements;
    })(Game.StateTracker);
    Game.Achievements = Achievements;
})(Game || (Game = {}));
var Game;
(function (Game) {
    var Application = (function (_super) {
        __extends(Application, _super);
        function Application() {
            _super.call(this);
        }
        Application.prototype.init = function () {
            this.state = new Game.State();

            this.achievements = new Game.Achievements(this.state);
        };
        return Application;
    })(Game.Messenger);
    Game.Application = Application;
})(Game || (Game = {}));
var Game;
(function (Game) {
    var Plot = (function (_super) {
        __extends(Plot, _super);
        function Plot(state) {
            _super.call(this, state);
            this.currentLevel = 0;
        }
        Plot.prototype.addLevel = function (data, goals, effects) {
            this.levels.push({
                data: data,
                goals: goals || [],
                effects: effects || []
            });
            return this.levels.length - 1;
        };

        Plot.prototype.removeLevel = function (id) {
            if (id < 0 || id >= this.levels.length) {
                throw new Game.GameError(Game.GameError.ErrorType.LEVEL_NOT_EXIST, id);
            }
            if (id === this.currentLevel) {
                throw new Game.GameError(Game.GameError.ErrorType.REMOVE_CUR_LEVEL);
            }
            this.levels.splice(id, 1);

            if (id < this.currentLevel) {
                this.currentLevel -= 1;
            }
        };

        Plot.prototype.addGoals = function (goals, id) {
            if (id < 0 || id >= this.levels.length) {
                throw new Game.GameError(Game.GameError.ErrorType.LEVEL_NOT_EXIST, id);
            }
            id = id || this.currentLevel;
            this.levels[id].goals.push.apply(this.levels[id].goals, goals);
        };

        Plot.prototype.addEffects = function (effects, id) {
            if (id < 0 || id >= this.levels.length) {
                throw new Game.GameError(Game.GameError.ErrorType.LEVEL_NOT_EXIST, id);
            }
            id = id || this.currentLevel;
            this.levels[id].effects.push.apply(this.levels[id].effects, effects);
        };

        Plot.prototype.advance = function (id) {
            id = id || this.currentLevel + 1;
            if (id < 0 || id >= this.levels.length) {
                throw new Game.GameError(Game.GameError.ErrorType.LEVEL_NOT_EXIST, id);
            }
            if (id === this.currentLevel) {
                throw new Game.GameError(Game.GameError.ErrorType.ADVANCE_CUR_LEVEL);
            }
            this.currentLevel = id;
            this.fire('advance', this.currentLevel);
        };

        Plot.prototype.satisfied = function (req) {
            if (!req.name) {
                return false;
            }

            if (req.prereq && !req.within) {
                return false;
            }
            if (!this.eventCounters.hasOwnProperty(req.name)) {
                return false;
            }
            var counter = this.eventCounters[req.name];

            var count = (req.count && req.count > 0) ? req.count : 1;

            if (req.data) {
                counter = counter.filter(function (e) {
                    return Game.Utils.matchData(e.data, req.data);
                }, this);
            }

            if (req.within) {
                var origin = new Date();
                if (req.prereq) {
                    if (!this.eventCounters[req.prereq]) {
                        return false;
                    }
                    origin = this.eventCounters[req.prereq].slice(-1)[0].time;
                }
                counter = counter.filter(function (e) {
                    return (origin.getTime() - e.time.getTime() <= req.within);
                });
            }
            return (counter.length >= count);
        };

        Plot.prototype.onEvent = function (e) {
            _super.prototype.onEvent.call(this, e);

            var goalsAchieved = this.levels[this.currentLevel].goals.every(this.satisfied, this);
            if (goalsAchieved) {
                this.fire('levelCompleted', this.currentLevel);
                this.eventCounters = {};
            }
        };
        return Plot;
    })(Game.StateTracker);
    Game.Plot = Plot;
})(Game || (Game = {}));
//# sourceMappingURL=game-library.js.map

window.Game = Game; 
}.bind(this)(this));