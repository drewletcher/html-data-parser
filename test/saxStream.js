/**
 * test/saxStream
 *
 * Test SAX.js stream.
 */

import sax from "sax";
import fs from "node:fs";

let output = fs.openSync("./test/output/sax/saxStream.txt", "w");

const strict = false; // set to false for HTML mode
const options = {
  "trim": true
};

// stream usage
// takes the same options as the parser
var saxStream = sax.createStream(strict, options);

saxStream.on("error", function (e) {
  // unhandled error
  console.error("error: ", e)
  // clear the error
  this._parser.error = null
  this._parser.resume()
});

saxStream.on("end", function () {
  // stream has closed
  fs.writeSync(output, "end:" + "\r\n");
});

saxStream.on("ready", function () {
  // parser reset, ready to be reused.
  fs.writeSync(output, "ready:" + "\r\n");
});

saxStream.on("doctype", function (s) {
  // doctype string
  fs.writeSync(output, "doctype: " + JSON.stringify(s) + "\r\n");
});

saxStream.on("processinginstruction", function (o) {
  // object with "name", "body"
  fs.writeSync(output, "processinginstruction: " + JSON.stringify(o) + "\r\n");
});

saxStream.on("comment", function (s) {
  // comment string
  fs.writeSync(output, "comment: " + JSON.stringify(s) + "\r\n");
});

saxStream.on("opentagstart", function (node) {
  // node object with name, attributes (empty)
  //fs.writeSync(output, "opentagstart: " + JSON.stringify(node) + "\r\n");
});

saxStream.on("attribute", function (attr) {
  // attribute object with name, value
  //fs.writeSync(output, "attribute: " + JSON.stringify(attr) + "\r\n");
});

saxStream.on("opentag", function (node) {
  // node object with name, attributes, isSelfClosing
  fs.writeSync(output, "opentag: " + JSON.stringify(node) + "\r\n");
});

saxStream.on("text", function (s) {
  // inner text string
  fs.writeSync(output, "text: " + s + "\r\n");
});

saxStream.on("closetag", function (tag) {
  // tag name
  fs.writeSync(output, "closetag: " + tag + "\r\n");
});

saxStream.on("opencdata", function (tag) {
  // tag name
  fs.writeSync(output, "opencdata: " + tag + "\r\n");
});

saxStream.on("cdata", function (s) {
  // inner text string
  fs.writeSync(output, "cdata: " + s + "\r\n");
});

saxStream.on("closecdata", function (tag) {
  // tag name
  fs.writeSync(output, "closecdata: " + tag + "\r\n");
});

saxStream.on("script", function (s) {
  // script contents as string
  fs.writeSync(output, "script: " + JSON.stringify(s) + "\r\n");
});


// pipe is supported, and it's readable/writable
// same chunks coming in also go out.
fs.createReadStream("./test/data/html/texas_jan2024.shtml")
  .pipe(saxStream)
  .pipe(fs.createWriteStream("./test/output/sax/saxStream.html"));
/*
// pipe is supported, and it's readable/writable
// same chunks coming in also go out.
fs.createReadStream("https://www.census.gov/library/reference/code-lists/ansi.html")
.pipe(saxStream)
.pipe(fs.createWriteStream("./test/output/sax/saxStream.html"));
*/
