/**
 * lib/RowAsObjectTransform.js
 */
"use strict";

const { Transform } = require('stream');

/**
 * Transforms row data to JSON objects.
 */
module.exports = exports = class RowAsObjectTransform extends Transform {

  /**
   * If headers are not set in options then the first row seen is assumed to be the headers.
   *
   * @param {Object}    [options]
   * @param {String[]}  [options.headers] - array of column names for data, default none, first table row contains names.
   */
  constructor(options = {}) {
    let streamOptions = {
      objectMode: true,
    };
    super(streamOptions);

    this.headers = options[ "RowAsObject.headers" ] || options.headers || undefined;
  }

  /**
   * Internal call from streamWriter to process an object
   * @param {Object} row
   * @param {String} encoding
   * @param {Function} callback
   */
  _transform(row, encoding, callback) {
    if (!this.headers) {
      this.headers = row;
    }
    else {
      let obj = {};
      for (let i = 0; i < row.length; i++) {
        let prop = (i < this.headers.length) ? this.headers[ i ] : i;
        obj[ prop ] = row[ i ];
      }
      this.push(obj);
    }
    callback();
  }

/*
  _flush(callback) {
    callback();
  }
*/
};
