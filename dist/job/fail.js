"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fail = void 0;
var debug_1 = __importDefault(require("debug"));
var debug = debug_1.default('agenda:job');
/**
 * Fails the job with a reason (error) specified
 * @name Job#fail
 * @function
 * @param reason reason job failed
 */
var fail = function (reason) {
    if (reason instanceof Error) {
        reason = reason.message;
    }
    this.attrs.failReason = reason;
    this.attrs.failCount = (this.attrs.failCount || 0) + 1;
    var now = new Date();
    this.attrs.failedAt = now;
    this.attrs.lastFinishedAt = now;
    debug('[%s:%s] fail() called [%d] times so far', this.attrs.name, this.attrs._id, this.attrs.failCount);
    return this;
};
exports.fail = fail;
