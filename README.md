# html-data-parser 1.0.x

Parse, search and stream HTML tabular data using Node.js and isaacs/sax-js.

This document explains how to use html-data-parser in your code or as a stand-alone program.

> Only supports HTML documents containing TABLE elements. Does not support parsing grid or other table like elements.

## Installation

For use as command line utility. Requires Node.js 18+.

```bash
npm -g install html-data-parser
```

For use as module in a Node.js project. See Developers Guide below.

```bash
npm install html-data-parser
```

## CLI Program

---

Parse tabular data from a HTML file.

```bash
hdp [--options=filename.json] <filename.html|URL> [<output-file>] [--cells=#] [--heading=title] [--headers=name1,name2,...] [--format=json|csv|rows]

  `--options`    - file containing JSON object with hdp options, optional.
  `filename|URL` - path name or URL of HTML file to process, required.
  `output-file`  - local path name for output of parsed data, default stdout.
  `--format`     - output data format JSON, CSV or rows (JSON arrays), default JSON.
  `--cells`      - minimum number of cells for a data row, default = 1.
  `--heading`    - text of heading to find in document that precedes desired data table, default none.
  `--headers`    - comma separated list of column names for data, default none the first table row contains names.
```

Note: If the `hdp` command conflicts with another program on your system use `hpddataparser` instead.

### Options File

The options file supports options for all html-data-parser modules.

```javascript
{
  ///// HtmlDataParser options
  // url - local path name or URL of HTML file to process, required.
  "url": "",
  // output - local path name for output of parsed data, default stdout.
  "output": "",
  // format - output data format CSV, JSON or rows, default JSON, rows is JSON array of arrays (rows).
  "format": "json",
  // heading - text of heading to find in document that precedes desired data table, default none.
  "heading": null,
  // cells - minimum number of cells for a data row, default = 1.
  "cells": 1,
  // trim whitespace from output values, false (0) = none, true (1) = both, 2 = starting only, 3 = trailing only, default: true.
  "trim": true,

  //// RowAsObjectTransform options
  // headers - comma separated list of column names for data, default none. When not defined the first table row encountered will be treated as column names.
  "RowAsObject.headers": null,

  //// RepeatCellTransform options
  // column - column index of cell to repeat, default 0.
  "RepeatCell.column": null,

  //// RepeatHeadingTransform options
  // header - column name for the repeating heading field. Can optionally contain an index of where to insert the header in the header row. Default "heading:0".
  "RepeatHeading.header": null
}
```

Note: `RowAsObject.headers`, `RepeatCell.column`, `RepeatHeading.header` properties can be shortened to `headers`, `column` and `header`.

### Examples

```bash
hdp ./test/data/html/helloworld.html --headers=Greeting --format=csv
```

```bash
hdp https://www.sos.state.tx.us/elections/historical/jan2024.shtml tx_voter_reg.json
```

```bash
hdp --options=.\\test\\testRepeatCell.json

testRepeatCell.json:
{
  "url": "./test/data/html/state_voter_registration_jan2024.html",
  "output": "./test/output/cli/repeat_cell.json",
  "format": "json",
  "cells": 7,
  "RepeatCell.column": 0
}
```

## Developer Guide

---

### HtmlDataParser

