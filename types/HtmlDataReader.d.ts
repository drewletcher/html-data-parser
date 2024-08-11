export = HtmlDataReader;
declare class HtmlDataReader {
    /**
     *
     * @param {object}           options
     * @param {URL|string}       options.url
     * @param {Uint8Array|string} options.data
     */
    constructor(options: {
        url: URL | string;
        data: Uint8Array | string;
    });
    started: boolean;
    options: {};
    _construct(callback: any): Promise<void>;
    parser: HtmlDataParser;
    /**
     * Fetch data from the underlying resource.
     * @param {*} size <number> Number of bytes to read asynchronously
     */
    _read(size: any): Promise<void>;
}
import HtmlDataParser = require("./HtmlDataParser");
//# sourceMappingURL=HtmlDataReader.d.ts.map