#!/usr/bin/env node
/* eslint-disable node/shebang */
/**
 * html-data-parser
 */
"use strict";

const HtmlDataReader = require("./lib/HtmlDataReader.js");
const RepeatCellTransform = require("./lib/RepeatCellTransform.js");
const RepeatHeadingTransform = require("./lib/RepeatHeadingTransform.js");
const RowAsObjectTransform = require("./lib/RowAsObjectTransform.js");
const FormatCSV = require("./lib/FormatCSV.js");
const FormatJSON = require("./lib/FormatJSON.js");
const { parse } = require("jsonc-parser");
const Package = require("./package.json");
const colors = require('colors');

const { open, readFile } = require('node:fs/promises');
const { pipeline } = require('node:stream/promises');
const { stdout } = require('node:process');

colors.enable();

// default program options
var options = {
  url: "",
  output: "",
  format: "json",
  cells: "1-256",
  trim: true
}

/**
 * parseArgs
 *   only filename is required
 *   example ["node.exe", "html-data-parser.js", <filename.html|URL>, <output> "--cells=3", "--heading=title", "--repeating" "--headers=c1,c2,.." "--format=csv|json|rows" ]
 */
async function parseArgs() {
  let clOptions = {}; // command line options
  let ofOptions = {}; // options file options
  let optionsfile = "hdp.options.json";

  let i = 2;
  while (i < process.argv.length) {
    let arg = process.argv[ i ];

    if (arg[ 0 ] !== "-") {
      if (!clOptions.url)
        clOptions.url = arg;
      else
        clOptions.output = arg;
    }
    else {
      let nv = arg.split('=');

      if (nv[ 0 ] === "--options")
        optionsfile = nv[ 1 ];
      else if (nv[ 0 ] === "--cells")
        clOptions.cells = parseInt(nv[ 1 ]);
      else if (nv[ 0 ] === "--heading")
        clOptions.heading = nv[ 1 ];
      else if (nv[ 0 ] === "--id")
        clOptions.id = nv[ 1 ];
      else if (nv[ 0 ].includes("--headers"))
        clOptions.headers = nv[ 1 ].split(",");
      else if (nv[ 0 ] === "--format")
        clOptions.format = nv[ 1 ].toLowerCase();
    }
    ++i;
  }

  if (optionsfile) {
    try {
      let opts = await readFile(optionsfile, { encoding: 'utf8' });
      let perrors = [];
      let poptions = {
        disallowComments: false,
        allowTrailingComma: true,
        allowEmptyContent: false
      };
      ofOptions = parse(opts, perrors, poptions)
    }
    catch (err) {
      if (err.code !== 'ENOENT' || optionsfile != "hdp.options.json")
        throw err;
    }
  }

  Object.assign(options, ofOptions, clOptions);
}

/**
 * Program entry point.
 */
(async () => {
  let retCode = 0;

  await parseArgs();

  let stdoutput = options.output === "" || !options.url;

  if (!stdoutput) {
    console.log("hdp HTML Data Parser " + Package.version);
    console.log("Copyright 2024 Drew O. Letcher | The MIT License");
  }

  if (!options.url) {
    console.log("");
    console.log("Parse tabular data from a HTML file.");
    console.log("");
    console.log("hdp <filename.html|URL> <output> --options=filename.json --heading=title --id=name --cells=# --headers=name1,name2,... --format=csv|json|rows");
    console.log("");
    console.log("  filename|URL - path name or URL of HTML file to process, required.");
    console.log("  output       - local path name for output of parsed data, default stdout.");
    console.log("  --options    - JSON or JSONC file containing hdp options, default: hdp.options.json.");
    console.log("  --heading    - text of heading to find in document that precedes desired data table, default none.");
    console.log("  --id         - TABLE element id attribute to find in document.");
    console.log("  --cells      - minimum number of cells for a data row, default = 1.");
    console.log("  --headers    - comma separated list of column names for data, default none first table row contains names.");
    console.log("  --format     - output data format CSV, JSON, or ROWS (JSON array of arrays), default JSON.");
    console.log("");
    return;
  }

  try {
    let pipes = [];

    let reader = new HtmlDataReader(options);
    pipes.push(reader);

    if (Object.hasOwn( options,  "RepeatCell.column") || Object.hasOwn( options, "column")) {
      let transform = new RepeatCellTransform(options);
      pipes.push(transform);
    }

    if (Object.hasOwn( options, "RepeatHeading.header") || Object.hasOwn( options, "header")) {
      let transform = new RepeatHeadingTransform(options);
      pipes.push(transform);
    }

    if (options?.format !== "rows") {
      let transform = new RowAsObjectTransform(options);
      pipes.push(transform);
    }

    let formatter = options?.format === "csv" ? new FormatCSV(options) : new FormatJSON(options);
    pipes.push(formatter);

    let writer;
    if (options.output) {
      let fd = await open(options.output, "w");
      writer = fd.createWriteStream();
    }
    else
      writer = process.stdout;
    pipes.push(writer);

    await pipeline(pipes);

    if (options.output)
      writer.end();
  }
  catch (err) {
    console.error(err.message.red);
    retCode = 1;
  }

  if (!stdoutput) {
    if (retCode === 0)
      console.log("parser results OK".green);
    else
      console.log(" parser failed.".red);
  }

  process.exitCode = retCode;
})();
