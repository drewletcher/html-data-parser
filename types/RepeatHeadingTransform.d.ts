declare const _exports: {
    new (options?: {
        header?: string | undefined;
    } | undefined): {
        columnHeader: any;
        columnIndex: any;
        repeatValue: string;
        count: number;
        /**
         * Internal call from streamWriter to process an object
         * @param {Object} row
         * @param {String} encoding
         * @param {Function} callback
         */
        _transform(row: Object, encoding: string, callback: Function): void;
        /**
         *
         * @param {Function} callback
         */
        _flush(callback: Function): void;
    };
};
export = _exports;
//# sourceMappingURL=RepeatHeadingTransform.d.ts.map