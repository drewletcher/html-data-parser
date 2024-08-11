export const HtmlDataParser: {
    new (options?: {
        url?: string | URL | undefined;
        data?: string | Uint8Array | undefined;
        heading?: string | RegExp | undefined;
        id?: string | RegExp | undefined;
        cells?: number | undefined;
        newlines?: boolean | undefined;
        trim?: boolean | undefined;
    }): import("./HtmlDataParser.js");
};
export const HtmlDataReader: {
    new (options: {
        url: URL | string;
        data: Uint8Array | string;
    }): import("./HtmlDataReader.js");
};
export const RowAsObjectTransform: {
    new (options?: {
        hasHeader?: Object | undefined;
        headers?: string[] | undefined;
    } | undefined): {
        headers: any;
        hasHeader: any;
        _transform(row: Object, encoding: string, callback: Function): void;
        _headers: Object | undefined;
    };
};
export const RepeatCellTransform: {
    new (options?: {
        column?: number | undefined;
    } | undefined): {
        column: any;
        repeatValue: string;
        prevLen: number;
        _transform(row: Object, encoding: string, callback: Function): void;
    };
};
export const RepeatHeadingTransform: {
    new (options?: {
        header?: string | undefined;
        hasHeader?: boolean | undefined;
    } | undefined): {
        header: any;
        headerIndex: any;
        dataIndex: any;
        hasHeader: any;
        subHeading: string;
        count: number;
        _transform(row: Object, encoding: string, callback: Function): void;
    };
};
export const FormatCSV: {
    new (options: any): {
        first: boolean;
        _transform(row: Object, encoding: string, callback: Function): void;
    };
};
export const FormatJSON: {
    new (options: any): {
        first: boolean;
        _transform(row: Object, encoding: string, callback: Function): void;
        _flush(callback: Function): void;
    };
};
//# sourceMappingURL=index.d.ts.map