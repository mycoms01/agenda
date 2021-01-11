"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.define = void 0;
var debug_1 = __importDefault(require("debug"));
var debug = debug_1.default('agenda:define');
/**
 * Setup definition for job
 * Method is used by consumers of lib to setup their functions
 * @name Agenda#define
 * @function
 * @param name name of job
 * @param options options for job to run
 * @param processor function to be called to run actual job
 */
var define = function (name, options, processor) {
    if (!processor) {
        processor = options;
        options = {};
    }
    this._definitions[name] = {
        fn: processor,
        concurrency: options.concurrency || this._defaultConcurrency,
        lockLimit: options.lockLimit || this._defaultLockLimit,
        priority: options.priority || 0,
        lockLifetime: options.lockLifetime || this._defaultLockLifetime,
        running: 0,
        locked: 0
    };
    debug('job [%s] defined with following options: \n%O', name, this._definitions[name]);
};
exports.define = define;
