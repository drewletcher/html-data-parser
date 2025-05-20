/**
 * test/testObjectTransform.js
 */

import { HtmlDataReader, RowAsObjectTransform } from "../lib/index.js";
import FormatJSON from '../lib/FormatJSON.js';
import { pipeline } from 'node:stream/promises';
import fs from "node:fs";
import path from "node:path";
import compareFiles from "./_compareFiles.js";

async function test(options) {
  let outputName = path.parse(options.url || options.data).name;

  if (options.data) {
    options.data = fs.readFileSync(options.data);
    //options.data = new Uint8Array(fs.readFileSync(options.data));
    outputName += "_data";
  }

  let reader = new HtmlDataReader(options);

  let transform1 = new RowAsObjectTransform(options);
  let transform2 = new FormatJSON();

  let outputFile = "./test/output/RowAsObjectTransform/" + outputName + ".json";
  console.log("output: " + outputFile);
  fs.mkdirSync(path.dirname(outputFile), { recursive: true });
  let writer = fs.createWriteStream(outputFile, { encoding: "utf-8", autoClose: false });

  await pipeline(reader, transform1, transform2, writer);

  let expectedFile = outputFile.replace("/output/", "/expected/");
  let exitCode = compareFiles(outputFile, expectedFile, 2);
  return exitCode;
}

(async () => {
  if (await test({ url: "./test/data/html/helloworld.html", id: "global", headers: [ "Greeting" ] })) return 1;
  if (await test({ data: "./test/data/html/helloworld.html", id: "cosmic", headers: [ "BigBang" ] })) return 1;
  if (await test({ url: "./test/data/html/ansi.html", heading: "Congressional Districts" })) return 1;
  if (await test({ url: "./test/data/html/texas_jan2024.shtml" })) return 1;

})();