HtmlDataParser given a HTML document will output an array of arrays (rows). For most projects use the streaming classes PdfDataReader and RowAsObjectTransform transform to convert the arrays to Javascript objects.  With default settings HtmlDataParser will output rows in the first TABLE found in the document. Using [HtmlDataParser Options](#html-data-parser-options) the parser can filter content to retrieve the desired data TABLE in the document.

HtmlDataParser only works on a certain subset of HTML documents specifically those that contain some TABLE elements and NOT other table like grid elements. The parser uses [isaacs/sax-js](https://github.com/isaacs/sax-js) library to transform HTML table elements into rows of cells.

Rows and Cells terminology is used instead of Rows and Columns because the content in a HTML document flows more than a strict rows/columns of  database query results. Some rows may have more cells than other rows. For example a heading or description paragraph will be a row (array) with one cell (string).  See [Notes](#notes) below.

### Basic Usage

```javascript
const { HtmlDataParser } = require("html-data-parser");

let parser = new HtmlDataParser({url: "filename.html"});

async function myFunc() {
  var rows = await parser.parse();
  // process the rows
}
```

### HtmlDataParser Options

HtmlDataParser constructor takes an options object with the following fields. One of `url` or `data` arguments is required.

`{URL|string} url` - The local path or URL of the HTML document.

`{TypeArray|string} data` - pdf file data in a TypedArray, e.g. `options.data = new Uint8Array(buffer)`.

Common Options:

`{string|regexp} heading` - Section heading or text in the document after which the parser will look for tabular data; optional, default: none. The parser does a string comparison or regexp match looking for first occurrence of `heading` value in the first cell of rows. If not specified then data output starts with first row of the document that contains enough cells.

`{number} cells` - Minimum number of cells in tabular data; optional, default: 1. If `heading` is not specified then all rows in document with at least `cells` length will be output. If `heading` string is found parser will look for the first row that contains at least `cells` count of cells after the heading. The parser will output rows until it encounters a row with less than `cells` count of cells.

`{boolean|number} trim` - trim whitespace from output values, false (0) = no trimming, true (1) = both, 2 = starting only, 3 = trailing only, default: true.

## Streaming Usage

---

### PdfDataReader

PdfDataReader is a Node.js stream reader implemented with the Object mode option. It uses HtmlDataParser to stream one data row (array) per chunk.

```javascript
const { PdfDataReader } = require("html-data-parser");

let reader = new PdfDataReader({url: "filename.html"});
var rows = [];

reader.on('data', (row) => {
  rows.push(row)
});

reader.on('end', () => {
  // do something with the rows
});

reader.on('error', (err) => {
  // log error
})
```

### PdfDataReader Options

PdfDataReader constructor options are the same as [HtmlDataParser Options](#html-data-parser-options).

### RowAsObjectTransform

PdfDataReader operates in Object Mode. The reader outputs arrays (rows). To convert rows into Javascript objects use the RowAsObjectTransform transform.  PdfDataReader operates in Object mode where a chunk is a Javascript Object of <name,value> pairs.

```javascript
const { PdfDataReader, RowAsObjectTransform } = require("html-data-parser");
const { pipeline } = require('node:stream/promises');

let reader = new PdfDataReader(options);
let transform1 = new RowAsObjectTransform(options);
let writable = <some writable that can handle Object Mode data>

await pipeline(reader, transform1, writable);
```

### RowAsObjectTransform Options

RowAsObjectTransform constructor takes an options object with the following fields.

`{array} headers` - array of cell property names; optional, default: none. If a headers array is not specified then parser will assume the first row found contains cell property names.

If a row is encountered with more cells than in the headers array then extra cell property names will be the ordinal position. For example if the data contains five cells, but only three headers where specified.  Specifying `options = { headers: [ 'name', 'type', 'info' ] }` then the Javascript objects in the stream will contain `{ "name": "value1", "type": "value2", "info": "value3", "4": "value4", "5": "value5" }`.

### RepeatCellTransform

The RepeatCellTransform will normalize data the was probably generated by a report writer. The specified cell will be repeated in following rows that contain one less cell. In the following example "Dewitt" will be repeated in rows 2 and 3.

**HTML Document**

```
County   Precincts  Date/Period   Total
Dewitt          44  JUL 2023     52,297
                44  OCT 2023     52,017
                44  JAN 2024     51,712
```

**Output**

```
[ "County", "Precincts", "Date/Period", "Total" ]
[ "Dewitt", "44", "JUL 2023", "52,297" ]
[ "Dewitt", "44", "OCT 2023", "52,017" ]
[ "Dewitt", "44", "JAN 2024", "51,712" ]
```

### Example Usage

```javascript
const { PdfDataReader, RepeatCellTransform } = require("html-data-parser");
const { pipeline } = require('node:stream/promises');

let reader = new PdfDataReader(options);
let transform1 = new RepeatCellTransform({ column: 0 });
let writable = <some writable that can handle Object Mode data>

await pipeline(reader, transform1, writable);
```

### RepeatCellTransform Options

RepeatCellTransform constructor takes an options object with the following fields.

`{number} column` - column index of cell to repeat, default 0.

### RepeatHeadingTransform

The RepeatHeadingTransform will normalize data the was probably generated by a report writer. The subheading cell will be repeated in rows that follow until another subheading is encountered. In the following example `options = {header: "County:1"}`.

**HTML Document**

```
District  Precincts    Total

Congressional District 5
Maricopa        120  403,741
Pinal            30  102,512
Total:          150  506,253
```

**Output**

```
[ "District", "County", "Precincts", "Total" ]
[ "Congressional District 5", "Maricopa", "120", "403,741" ]
[ "Congressional District 5", "Pinal", "30", "102,512" ]
[ "Congressional District 5", "Total:", "150", "506,253" ]
```

```javascript
const { PdfDataReader, RepeatHeadingTransform } = require("html-data-parser");
const { pipeline } = require('node:stream/promises');

let reader = new PdfDataReader(options);
let transform1 = new RepeatHeadingTransform({header: "County:1"});
let writable = <some writable that can handle Object Mode data>

await pipeline(reader, transform1, writable);
```

### RepeatHeadingTransform Options

RepeatHeadingTransform constructor takes an options object with the following fields.

`{string} header` - column name for the repeating heading field. Can optionally contain an index of where to insert the header in the header row. Default "heading:0".

### FormatCSV and FormatJSON

The `hpddataparser` CLI program uses the FormatCSV and FormatJSON transforms to covert Javascript Objects into strings that can be saved to a file.

```javascript
const { PdfDataReader, RowAsObjectTransform, FormatCSV } = require("html-data-parser");
const { pipeline } = require('node:stream/promises');

let reader = new PdfDataReader(options);
let transform1 = new RowAsObjectTransform(options);
let transform2 = new FormatCSV();

await pipeline(reader, transform1, transform2, process.stdout);
```

## Examples

---

In the source code the html-data-parser.js program and the Javascript files in the /test folder are good examples of using the library modules.

### Hello World

[HelloWorld.html](./test/data/pdf/helloworld.html) is a single page HTML document with the string "Hello, world!" positioned on the page. The HtmlDataParser output is one row with one cell.

```json
[
  ["Hello, world!"]
]
```

To transform the row array into an object specify the headers option to RowAsObjectTransform transform.

```javascript
let transform = new RowAsObjectTransform({
  headers: [ "Greeting" ]
})
```

Output as JSON objects:

```json
[
  { "Greeting": "Hello, world!" }
]
```

### Census.gov Class Codes

[ClassCodes.html](./test/data/pdf/ClassCodes.html) contains one simple table spanning multiple pages. It is a straight forward parsing of all rows in the document.

```javascript
let parser = new HtmlDataParser({ url: "https://www2.census.gov/geo/pdfs/reference/ClassCodes.html" })
```

Parser output:

```json
[
  ["Class Code","Class Code Description","Associated Geographic Entity"],
  ["A1","Airport with scheduled commercial flights that also serves as a military installation","Locality Point, Military Installation"],
   ...
  ["Z9","County subdivision not defined","County Subdivision"]
]
```

### USGS.gov File Specification

[Nat_State_Topic_File_formats.html](./test/data/pdf/Nat_State_Topic_File_formats.html) contains USGS file formats for various downloadable reference files.  It is a rather complicated example containing multiple tables of data interspersed with headings, descriptive paragraphs, vertical column spans, cells split across pages and embedded hyperlinks.  See [Notes](#notes) below.

For this example the parser will look for tabular data following the heading "Government Units File Format" found on pages 6 and 7 in [Nat_State_Topic_File_formats.html](./test/data/pdf/Nat_State_Topic_File_formats.html).

```javascript
let parser = new HtmlDataParser({
  url: "https://geonames.usgs.gov/docs/pubs/Nat_State_Topic_File_formats.html",
  heading: "Government Units File Format",
  cells: 3
})
```

Note that `cells: 3` was specified even though the output has four cells.  The fourth cell of this table sometimes contains a vertical spanning cell.  Specifying `cells: 4` would cause the parser to short circuit on the row after the vertical span, because it would only contain three cells.

Parser output:

```json
[
  ["Name","Type","Length/Decimals","Description"],
  ["Feature ID","Number","10","ID number for the governmental unit."],
  ["Unit Type","Character","50","Type of government unit."],
  ...,
  ["Country Name","Character","100"],
  ["Feature Name","Character","120","Official feature name"]
]
```

### State of Iowa Voter Registration Totals by County

[CoJul22.html](./test/data/pdf/CoJul22.html) contains one simple table spanning multiple pages. This document contains page headers and footers with repeating table headers on each page. Use the _repeatingHeaders_ option to remove the extra table headers from output data.

```javascript
let parser = new HtmlDataParser({ url: "./test/data/pdf/CoJul22.html", repeatingHeaders: true })
```

The page headers/footers in this document are in HTML.js _Artifacts_ content. They will be ignored by default. To output the page headers and footers use the _artifacts_ option.

```javascript
let parser = new HtmlDataParser({ url: "./test/data/pdf/CoJul22.html", artifacts: true })
```

If your document has page headers/footers contained in regular table elements then the headers/footers can be ignored by using the _pageHeader_ and _pageFooter_ options.  The settings of 50 and 35 ignore 3 and 2 lines respectively.

```javascript
let parser = new HtmlDataParser({ url: "./test/data/pdf/CoJul22.html", pageHeader: 50, pageFooter: 35 })
```

### State of Iowa Voter Registration Totals by Congressional District

[CongJul22.html](./test/data/pdf/CongJul22.html) contains four tables. This document contains page headers and footers.

> An oddity of this document is there is an additional table header row that identifies each table. This content item, e.g. "US Representative District 1", is actually in the document content after the table. The HtmlDataParser has specialized logic to insert the cell data in the appropriate flow order before output of data rows.

HtmlDataParser does not support the splitting of output so the file would need to be read four times with separate `heading` options or read all together and then hand edit the output. Alternatively, a custom Node.js stream transform or writer derived class could be used to split the data into multiple outputs.

```javascript
parser1 = new HtmlDataParser({ url: "./test/data/pdf/CongJul22.html", heading: "US Representative District 1", cells: 12 })
house1 = await parser.parse();
parser2 = new HtmlDataParser({ url: "./test/data/pdf/CongJul22.html", heading: "US Representative District 2", cells: 12 })
house2 = await parser.parse();
parser3 = new HtmlDataParser({ url: "./test/data/pdf/CongJul22.html", heading: "US Representative District 3", cells: 12 })
house3 = await parser.parse();
parser3 = new HtmlDataParser({ url: "./test/data/pdf/CongJul22.html", heading: "US Representative District 4", cells: 12 })
house3 = await parser.parse();
```

## Notes

---

* Only supports HTML files containing TABLE elements. Does not support other table like grid elements.
* Does not support identification of titles, headings, column headers, etc. by using style information for a cell.
* Vertical spanning cells are parsed with first row where the cell is encountered. Subsequent rows will not contain the cell and have one less cell. Currently, vertical spanning cells must be at the end of the row otherwise the ordinal position of cells in the following rows will be incorrect, i.e. missing values are not supported.
