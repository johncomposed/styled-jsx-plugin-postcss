const path = require("path");

module.exports = {
  plugins: {
    "postcss-import": {},
    "postcss-preset-env": {
      browsers: ["last 2 versions", "ie >= 10"],
      features: {
        "nesting-rules": true,
      },
    },
    "postcss-calc": {},
    [path.resolve(__dirname, "./fixtures/fixture-postcss-plugin.js")]: {},
  },
};
