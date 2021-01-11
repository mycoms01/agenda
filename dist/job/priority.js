"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.priority = void 0;
var utils_1 = require("../utils");
/**
 * Sets priority of the job
 * @param priority priority of when job should be queued
 */
var priority = function (priority) {
    this.attrs.priority = utils_1.parsePriority(priority);
    return this;
};
exports.priority = priority;
