"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.disable = void 0;
/**
 * Prevents the job type from running
 * @name Job#disable
 * @function
 */
var disable = function () {
    this.attrs.disabled = true;
    return this;
};
exports.disable = disable;
