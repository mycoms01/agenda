"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.remove = void 0;
/**
 * Remove the job from MongoDB
 * @name Job#remove
 * @function
 */
var remove = function () {
    return this.agenda.cancel({ _id: this.attrs._id });
};
exports.remove = remove;
