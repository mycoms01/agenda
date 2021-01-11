"use strict";
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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Job = void 0;
var to_json_1 = require("./to-json");
var compute_next_run_at_1 = require("./compute-next-run-at");
var repeat_every_1 = require("./repeat-every");
var repeat_at_1 = require("./repeat-at");
var disable_1 = require("./disable");
var enable_1 = require("./enable");
var unique_1 = require("./unique");
var schedule_1 = require("./schedule");
var priority_1 = require("./priority");
var fail_1 = require("./fail");
var run_1 = require("./run");
var is_running_1 = require("./is-running");
var save_1 = require("./save");
var remove_1 = require("./remove");
var touch_1 = require("./touch");
var utils_1 = require("../utils");
/**
 * @class
 * @param {Object} args - Job Options
 * @property {Object} agenda - The Agenda instance
 * @property {Object} attrs
 */
var Job = /** @class */ (function () {
    function Job(options) {
        var _a = (options !== null && options !== void 0 ? options : {}), agenda = _a.agenda, type = _a.type, nextRunAt = _a.nextRunAt, args = __rest(_a, ["agenda", "type", "nextRunAt"]);
        // Save Agenda instance
        this.agenda = agenda;
        // Set priority
        args.priority = utils_1.parsePriority(args.priority) || 0;
        // Set attrs to args
        var attrs = {};
        for (var key in args) {
            if ({}.hasOwnProperty.call(args, key)) {
                // @ts-expect-error
                attrs[key] = args[key];
            }
        }
        // Set defaults if undefined
        this.attrs = __assign(__assign({}, attrs), { 
            // NOTE: What is the difference between 'once' here and 'single' in agenda/index.js?
            type: type || 'once', nextRunAt: nextRunAt || new Date() });
    }
    return Job;
}());
exports.Job = Job;
Job.prototype.toJSON = to_json_1.toJson;
Job.prototype.computeNextRunAt = compute_next_run_at_1.computeNextRunAt;
Job.prototype.repeatEvery = repeat_every_1.repeatEvery;
Job.prototype.repeatAt = repeat_at_1.repeatAt;
Job.prototype.disable = disable_1.disable;
Job.prototype.enable = enable_1.enable;
Job.prototype.unique = unique_1.unique;
Job.prototype.schedule = schedule_1.schedule;
Job.prototype.priority = priority_1.priority;
Job.prototype.fail = fail_1.fail;
Job.prototype.run = run_1.run;
Job.prototype.isRunning = is_running_1.isRunning;
Job.prototype.save = save_1.save;
Job.prototype.remove = remove_1.remove;
Job.prototype.touch = touch_1.touch;
