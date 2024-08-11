export = HtmlDataParser;
declare class HtmlDataParser {
    /**
     *
     * @param {Object}   options
     * @param {String|URL}  [options.url] - the URL or local file name of the .html
     * @param {String|Uint8Array} [options.data] - HTML file data in an array, instead of using url
     * @param {String|RegExp}   [options.heading] - HTML section heading where data is located, default: none (first table)
     * @param {String|RegExp}   [options.id] - TABLE element's id attribute to find in document.
     * @param {Number}   [options.cells] - minimum number of cells in a tabular data, default: 1
     * @param {Boolean}  [options.newlines] - preserve new lines in cell data, default: false
     * @param {Boolean}  [options.trim] = trim whitespace, default: true
     */
    constructor(options?: {
        url?: string | URL | undefined;
        data?: string | Uint8Array | undefined;
        heading?: string | RegExp | undefined;
        id?: string | RegExp | undefined;
        cells?: number | undefined;
        newlines?: boolean | undefined;
        trim?: boolean | undefined;
    });
    options: {
        cells: number;
        trim: boolean;
    } & {
        url?: string | URL | undefined;
        data?: string | Uint8Array | undefined;
        heading?: string | RegExp | undefined;
        id?: string | RegExp | undefined;
        cells?: number | undefined;
        newlines?: boolean | undefined;
        trim?: boolean | undefined;
    };
    saxOptions: {
        trim: boolean;
    };
    rows: any[];
    rowNum: number;
    /**
     * Load and parse the HTML document.
     * @returns Rows an array containing arrays of data values.
     * If using an event listener the return value will be an empty array.
     */
    parse(): Promise<any[] | undefined>;
    /**
     * Emits or appends data to output.
     *
     * @param {*} row is an array of data values
     */
    output(row: any): void;
    /**
    *
    * @param {Object} pattern - options.heading value
    * @param {String} text - text to compare
    */
    compareText(pattern: Object, text: string): any;
}
//# sourceMappingURL=HtmlDataParser.d.ts.map