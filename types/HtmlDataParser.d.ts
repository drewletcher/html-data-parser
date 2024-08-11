export = HtmlDataParser;
declare class HtmlDataParser {
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
    constructor(options?: {
        url: string;
        data: Buffer | string;
        heading?: string;
        id?: string;
        cells?: number;
        newlines?: boolean;
        trim?: boolean;
    });
    options: {
        cells: number;
        trim: boolean;
    } & {
        url: string;
        data: Buffer | string;
        heading?: string;
        id?: string;
        cells?: number;
        newlines?: boolean;
        trim?: boolean;
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
    parse(): Promise<any[]>;
    /**
     * Emits or appends data to output.
     *
     * @param {*} row is an array of data values
     */
    output(row: any): void;
    /**
    *
    * @param {object} pattern - options.heading value
    * @param {string} text - text to compare
    */
    compareText(pattern: object, text: string): any;
}
//# sourceMappingURL=HtmlDataParser.d.ts.map