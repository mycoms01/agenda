"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parsePriority = void 0;
var priorityMap = {
    lowest: -20,
    low: -10,
    normal: 0,
    high: 10,
    highest: 20
};
/**
 * Internal method to turn priority into a number
 * @param priority string to parse into number
 */
var parsePriority = function (priority) {
    if (typeof priority === 'number') {
        return priority;
    }
    return priorityMap[priority];
};
exports.parsePriority = parsePriority;
