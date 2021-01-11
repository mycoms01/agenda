"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.repeatAt = void 0;
/**
 * Sets a job to repeat at a specific time
 * @name Job#repeatAt
 * @function
 * @param time time to repeat job at (human readable or number)
 */
var repeatAt = function (time) {
    this.attrs.repeatAt = time;
    return this;
};
exports.repeatAt = repeatAt;
