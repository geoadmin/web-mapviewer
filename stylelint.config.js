module.exports = {
  extends: [
    "stylelint-config-recommended-vue",
    "stylelint-config-recommended-scss"
  ],
  plugins: ["stylelint-scss", "stylelint-order"],
  overrides: [
    {
      files: ["**/*.vue"],
      customSyntax: "postcss-html"
    }
  ],
  rules: {
    "no-duplicate-selectors": null, // Deactivating rule to allow duplicate selectors to follow the new sass expected bahaviour https://sass-lang.com/documentation/at-rules/mixin/
    "property-no-unknown": [true, { // Deactivating rule to allow unknown properties in :export selectors
      "ignoreSelectors": [":export"]
    }],
    "declaration-property-value-no-unknown": [true, {
      "ignoreProperties": {
        "/.+/": "/$/", // ignore variables with a $ (i have not found a way to make it work only if the $ is at the beginning since "/^\\$/" does not work at all)
      }
    }],
    "selector-pseudo-class-no-unknown": [ // Deactivating rule to allow pseudo classes like :global
      true,
      {
        "ignorePseudoClasses": [
          "global",
          "export",
          "deep",
        ]
      }
    ],
  }
};