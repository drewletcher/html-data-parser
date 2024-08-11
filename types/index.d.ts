export const HtmlDataParser: {
    new (options?: {
        url: string;
        data: Buffer | string;
        heading?: string;
        id?: string;
        cells?: number;
        newlines?: boolean;
        trim?: boolean;
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
        headers?: string[];
    }): {
        headers: any;
        _transform(row: any, encoding: any, callback: any): void;
    };
};
export const RepeatCellTransform: {
    new (options?: {
        column?: number;
    }): {
        column: any;
        repeatLength: number;
        repeatValue: string;
        _transform(row: any, encoding: any, callback: any): void;
        _flush(callback: any): void;
    };
};
export const RepeatHeadingTransform: {
    new (options?: {
        header?: string;
    }): {
        columnHeader: any;
        columnIndex: any;
        repeatValue: string;
        count: number;
        _transform(row: any, encoding: any, callback: any): void;
        _flush(callback: any): void;
    };
};
export const FormatCSV: {
    new (options: any): {
        first: boolean;
        _transform(row: any, encoding: any, callback: any): void;
    };
};
export const FormatJSON: {
    new (options: any): {
        first: boolean;
        _transform(row: any, encoding: any, callback: any): void;
        _flush(callback: any): void;
    };
};
//# sourceMappingURL=index.d.ts.map