"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.unique = void 0;
/**
 * Data to ensure is unique for job to be created
 * @name Job#unique
 * @function
 * @param unique mongo data query for unique
 * @param opts unique options
 */
var unique = function (unique, options) {
    this.attrs.unique = unique;
    this.attrs.uniqueOpts = options;
    return this;
};
exports.unique = unique;
