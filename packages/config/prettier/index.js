"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var config = {
    printWidth: 100,
    singleQuote: true,
    singleAttributePerLine: true,
    semi: false,
    trailingComma: 'es5',
    tabWidth: 4,
    jsxSingleQuote: false,
    plugins: [
        '@prettier/plugin-xml',
        'prettier-plugin-jsdoc',
        'prettier-plugin-packagejson',
        'prettier-plugin-tailwindcss',
    ],
    overrides: [
        {
            files: '*.md',
            options: {
                tabWidth: 2,
            },
        },
    ],
};
exports.default = config;
