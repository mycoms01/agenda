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
exports.schedule = void 0;
var debug_1 = __importDefault(require("debug"));
var debug = debug_1.default('agenda:schedule');
/**
 * Schedule a job or jobs at a specific time
 * @name Agenda#schedule
 * @function
 * @param when when the job gets run
 * @param names array of job names to run
 * @param data data to send to job
 * @returns job or jobs created
 */
var schedule = function (when, names, data) {
    var _this = this;
    /**
     * Internal method that creates a job with given date
     * @param when when the job gets run
     * @param name of job to run
     * @param data data to send to job
     * @returns instance of new job
     */
    var createJob = function (when, name, data) { return __awaiter(_this, void 0, void 0, function () {
        var job;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    job = this.create(name, data);
                    return [4 /*yield*/, job.schedule(when).save()];
                case 1:
                    _a.sent();
                    return [2 /*return*/, job];
            }
        });
    }); };
    /**
     * Internal helper method that calls createJob on a names array
     * @param when when the job gets run
     * @param of jobs to run
     * @param data data to send to job
     * @returns jobs that were created
     */
    var createJobs = function (when, names, data) { return __awaiter(_this, void 0, void 0, function () {
        var createJobList_1;
        return __generator(this, function (_a) {
            try {
                createJobList_1 = [];
                names.map(function (name) { return createJobList_1.push(createJob(when, name, data)); });
                debug('Agenda.schedule()::createJobs() -> all jobs created successfully');
                return [2 /*return*/, Promise.all(createJobList_1)];
            }
            catch (error) {
                debug('Agenda.schedule()::createJobs() -> error creating one or more of the jobs');
                throw error;
            }
            return [2 /*return*/];
        });
    }); };
    if (typeof names === 'string') {
        debug('Agenda.schedule(%s, %O, [%O], cb)', when, names);
        return createJob(when, names, data);
    }
    if (Array.isArray(names)) {
        debug('Agenda.schedule(%s, %O, [%O])', when, names);
        return createJobs(when, names, data);
    }
};
exports.schedule = schedule;
