/**
 * lib/HtmlDataParser
 *
 * Gets table cells and group them into rows.
 *
 * Output is an array of arrays.
 */
"use strict";

const sax = require('sax');
const fs = require('node:fs');
const path = require('node:path');
const httpRequest = require('./httpRequest');
const { Readable, Writable } = require('node:stream');
const { pipeline, finished } = require('node:stream/promises');
const EventEmitter = require('node:events');
require('colors');


module.exports = class HtmlDataParser extends EventEmitter {

  /**
   *
   * @param {object}   options
   * @param {string}   options.url - the URL or local file name of the .html
   * @param {Buffer|string} options.data - HTML file data as an array, instead of using url
   * @param {string}   [options.heading] - HTML section heading where data is located, default: none (first table)
   * @param {string}   [options.id] - TABLE element's id attribute to find in document.
   * @param {number}   [options.cells] - minimum number of cells in a tabular data, default: 1
   * @param {boolean}  [options.newlines] - preserve new lines in cell data, default: false
   * @param {boolean}  [options.trim] = trim whitespace, default: true
   */
  constructor(options = {}) {
    super({ captureRejections: true });

    this.options = Object.assign({ cells: 1, trim: true }, options);

    // SAX parser
    this.saxOptions = {
      "trim": this.options.trim
    };

    this.rows = [];
    this.rowNum = 0;
  }

  /**
   * Load and parse the HTML document.
   * @returns Rows an array containing arrays of data values.
   * If using an event listener the return value will be an empty array.
   */
  async parse() {

    // parsing properties
    let findHeading = Object.hasOwn(this.options, "heading");
    let foundHeading = false; // Object.hasOwn(this.options, "heading") ? false : true;
    let findTableId = Object.hasOwn(this.options, "id");
    let foundTable = false;   // foundHeading;

    //// table processing
    const tagOpen = {}; // track state of tag open elements

    let headingText = "";
    let cellText = "";
    let row = [];

    this.rows = [];
    this.rowNum = 0;
    let self = this;

    try {
      // pipe is supported, and it's readable/writable
      // same chunks coming in also go out.
      var rs;
      if (this.options.data)
        rs = Readable.from(this.options.data);
      else if (this.options.url.toLowerCase().startsWith("http"))
        rs = await httpRequest.createReadStream(this.options.url, this.options.http);
      else
        rs = fs.createReadStream(this.options.url);

      const strict = false; // set to false for HTML mode
      const saxStream = sax.createStream(strict, this.saxOptions);

      saxStream.on("opentag", function (node) {
        // node object with name, attributes, isSelfClosing
        //console.log("opentag: " + JSON.stringify(node) + "\r\n");
        tagOpen[ node.name ] = tagOpen[ node.name ] ? ++tagOpen[ node.name ] : 1;
        switch (node.name) {
          case "TABLE":
            if (findTableId)
              foundTable = node.attributes[ "ID" ] === self.options.id;
            else if (findHeading)
              foundTable = foundHeading;
            else
              foundTable = true;
            break;
          case "TR":
            row = [];
            break;
          case "TH":
          case "TD":
            cellText = "";
            break;
        }
      });

      saxStream.on("closetag", function (tag) {
        // tag name
        //console.log("closetag: " + tag + "\r\n");
        --tagOpen[ tag ];
        switch (tag) {
          case "TABLE":
            foundTable = false;
            foundHeading = false;
            break;
          case "TR":
            if (foundTable && row.length > 0)
              self.output(row);
            break;
          case "TH":
          case "TD":
            if (foundTable) {
              if (!self.options.newlines)
                cellText = cellText.replace(/[\r|\n]\s+/g, " ");
              row.push(cellText);
            }
            break;
        }
      });

      saxStream.on("text", function (s) {
        // inner text string
        //console.log("text: " + s + "\r\n");
        if (tagOpen.H1 || tagOpen.H2 || tagOpen.H3 || tagOpen.H4 || tagOpen.H5 || tagOpen.H6) {
          headingText = s;
          if (findHeading && self.options.heading === headingText)
            foundHeading = true;
        }

        else if (tagOpen.TH || tagOpen.TD)
          if (foundTable)
            cellText += cellText ? " " + s : s;
      });


      saxStream.on("doctype", function (s) {
        // doctype string
        //console.log("doctype: " + JSON.stringify(s) + "\r\n");
      });

      saxStream.on("opentagstart", function (node) {
        // node object with name, attributes (empty)
        //console.log("opentagstart: " + JSON.stringify(node) + "\r\n");
      });

      saxStream.on("attribute", function (attr) {
        // attribute object with name, value
        //console.log("attribute: " + JSON.stringify(attr) + "\r\n");
      });

      saxStream.on("processinginstruction", function (o) {
        // object with "name", "body"
        //console.log("processinginstruction: " + JSON.stringify(o) + "\r\n");
      });

      saxStream.on("comment", function (s) {
        // comment string
        //console.log("comment: " + JSON.stringify(s) + "\r\n");
      });

      saxStream.on("script", function (s) {
        // script contents as string
        //console.log("script: " + JSON.stringify(s) + "\r\n");
      });

      saxStream.on("opencdata", function (tag) {
        // tag name
        //console.log("opencdata: " + tag + "\r\n");
      });

      saxStream.on("cdata", function (s) {
        // inner text string
        //console.log("cdata: " + s + "\r\n");
      });

      saxStream.on("closecdata", function (tag) {
        // tag name
        //console.log("closecdata: " + tag + "\r\n");
      });

      saxStream.on("end", function () {
        // stream has closed
        //console.log("end:" + "\r\n");
      });

      saxStream.on("ready", function () {
        // parser reset, ready to be reused.
        //console.log("ready:" + "\r\n");
      });

      saxStream.on("error", function (e) {
        // unhandled error
        console.error("error: ", e)
        // clear the error
        this._parser.error = null
        this._parser.resume()
      });

      // create a data sink, because saxStream doesn't see to be a proper async Writable
      let ws = new Writable({
        write(chunk, encoding, callback) {
          callback();
        }
      });

      let pipes = [];
      pipes.push(rs);
      pipes.push(saxStream);
      pipes.push(ws);
      pipeline(pipes);

      await finished(ws);

      this.emit("end");
      return this.rows;
    }
    catch (err) {
      console.error(err);
      this.emit("error", err);
    }
  }

  /**
   * Emits or appends data to output.
   *
   * @param {*} row is an array of data values
   */
  output(row) {
    if (row.length < this.options.cells)
      return;

    if (this.listenerCount("data") > 0)
      this.emit("data", row);
    else
      this.rows.push(row);

    this.rowNum++;
  }

};
