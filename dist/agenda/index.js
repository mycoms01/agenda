"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Agenda = void 0;
var human_interval_1 = __importDefault(require("human-interval"));
var events_1 = require("events");
var job_processing_queue_1 = require("./job-processing-queue");
var cancel_1 = require("./cancel");
var create_1 = require("./create");
var database_1 = require("./database");
var db_init_1 = require("./db-init");
var default_concurrency_1 = require("./default-concurrency");
var default_lock_lifetime_1 = require("./default-lock-lifetime");
var default_lock_limit_1 = require("./default-lock-limit");
var define_1 = require("./define");
var every_1 = require("./every");
var jobs_1 = require("./jobs");
var lock_limit_1 = require("./lock-limit");
var max_concurrency_1 = require("./max-concurrency");
var mongo_1 = require("./mongo");
var name_1 = require("./name");
var now_1 = require("./now");
var process_every_1 = require("./process-every");
var purge_1 = require("./purge");
var save_job_1 = require("./save-job");
var schedule_1 = require("./schedule");
var sort_1 = require("./sort");
var start_1 = require("./start");
var stop_1 = require("./stop");
var find_and_lock_next_job_1 = require("./find-and-lock-next-job");
/**
 * @class Agenda
 * @param {Object} config - Agenda Config
 * @param {Function} cb - Callback after Agenda has started and connected to mongo
 * @property {Object} _name - Name of the current Agenda queue
 * @property {Number} _processEvery
 * @property {Number} _defaultConcurrency
 * @property {Number} _maxConcurrency
 * @property {Number} _defaultLockLimit
 * @property {Number} _lockLimit
 * @property {Object} _definitions
 * @property {Object} _runningJobs
 * @property {Object} _lockedJobs
 * @property {Object} _jobQueue
 * @property {Number} _defaultLockLifetime
 * @property {Object} _sort
 * @property {Object} _indices
 * @property {Boolean} _isLockingOnTheFly - true if 'lockingOnTheFly' is currently running. Prevent concurrent execution of this method.
 * @property {Map} _isJobQueueFilling - A map of jobQueues and if the 'jobQueueFilling' method is currently running for a given map. 'lockingOnTheFly' and 'jobQueueFilling' should not run concurrently for the same jobQueue. It can cause that lock limits aren't honored.
 * @property {Array} _jobsToLock
 */
var Agenda = /** @class */ (function (_super) {
    __extends(Agenda, _super);
    function Agenda(config, cb) {
        if (config === void 0) { config = {}; }
        var _a;
        var _this = _super.call(this) || this;
        _this._name = config.name;
        _this._processEvery = ((_a = human_interval_1.default(config.processEvery)) !== null && _a !== void 0 ? _a : human_interval_1.default('5 seconds')); // eslint-disable-line @typescript-eslint/non-nullable-type-assertion-style
        _this._defaultConcurrency = config.defaultConcurrency || 5;
        _this._maxConcurrency = config.maxConcurrency || 20;
        _this._defaultLockLimit = config.defaultLockLimit || 0;
        _this._lockLimit = config.lockLimit || 0;
        _this._definitions = {};
        _this._runningJobs = [];
        _this._lockedJobs = [];
        _this._jobQueue = new job_processing_queue_1.JobProcessingQueue();
        _this._defaultLockLifetime = config.defaultLockLifetime || 10 * 60 * 1000; // 10 minute default lockLifetime
        _this._sort = config.sort || { nextRunAt: 1, priority: -1 };
        _this._indices = __assign(__assign({ name: 1 }, _this._sort), { priority: -1, lockedAt: 1, nextRunAt: 1, disabled: 1 });
        _this._isLockingOnTheFly = false;
        _this._isJobQueueFilling = new Map();
        _this._jobsToLock = [];
        _this._ready = new Promise(function (resolve) {
            _this.once('ready', resolve);
        });
        if (config.mongo) {
            _this.mongo(config.mongo, config.db ? config.db.collection : undefined, cb);
            if (config.mongo.s && config.mongo.topology && config.mongo.topology.s) {
                _this._mongoUseUnifiedTopology = Boolean(config.mongo.topology.s.options.useUnifiedTopology);
            }
        }
        else if (config.db) {
            _this.database(config.db.address, config.db.collection, config.db.options, cb);
        }
        return _this;
    }
    return Agenda;
}(events_1.EventEmitter));
exports.Agenda = Agenda;
Agenda.prototype._findAndLockNextJob = find_and_lock_next_job_1.findAndLockNextJob;
Agenda.prototype.cancel = cancel_1.cancel;
Agenda.prototype.create = create_1.create;
Agenda.prototype.database = database_1.database;
Agenda.prototype.db_init = db_init_1.dbInit;
Agenda.prototype.defaultConcurrency = default_concurrency_1.defaultConcurrency;
Agenda.prototype.defaultLockLifetime = default_lock_lifetime_1.defaultLockLifetime;
Agenda.prototype.defaultLockLimit = default_lock_limit_1.defaultLockLimit;
Agenda.prototype.define = define_1.define;
Agenda.prototype.every = every_1.every;
Agenda.prototype.jobs = jobs_1.jobs;
Agenda.prototype.lockLimit = lock_limit_1.lockLimit;
Agenda.prototype.maxConcurrency = max_concurrency_1.maxConcurrency;
Agenda.prototype.mongo = mongo_1.mongo;
Agenda.prototype.name = name_1.name;
Agenda.prototype.now = now_1.now;
Agenda.prototype.processEvery = process_every_1.processEvery;
Agenda.prototype.purge = purge_1.purge;
Agenda.prototype.saveJob = save_job_1.saveJob;
Agenda.prototype.schedule = schedule_1.schedule;
Agenda.prototype.sort = sort_1.sort;
Agenda.prototype.start = start_1.start;
Agenda.prototype.stop = stop_1.stop;
