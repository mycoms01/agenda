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
exports.every = void 0;
var debug_1 = __importDefault(require("debug"));
var debug = debug_1.default('agenda:every');
/**
 * Creates a scheduled job with given interval and name/names of the job to run
 * @name Agenda#every
 * @function
 * @param interval - run every X interval
 * @param names - String or strings of jobs to schedule
 * @param data - data to run for job
 * @param options - options to run job for
 * @returns Job/s created. Resolves when schedule fails or passes
 */
var every = function (interval, names, data, options) {
    return __awaiter(this, void 0, void 0, function () {
        var createJob, createJobs, jobs, jobs;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    createJob = function (interval, name, data, options) { return __awaiter(_this, void 0, void 0, function () {
                        var job;
                        return __generator(this, function (_a) {
                            job = this.create(name, data);
                            job.attrs.type = 'single';
                            job.repeatEvery(interval, options);
                            return [2 /*return*/, job.save()];
                        });
                    }); };
                    createJobs = function (interval, names, data, options) { return __awaiter(_this, void 0, void 0, function () {
                        var jobs_1;
                        return __generator(this, function (_a) {
                            try {
                                jobs_1 = [];
                                names.map(function (name) { return jobs_1.push(createJob(interval, name, data, options)); });
                                debug('every() -> all jobs created successfully');
                                return [2 /*return*/, Promise.all(jobs_1)];
                            }
                            catch (error) { // @TODO: catch - ignore :O
                                debug('every() -> error creating one or more of the jobs', error);
                            }
                            return [2 /*return*/];
                        });
                    }); };
                    if (!(typeof names === 'string')) return [3 /*break*/, 2];
                    debug('Agenda.every(%s, %O, %O)', interval, names, options);
                    return [4 /*yield*/, createJob(interval, names, data, options)];
                case 1:
                    jobs = _a.sent();
                    return [2 /*return*/, jobs];
                case 2:
                    if (!Array.isArray(names)) return [3 /*break*/, 4];
                    debug('Agenda.every(%s, %s, %O)', interval, names, options);
                    return [4 /*yield*/, createJobs(interval, names, data, options)];
                case 3:
                    jobs = _a.sent();
                    return [2 /*return*/, jobs];
                case 4: return [2 /*return*/];
            }
        });
    });
};
exports.every = every;
