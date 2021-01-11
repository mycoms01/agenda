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
exports.saveJob = void 0;
var debug_1 = __importDefault(require("debug"));
var utils_1 = require("../utils");
var debug = debug_1.default('agenda:saveJob');
/**
 * Given a result for findOneAndUpdate() or insert() above, determine whether to process
 * the job immediately or to let the processJobs() interval pick it up later
 * @param job job instance
 * @param result the data returned from the findOneAndUpdate() call or insertOne() call
 * @access private
 */
var processDbResult = function (job, result) {
    return __awaiter(this, void 0, void 0, function () {
        var resultValue;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    debug('processDbResult() called with success, checking whether to process job immediately or not');
                    resultValue = result.ops ? result.ops : result.value;
                    if (!resultValue) return [3 /*break*/, 2];
                    // If it is an array, grab the first job
                    if (Array.isArray(resultValue)) {
                        resultValue = resultValue[0];
                    }
                    // Grab ID and nextRunAt from MongoDB and store it as an attribute on Job
                    job.attrs._id = resultValue._id;
                    job.attrs.nextRunAt = resultValue.nextRunAt;
                    if (!(job.attrs.nextRunAt && job.attrs.nextRunAt < this._nextScanAt)) return [3 /*break*/, 2];
                    debug('[%s:%s] job would have ran by nextScanAt, processing the job immediately', job.attrs.name, resultValue._id);
                    return [4 /*yield*/, utils_1.processJobs.call(this, job)];
                case 1:
                    _a.sent();
                    _a.label = 2;
                case 2: 
                // Return the Job instance
                return [2 /*return*/, job];
            }
        });
    });
};
/**
 * Save the properties on a job to MongoDB
 * @name Agenda#saveJob
 * @function
 * @param job job to save into MongoDB
 * @returns resolves when job is saved or errors
 */
var saveJob = function (job) {
    return __awaiter(this, void 0, void 0, function () {
        var id, _a, unique, uniqueOpts, props, now, protect, update, result_1, result_2, query, result_3, result, error_1;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 12, , 13]);
                    debug('attempting to save a job into Agenda instance');
                    id = job.attrs._id;
                    _a = job.attrs, unique = _a.unique, uniqueOpts = _a.uniqueOpts;
                    props = job.toJSON();
                    delete props._id;
                    delete props.unique;
                    delete props.uniqueOpts;
                    // Store name of agenda queue as last modifier in job data
                    props.lastModifiedBy = this._name;
                    debug('[job %s] set job props: \n%O', id, props);
                    now = new Date();
                    protect = {};
                    update = { $set: props };
                    debug('current time stored as %s', now.toISOString());
                    if (!id) return [3 /*break*/, 3];
                    // Update the job and process the resulting data'
                    debug('job already has _id, calling findOneAndUpdate() using _id as query');
                    return [4 /*yield*/, this._collection.findOneAndUpdate({ _id: id }, update, { returnOriginal: false })];
                case 1:
                    result_1 = _b.sent();
                    return [4 /*yield*/, processDbResult.call(this, job, result_1)];
                case 2: return [2 /*return*/, _b.sent()];
                case 3:
                    if (!(props.type === 'single')) return [3 /*break*/, 6];
                    // Job type set to 'single' so...
                    // NOTE: Again, not sure about difference between 'single' here and 'once' in job.js
                    debug('job with type of "single" found');
                    // If the nextRunAt time is older than the current time, "protect" that property, meaning, don't change
                    // a scheduled job's next run time!
                    if (props.nextRunAt && props.nextRunAt <= now) {
                        debug('job has a scheduled nextRunAt time, protecting that field from upsert');
                        // @ts-expect-error
                        protect.nextRunAt = props.nextRunAt;
                        delete props.nextRunAt;
                    }
                    // If we have things to protect, set them in MongoDB using $setOnInsert
                    if (Object.keys(protect).length > 0) {
                        // @ts-expect-error
                        update.$setOnInsert = protect;
                    }
                    // Try an upsert
                    // NOTE: 'single' again, not exactly sure what it means
                    debug('calling findOneAndUpdate() with job name and type of "single" as query');
                    return [4 /*yield*/, this._collection.findOneAndUpdate({
                            name: props.name,
                            type: 'single'
                        }, update, {
                            upsert: true,
                            returnOriginal: false
                        })];
                case 4:
                    result_2 = _b.sent();
                    return [4 /*yield*/, processDbResult.call(this, job, result_2)];
                case 5: return [2 /*return*/, _b.sent()];
                case 6:
                    if (!unique) return [3 /*break*/, 9];
                    query = job.attrs.unique;
                    query.name = props.name;
                    if (uniqueOpts === null || uniqueOpts === void 0 ? void 0 : uniqueOpts.insertOnly) {
                        // @ts-expect-error
                        update = { $setOnInsert: props };
                    }
                    // Use the 'unique' query object to find an existing job or create a new one
                    debug('calling findOneAndUpdate() with unique object as query: \n%O', query);
                    return [4 /*yield*/, this._collection.findOneAndUpdate(query, update, { upsert: true, returnOriginal: false })];
                case 7:
                    result_3 = _b.sent();
                    return [4 /*yield*/, processDbResult.call(this, job, result_3)];
                case 8: return [2 /*return*/, _b.sent()];
                case 9:
                    // If all else fails, the job does not exist yet so we just insert it into MongoDB
                    debug('using default behavior, inserting new job via insertOne() with props that were set: \n%O', props);
                    return [4 /*yield*/, this._collection.insertOne(props)];
                case 10:
                    result = _b.sent();
                    return [4 /*yield*/, processDbResult.call(this, job, result)];
                case 11: return [2 /*return*/, _b.sent()];
                case 12:
                    error_1 = _b.sent();
                    debug('processDbResult() received an error, job was not updated/created');
                    throw error_1;
                case 13: return [2 /*return*/];
            }
        });
    });
};
exports.saveJob = saveJob;
