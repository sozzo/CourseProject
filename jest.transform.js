const babelOptions = {
  presets: [["@babel/preset-env", { targets: { node: "16" } }], "@babel/preset-react"],
  plugins: [
    [
      "transform-react-jsx",
      {
        pragma: "h"
      },
      "@babel/plugin-proposal-export-default-from"
    ]
  ]
};
module.exports = require("babel-jest").default.createTransformer(babelOptions);