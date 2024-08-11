declare const _exports: {
    new (options?: {
        headers?: string[];
    }): {
        headers: any;
        /**
         * Internal call from streamWriter to process an object
         * @param {*} row
         * @param {*} encoding
         * @param {*} callback
         */
        _transform(row: any, encoding: any, callback: any): void;
    };
};
export = _exports;
//# sourceMappingURL=RowAsObjectTransform.d.ts.map