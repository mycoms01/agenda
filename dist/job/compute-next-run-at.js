"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.computeNextRunAt = void 0;
var parser = __importStar(require("cron-parser"));
var human_interval_1 = __importDefault(require("human-interval"));
var debug_1 = __importDefault(require("debug"));
var moment_timezone_1 = __importDefault(require("moment-timezone"));
// @ts-expect-error
var date_js_1 = __importDefault(require("date.js"));
var debug = debug_1.default('agenda:job');
/**
 * Internal method used to compute next time a job should run and sets the proper values
 * @name Job#computeNextRunAt
 * @function
 */
var computeNextRunAt = function () {
    var _this = this;
    var interval = this.attrs.repeatInterval;
    var timezone = this.attrs.repeatTimezone;
    var repeatAt = this.attrs.repeatAt;
    var previousNextRunAt = this.attrs.nextRunAt || new Date();
    this.attrs.nextRunAt = undefined;
    var dateForTimezone = function (date) {
        date = moment_timezone_1.default(date);
        if (timezone !== null) {
            date.tz(timezone);
        }
        return date;
    };
    /**
     * Internal method that computes the interval
     */
    var computeFromInterval = function () {
        var _a, _b;
        debug('[%s:%s] computing next run via interval [%s]', _this.attrs.name, _this.attrs._id, interval);
        var dateNow = new Date();
        var lastRun = _this.attrs.lastRunAt || dateNow;
        var _c = _this.attrs, startDate = _c.startDate, endDate = _c.endDate, skipDays = _c.skipDays;
        lastRun = dateForTimezone(lastRun).toDate();
        var cronOptions = { currentDate: lastRun };
        if (timezone) {
            cronOptions.tz = timezone;
        }
        try {
            var cronTime = parser.parseExpression(interval, cronOptions);
            var nextDate = cronTime.next().toDate();
            if (nextDate.getTime() === lastRun.getTime() || nextDate.getTime() <= previousNextRunAt.getTime()) {
                // Handle cronTime giving back the same date for the next run time
                cronOptions.currentDate = new Date(lastRun.getTime() + 1000);
                cronTime = parser.parseExpression(interval, cronOptions);
                nextDate = cronTime.next().toDate();
            }
            // If start date is present, check if the nextDate should be larger or equal to startDate. If not set startDate as nextDate
            if (startDate !== null) {
                startDate = moment_timezone_1.default.tz(moment_timezone_1.default(startDate).format('YYYY-MM-DD'), timezone).toDate();
                if (startDate > nextDate) {
                    cronOptions.currentDate = startDate;
                    cronTime = parser.parseExpression(interval, cronOptions);
                    nextDate = cronTime.next().toDate();
                }
            }
            // If job has run in the past and skipDays is not null, add skipDays to nextDate
            if ((dateNow > lastRun) && skipDays !== null) {
                try {
                    nextDate = new Date(nextDate.getTime() + ((_a = human_interval_1.default(skipDays)) !== null && _a !== void 0 ? _a : 0));
                }
                catch (_d) { }
            }
            // If endDate is less than the nextDate, set nextDate to null to stop the job from running further
            if (endDate !== null) {
                var endDateDate = moment_timezone_1.default.tz(moment_timezone_1.default(endDate).format('YYYY-MM-DD'), timezone).toDate();
                if (nextDate > endDateDate) {
                    nextDate = null;
                }
            }
            _this.attrs.nextRunAt = nextDate;
            debug('[%s:%s] nextRunAt set to [%s]', _this.attrs.name, _this.attrs._id, _this.attrs.nextRunAt.toISOString());
            // Either `xo` linter or Node.js 8 stumble on this line if it isn't just ignored
        }
        catch (_e) {
            debug('[%s:%s] failed nextRunAt based on interval [%s]', _this.attrs.name, _this.attrs._id, interval);
            // Nope, humanInterval then!
            try {
                if (!_this.attrs.lastRunAt && human_interval_1.default(interval)) {
                    _this.attrs.nextRunAt = lastRun;
                    debug('[%s:%s] nextRunAt set to [%s]', _this.attrs.name, _this.attrs._id, _this.attrs.nextRunAt.toISOString());
                }
                else {
                    _this.attrs.nextRunAt = new Date(lastRun.getTime() + ((_b = human_interval_1.default(interval)) !== null && _b !== void 0 ? _b : 0));
                    debug('[%s:%s] nextRunAt set to [%s]', _this.attrs.name, _this.attrs._id, _this.attrs.nextRunAt.toISOString());
                }
                // Either `xo` linter or Node.js 8 stumble on this line if it isn't just ignored
            }
            catch (_f) { }
        }
        finally {
            if (Number.isNaN(_this.attrs.nextRunAt.getTime())) {
                _this.attrs.nextRunAt = undefined;
                debug('[%s:%s] failed to calculate nextRunAt due to invalid repeat interval', _this.attrs.name, _this.attrs._id);
                _this.fail('failed to calculate nextRunAt due to invalid repeat interval');
            }
        }
    };
    /**
     * Internal method to compute next run time from the repeat string
     */
    var computeFromRepeatAt = function () {
        var lastRun = _this.attrs.lastRunAt || new Date();
        var nextDate = date_js_1.default(repeatAt);
        // If you do not specify offset date for below test it will fail for ms
        var offset = Date.now();
        if (offset === date_js_1.default(repeatAt, offset).getTime()) {
            _this.attrs.nextRunAt = undefined;
            debug('[%s:%s] failed to calculate repeatAt due to invalid format', _this.attrs.name, _this.attrs._id);
            _this.fail('failed to calculate repeatAt time due to invalid format');
        }
        else if (nextDate.getTime() === lastRun.getTime()) {
            _this.attrs.nextRunAt = date_js_1.default('tomorrow at ', repeatAt);
            debug('[%s:%s] nextRunAt set to [%s]', _this.attrs.name, _this.attrs._id, _this.attrs.nextRunAt.toISOString());
        }
        else {
            _this.attrs.nextRunAt = date_js_1.default(repeatAt);
            debug('[%s:%s] nextRunAt set to [%s]', _this.attrs.name, _this.attrs._id, _this.attrs.nextRunAt.toISOString());
        }
    };
    if (interval) {
        computeFromInterval();
    }
    else if (repeatAt) {
        computeFromRepeatAt();
    }
    return this;
};
exports.computeNextRunAt = computeNextRunAt;
