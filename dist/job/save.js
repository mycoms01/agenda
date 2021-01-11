"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.save = void 0;
/**
 * Saves a job into the MongoDB
 * @name Job#
 * @function
 * @returns instance of Job resolved after job is saved or errors
 */
var save = function () {
    return this.agenda.saveJob(this);
};
exports.save = save;
