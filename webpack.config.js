const path = require('path');

module.exports = {
  entry: ["./src/index.jsx"],
  output: {
    path: path.join(__dirname, '/public'),
    filename: "bundle.js"
  },
  module: {
    loaders: [
      {
        exclude: /node_modules/,
        loader: "babel-loader",
        options: {
          presets: [
            'es2015',
            'react',
            'stage-2',
          ]
        }
      }
    ]
  },
  resolve: {
    extensions: [".js", ".jsx"]
  },
  devServer: {
    contentBase: "./"
  }
};
