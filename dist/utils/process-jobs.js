"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.processJobs = void 0;
var debug_1 = __importDefault(require("debug"));
var create_job_1 = require("./create-job");
var debug = debug_1.default('agenda:internal:processJobs');
/**
 * Process methods for jobs
 * @param {Job} extraJob job to run immediately
 */
var processJobs = function (extraJob) {
    var _a, _b, _c, _d;
    return __awaiter(this, void 0, void 0, function () {
        /**
         * Returns true if a job of the specified name can be locked.
         * Considers maximum locked jobs at any time if self._lockLimit is > 0
         * Considers maximum locked jobs of the specified name at any time if jobDefinition.lockLimit is > 0
         * @param name name of job to check if we should lock or not
         * @returns whether or not you should lock job
         */
        function shouldLock(name) {
            var jobDefinition = definitions[name];
            var shouldLock = true;
            if (self._lockLimit && self._lockLimit <= self._lockedJobs.length) {
                shouldLock = false;
            }
            if (jobDefinition.lockLimit && jobDefinition.lockLimit <= jobDefinition.locked) {
                shouldLock = false;
            }
            debug('job [%s] lock status: shouldLock = %s', name, shouldLock);
            return shouldLock;
        }
        /**
         * Internal method that adds jobs to be processed to the local queue
         * @param jobs Jobs to queue
         */
        function enqueueJobs(jobs) {
            if (!Array.isArray(jobs)) {
                jobs = [jobs];
            }
            jobs.forEach(function (job) {
                jobQueue.insert(job);
            });
        }
        /**
         * Internal method that will lock a job and store it on MongoDB
         * This method is called when we immediately start to process a job without using the process interval
         * We do this because sometimes jobs are scheduled but will be run before the next process time
         */
        function lockOnTheFly() {
            return __awaiter(this, void 0, void 0, function () {
                var now, job, criteria, update, options, resp, job_1;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            debug('lockOnTheFly: isLockingOnTheFly: %s', self._isLockingOnTheFly);
                            // Already running this? Return
                            if (self._isLockingOnTheFly) {
                                debug('lockOnTheFly() already running, returning');
                                return [2 /*return*/];
                            }
                            // Set that we are running this
                            self._isLockingOnTheFly = true;
                            // Don't have any jobs to run? Return
                            if (self._jobsToLock.length === 0) {
                                debug('no jobs to current lock on the fly, returning');
                                self._isLockingOnTheFly = false;
                                return [2 /*return*/];
                            }
                            now = new Date();
                            job = self._jobsToLock.pop();
                            if (job === undefined) {
                                debug('no job was popped from _jobsToLock, extremly unlikely but not impossible concurrency issue');
                                self._isLockingOnTheFly = false;
                                return [2 /*return*/];
                            }
                            if (self._isJobQueueFilling.has(job.attrs.name)) {
                                debug('lockOnTheFly: jobQueueFilling already running for: %s', job.attrs.name);
                                self._isLockingOnTheFly = false;
                                return [2 /*return*/];
                            }
                            // If locking limits have been hit, stop locking on the fly.
                            // Jobs that were waiting to be locked will be picked up during a
                            // future locking interval.
                            if (!shouldLock(job.attrs.name)) {
                                debug('lock limit hit for: [%s:%s]', job.attrs.name, job.attrs._id);
                                self._jobsToLock = [];
                                self._isLockingOnTheFly = false;
                                return [2 /*return*/];
                            }
                            criteria = {
                                _id: job.attrs._id,
                                lockedAt: null,
                                nextRunAt: job.attrs.nextRunAt,
                                disabled: { $ne: true }
                            };
                            update = { $set: { lockedAt: now } };
                            options = { returnOriginal: false };
                            return [4 /*yield*/, self._collection.findOneAndUpdate(criteria, update, options)];
                        case 1:
                            resp = _a.sent();
                            if (resp.value) {
                                job_1 = create_job_1.createJob(self, resp.value);
                                debug('found job [%s:%s] that can be locked on the fly', job_1.attrs.name, job_1.attrs._id);
                                self._lockedJobs.push(job_1);
                                definitions[job_1.attrs.name].locked++;
                                enqueueJobs(job_1);
                                jobProcessing();
                            }
                            // Mark lock on fly is done for now
                            self._isLockingOnTheFly = false;
                            // Re-run in case anything is in the queue
                            return [4 /*yield*/, lockOnTheFly()];
                        case 2:
                            // Re-run in case anything is in the queue
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            });
        }
        /**
         * Internal method used to fill a queue with jobs that can be run
         * @param {String} name fill a queue with specific job name
         * @returns {undefined}
         */
        function jobQueueFilling(name) {
            return __awaiter(this, void 0, void 0, function () {
                var now, job, error_1;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            debug('jobQueueFilling: %s isJobQueueFilling: %s', name, self._isJobQueueFilling.has(name));
                            self._isJobQueueFilling.set(name, true);
                            _a.label = 1;
                        case 1:
                            _a.trys.push([1, 7, 8, 9]);
                            // Don't lock because of a limit we have set (lockLimit, etc)
                            if (!shouldLock(name)) {
                                debug('lock limit reached in queue filling for [%s]', name);
                                return [2 /*return*/]; // Goes to finally block
                            }
                            now = new Date();
                            self._nextScanAt = new Date(now.valueOf() + self._processEvery);
                            return [4 /*yield*/, self._findAndLockNextJob(name, definitions[name])];
                        case 2:
                            job = _a.sent();
                            if (!job) return [3 /*break*/, 6];
                            if (!!shouldLock(name)) return [3 /*break*/, 4];
                            debug('lock limit reached before job was returned. Releasing lock on [%s]', name);
                            job.attrs.lockedAt = null;
                            return [4 /*yield*/, self.saveJob(job)];
                        case 3:
                            _a.sent();
                            return [2 /*return*/];
                        case 4:
                            debug('[%s:%s] job locked while filling queue', name, job.attrs._id);
                            self._lockedJobs.push(job);
                            definitions[job.attrs.name].locked++;
                            enqueueJobs(job);
                            return [4 /*yield*/, jobQueueFilling(name)];
                        case 5:
                            _a.sent();
                            jobProcessing();
                            _a.label = 6;
                        case 6: return [3 /*break*/, 9];
                        case 7:
                            error_1 = _a.sent();
                            debug('[%s] job lock failed while filling queue', name, error_1);
                            return [3 /*break*/, 9];
                        case 8:
                            self._isJobQueueFilling.delete(name);
                            return [7 /*endfinally*/];
                        case 9: return [2 /*return*/];
                    }
                });
            });
        }
        /**
         * Internal method that processes any jobs in the local queue (array)
         * @returns {undefined}
         */
        function jobProcessing() {
            // Ensure we have jobs
            if (jobQueue.length === 0) {
                return;
            }
            // Store for all sorts of things
            var now = new Date();
            // Get the next job that is not blocked by concurrency
            var job = jobQueue.returnNextConcurrencyFreeJob(definitions);
            debug('[%s:%s] about to process job', job.attrs.name, job.attrs._id);
            // If the 'nextRunAt' time is older than the current time, run the job
            // Otherwise, setTimeout that gets called at the time of 'nextRunAt'
            if (job.attrs.nextRunAt <= now) {
                debug('[%s:%s] nextRunAt is in the past, run the job immediately', job.attrs.name, job.attrs._id);
                runOrRetry();
            }
            else {
                // @ts-expect-error
                var runIn = job.attrs.nextRunAt - now;
                debug('[%s:%s] nextRunAt is in the future, calling setTimeout(%d)', job.attrs.name, job.attrs._id, runIn);
                setTimeout(jobProcessing, runIn);
            }
            /**
             * Internal method that tries to run a job and if it fails, retries again!
             * @returns {undefined}
             */
            function runOrRetry() {
                if (self._processInterval) {
                    // @todo: We should check if job exists
                    var job_2 = jobQueue.pop();
                    var jobDefinition = definitions[job_2.attrs.name];
                    if (jobDefinition.concurrency > jobDefinition.running && self._runningJobs.length < self._maxConcurrency) {
                        // Get the deadline of when the job is not supposed to go past for locking
                        var lockDeadline = new Date(Date.now() - jobDefinition.lockLifetime);
                        // This means a job has "expired", as in it has not been "touched" within the lockoutTime
                        // Remove from local lock
                        // NOTE: Shouldn't we update the 'lockedAt' value in MongoDB so it can be picked up on restart?
                        if (job_2.attrs.lockedAt < lockDeadline) {
                            debug('[%s:%s] job lock has expired, freeing it up', job_2.attrs.name, job_2.attrs._id);
                            self._lockedJobs.splice(self._lockedJobs.indexOf(job_2), 1);
                            jobDefinition.locked--;
                            jobProcessing();
                            return;
                        }
                        // Add to local "running" queue
                        self._runningJobs.push(job_2);
                        jobDefinition.running++;
                        // CALL THE ACTUAL METHOD TO PROCESS THE JOB!!!
                        debug('[%s:%s] processing job', job_2.attrs.name, job_2.attrs._id);
                        job_2.run() // eslint-disable-line @typescript-eslint/no-floating-promises
                            .catch(function (error) { return [error, job_2]; })
                            // @ts-expect-error
                            .then(function (job) { return processJobResult.apply(void 0, Array.isArray(job) ? job : [null, job]); }); // eslint-disable-line promise/prefer-await-to-then
                    }
                    else {
                        // Run the job immediately by putting it on the top of the queue
                        debug('[%s:%s] concurrency preventing immediate run, pushing job to top of queue', job_2.attrs.name, job_2.attrs._id);
                        enqueueJobs(job_2);
                    }
                }
            }
        }
        /**
         * Internal method used to run the job definition
         * @param {Error} err thrown if can't process job
         * @param {Job} job job to process
         */
        function processJobResult(error, job) {
            if (error) {
                return job.agenda.emit('error', error);
            }
            var name = job.attrs.name;
            // Job isn't in running jobs so throw an error
            if (!self._runningJobs.includes(job)) {
                debug('[%s] callback was called, job must have been marked as complete already', job.attrs._id);
                throw new Error("callback already called - job " + name + " already marked complete");
            }
            // Remove the job from the running queue
            self._runningJobs.splice(self._runningJobs.indexOf(job), 1);
            if (definitions[name].running > 0) {
                definitions[name].running--;
            }
            // Remove the job from the locked queue
            self._lockedJobs.splice(self._lockedJobs.indexOf(job), 1);
            if (definitions[name].locked > 0) {
                definitions[name].locked--;
            }
            // Re-process jobs now that one has finished
            jobProcessing();
        }
        var self, definitions, jobQueue, jobName, parallelJobQueueing;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0:
                    debug('starting to process jobs: [%s:%s]', (_b = (_a = extraJob === null || extraJob === void 0 ? void 0 : extraJob.attrs) === null || _a === void 0 ? void 0 : _a.name) !== null && _b !== void 0 ? _b : 'unknownName', (_d = (_c = extraJob === null || extraJob === void 0 ? void 0 : extraJob.attrs) === null || _c === void 0 ? void 0 : _c._id) !== null && _d !== void 0 ? _d : 'unknownId');
                    // Make sure an interval has actually been set
                    // Prevents race condition with 'Agenda.stop' and already scheduled run
                    if (!this._processInterval) {
                        debug('no _processInterval set when calling processJobs, returning');
                        return [2 /*return*/];
                    }
                    self = this;
                    definitions = this._definitions;
                    jobQueue = this._jobQueue;
                    if (!!extraJob) return [3 /*break*/, 2];
                    parallelJobQueueing = [];
                    for (jobName in definitions) {
                        if ({}.hasOwnProperty.call(definitions, jobName)) {
                            debug('queuing up job to process: [%s]', jobName);
                            parallelJobQueueing.push(jobQueueFilling(jobName));
                        }
                    }
                    return [4 /*yield*/, Promise.all(parallelJobQueueing)];
                case 1:
                    _e.sent();
                    return [3 /*break*/, 4];
                case 2:
                    if (!definitions[extraJob.attrs.name]) return [3 /*break*/, 4];
                    // Add the job to list of jobs to lock and then lock it immediately!
                    debug('job [%s:%s] was passed directly to processJobs(), locking and running immediately', extraJob.attrs.name, extraJob.attrs._id);
                    self._jobsToLock.push(extraJob);
                    return [4 /*yield*/, lockOnTheFly()];
                case 3:
                    _e.sent();
                    _e.label = 4;
                case 4: return [2 /*return*/];
            }
        });
    });
};
exports.processJobs = processJobs;
