declare const _exports: {
    new (options?: {
        headers?: string[] | undefined;
    } | undefined): {
        headers: any;
        /**
         * Internal call from streamWriter to process an object
         * @param {Object} row
         * @param {String} encoding
         * @param {Function} callback
         */
        _transform(row: Object, encoding: string, callback: Function): void;
    };
};
export = _exports;
//# sourceMappingURL=RowAsObjectTransform.d.ts.map