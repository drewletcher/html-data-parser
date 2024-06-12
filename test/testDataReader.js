/**
 * test/testReader.js
 */

const HtmlDataReader = require("../lib/HtmlDataReader");
const FormatJSON = require('../lib/FormatJSON');
const { finished } = require('stream/promises');
const fs = require("fs");
const path = require("path");
const compareFiles = require("./_compareFiles");

async function test(options) {
  let outputName = path.parse(options.url || options.data).name;

  if (options.data) {
    options.data = new Uint8Array(fs.readFileSync(options.data));
    outputName += "_data";
  }

  let reader = new HtmlDataReader(options);

  let transform = new FormatJSON();

  let outputFile = "./test/output/HtmlDataReader/" + outputName + ".json";
  console.log("output: " + outputFile);
  fs.mkdirSync(path.dirname(outputFile), { recursive: true });
  let writer = fs.createWriteStream(outputFile, { encoding: "utf-8", autoClose: false });

  reader.pipe(transform).pipe(writer);
  await finished(writer);

  let expectedFile = outputFile.replace("/output/", "/expected/");
  let exitCode = compareFiles(outputFile, expectedFile, 2);
  return exitCode;
}

(async () => {
  if (await test({ url: "./test/data/html/helloworld.html" })) return 1;
  if (await test({ url: "./test/data/html/ClassCodes.html", newlines: false })) return 1;
  if (await test({ url: "./test/data/html/Nat_State_Topic_File_formats.html", heading: /Official short names, .*/, stopHeading: /.* File Format/, orderXY: false })) return 1;
  if (await test({ url: "./test/data/html/CoJul22.html", repeatingHeaders: true })) return 1;
  if (await test({ url: "./test/data/html/CongJul22.html" })) return 1;
  if (await test({ url: "./test/data/html/state_voter_registration_jan2024.html", pages: [ 3, 4, 5 ], pageHeader: 64, repeatingHeaders: true })) return 1;

  if (await test({ data: "./test/data/html/helloworld.html" })) return 1;
  if (await test({ data: "./test/data/html/ClassCodes.html", newlines: true })) return 1;
})();
