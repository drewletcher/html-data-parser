/**
 * test/optionsRepeatHeading.js
 */

import { HtmlDataReader, RowAsObjectTransform, RepeatHeadingTransform } from "../lib/index.js";
import FormatJSON from '../lib/FormatJSON.js';
import { pipeline } from 'node:stream/promises';
import fs from "node:fs";
import path from "node:path";
import compareFiles from "./_compareFiles.js";

async function test(options) {

  let reader = new HtmlDataReader(options);

  let transform1 = new RepeatHeadingTransform(options);
  let transform2 = new RowAsObjectTransform(options);
  let transform3 = new FormatJSON();

  let outputFile = "./test/output/RepeatHeading/" + path.parse(options.url).name + ".json";
  console.log("output: " + outputFile);
  fs.mkdirSync(path.dirname(outputFile), { recursive: true });
  let writer = fs.createWriteStream(outputFile, { encoding: "utf-8", autoClose: false });

  await pipeline(reader, transform1, transform2, transform3, writer);

  let expectedFile = outputFile.replace("/output/", "/expected/");
  let exitCode = compareFiles(outputFile, expectedFile, 2);
  return exitCode;
}

(async () => {
  if (await test({
    "url": "./test/data/html/az_jan2024.htm",
    "heading": "Congressional Districts - Active",
    "RepeatHeading.header": "County:1:0"
  })) return 1;
})();
