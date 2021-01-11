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
exports.run = void 0;
var debug_1 = __importDefault(require("debug"));
var debug = debug_1.default('agenda:job');
/**
 * Internal method (RUN)
 * @name Job#run
 * @function
 */
var run = function () {
    return __awaiter(this, void 0, void 0, function () {
        var agenda, definition;
        var _this = this;
        return __generator(this, function (_a) {
            agenda = this.agenda;
            definition = agenda._definitions[this.attrs.name];
            // @TODO: this lint issue should be looked into: https://eslint.org/docs/rules/no-async-promise-executor
            // eslint-disable-next-line no-async-promise-executor
            return [2 /*return*/, new Promise(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
                    var finished, jobCallback, error_1;
                    var _this = this;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                this.attrs.lastRunAt = new Date();
                                debug('[%s:%s] setting lastRunAt to: %s', this.attrs.name, this.attrs._id, this.attrs.lastRunAt.toISOString());
                                this.computeNextRunAt();
                                return [4 /*yield*/, this.save()];
                            case 1:
                                _a.sent();
                                finished = false;
                                jobCallback = function (error) { return __awaiter(_this, void 0, void 0, function () {
                                    var _this = this;
                                    return __generator(this, function (_a) {
                                        switch (_a.label) {
                                            case 0:
                                                // We don't want to complete the job multiple times
                                                if (finished) {
                                                    return [2 /*return*/];
                                                }
                                                finished = true;
                                                if (error) {
                                                    this.fail(error);
                                                }
                                                else {
                                                    this.attrs.lastFinishedAt = new Date();
                                                }
                                                this.attrs.lockedAt = null;
                                                return [4 /*yield*/, this.save().catch(function (error) {
                                                        debug('[%s:%s] failed to be saved to MongoDB', _this.attrs.name, _this.attrs._id);
                                                        reject(error);
                                                    })];
                                            case 1:
                                                _a.sent();
                                                debug('[%s:%s] was saved successfully to MongoDB', this.attrs.name, this.attrs._id);
                                                if (error) {
                                                    agenda.emit('fail', error, this);
                                                    agenda.emit('fail:' + this.attrs.name, error, this);
                                                    debug('[%s:%s] has failed [%s]', this.attrs.name, this.attrs._id, error.message);
                                                }
                                                else {
                                                    agenda.emit('success', this);
                                                    agenda.emit('success:' + this.attrs.name, this);
                                                    debug('[%s:%s] has succeeded', this.attrs.name, this.attrs._id);
                                                }
                                                agenda.emit('complete', this);
                                                agenda.emit('complete:' + this.attrs.name, this);
                                                debug('[%s:%s] job finished at [%s] and was unlocked', this.attrs.name, this.attrs._id, this.attrs.lastFinishedAt);
                                                // Curiously, we still resolve successfully if the job processor failed.
                                                // Agenda is not equipped to handle errors originating in user code, so, we leave them to inspect the side-effects of job.fail()
                                                resolve(this);
                                                return [2 /*return*/];
                                        }
                                    });
                                }); };
                                _a.label = 2;
                            case 2:
                                _a.trys.push([2, 8, , 10]);
                                agenda.emit('start', this);
                                agenda.emit('start:' + this.attrs.name, this);
                                debug('[%s:%s] starting job', this.attrs.name, this.attrs._id);
                                if (!definition) {
                                    debug('[%s:%s] has no definition, can not run', this.attrs.name, this.attrs._id);
                                    throw new Error('Undefined job');
                                }
                                if (!(definition.fn.length === 2)) return [3 /*break*/, 4];
                                debug('[%s:%s] process function being called', this.attrs.name, this.attrs._id);
                                return [4 /*yield*/, definition.fn(this, jobCallback)];
                            case 3:
                                _a.sent();
                                return [3 /*break*/, 7];
                            case 4:
                                debug('[%s:%s] process function being called', this.attrs.name, this.attrs._id);
                                return [4 /*yield*/, definition.fn(this)];
                            case 5:
                                _a.sent();
                                return [4 /*yield*/, jobCallback()];
                            case 6:
                                _a.sent();
                                _a.label = 7;
                            case 7: return [3 /*break*/, 10];
                            case 8:
                                error_1 = _a.sent();
                                debug('[%s:%s] unknown error occurred', this.attrs.name, this.attrs._id);
                                return [4 /*yield*/, jobCallback(error_1)];
                            case 9:
                                _a.sent();
                                return [3 /*break*/, 10];
                            case 10: return [2 /*return*/];
                        }
                    });
                }); })];
        });
    });
};
exports.run = run;
