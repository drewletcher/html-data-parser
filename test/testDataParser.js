/**
 * test/testParser.js
 */

const HtmlDataParser = require("../lib/HtmlDataParser");
const fs = require("fs");
const path = require("path");
const compareFiles = require("./_compareFiles");

async function test(options) {
  try {
    let outputName = path.parse(options.url || options.data).name;

    if (options.data) {
      options.data = new Uint8Array(fs.readFileSync(options.data));
      outputName += "_data";
    }

    let parser = new HtmlDataParser(options);
    let rows = await parser.parse();

    let outputFile = "./output/HtmlDataParser/" + outputName + ".json";
    console.log("output: " + outputFile);
    fs.mkdirSync(path.dirname(outputFile), { recursive: true });
    fs.writeFileSync(outputFile, JSON.stringify(rows, null, 2));

    let expected = outputFile.replace("/output/", "/expected/");
    let exitCode = compareFiles(expected, outputFile, 2);
    return exitCode;
  }
  catch (err) {
    console.error(err);
  }
}

(async () => {
  if (await test({ url: "./data/html/texas_jan2024.shtml" })) return 1;
  //if (await test({ url: "https://www.sos.state.tx.us/elections/historical/jan2024.shtml" })) return 1;
})();
