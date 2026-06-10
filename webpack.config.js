/* eslint-disable @typescript-eslint/no-require-imports */
"use strict";
const path = require("path");

// Custom webpack override: use transpileOnly to bypass @types/node TS4.5 incompatibility
module.exports = {
    module: {
        rules: [
            {
                test: /\.(tsx?|mtsx?)$/,
                use: [
                    {
                        loader: require.resolve("ts-loader"),
                        options: {
                            transpileOnly: true,
                            allowTsInNodeModules: false,
                        },
                    },
                ],
                exclude: /node_modules/,
            },
        ],
    },
};
