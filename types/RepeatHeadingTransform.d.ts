declare const _exports: {
    new (options?: {
        header?: string;
    }): {
        columnHeader: any;
        columnIndex: any;
        repeatValue: string;
        count: number;
        /**
         * Internal call from streamWriter to process an object
         * @param {*} row
         * @param {*} encoding
         * @param {*} callback
         */
        _transform(row: any, encoding: any, callback: any): void;
        _flush(callback: any): void;
    };
};
export = _exports;
//# sourceMappingURL=RepeatHeadingTransform.d.ts.map