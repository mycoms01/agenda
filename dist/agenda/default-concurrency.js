"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.defaultConcurrency = void 0;
var debug_1 = __importDefault(require("debug"));
var debug = debug_1.default('agenda:defaultConcurrency');
/**
 * Set the default concurrency for each job
 * @name Agenda#defaultConcurrency
 * @function
 * @param concurrency default concurrency
 */
var defaultConcurrency = function (concurrency) {
    debug('Agenda.defaultConcurrency(%d)', concurrency);
    this._defaultConcurrency = concurrency;
    return this;
};
exports.defaultConcurrency = defaultConcurrency;
