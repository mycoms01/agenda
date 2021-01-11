"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.create = void 0;
var debug_1 = __importDefault(require("debug"));
var job_1 = require("../job");
var debug = debug_1.default('agenda:create');
/**
 * Given a name and some data, create a new job
 * @name Agenda#create
 * @function
 * @param name name of job
 * @param data data to set for job
 */
var create = function (name, data) {
    debug('Agenda.create(%s, [Object])', name);
    var priority = this._definitions[name] ? this._definitions[name].priority : 0;
    var job = new job_1.Job({ name: name, data: data, type: 'normal', priority: priority, agenda: this });
    return job;
};
exports.create = create;
