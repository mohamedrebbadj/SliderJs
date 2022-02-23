// Generated using webpack-cli https://github.com/webpack/webpack-cli

const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
// const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

const isProduction = process.env.NODE_ENV == "production";

const stylesHandler = MiniCssExtractPlugin.loader;

const config = {
  mode: "development",
  entry: "./index.ts",
  output: {
    filename: "js/SliderJs.bundle.js",
    path: path.resolve(__dirname, "dist")
    // assetModuleFilename: "images/[name][ext]"
  },
  devtool: "source-map",
  devServer: {
    open: true,
    host: "localhost",
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: "index.html",
    }),

    new MiniCssExtractPlugin({
      filename: "css/SliderJs.css"
    }),

  ],
  module: {
    rules: [

      {
        test: /\.css$/i,
        exclude: /node_modules/,
        use: [stylesHandler, "css-loader"],
      },
      {
        test: /\.scss$/i,
        exclude: /node_modules/,
        use: [stylesHandler, "css-loader", "postcss-loader", "sass-loader"],
      },
      // {
      //   test: /\.(eot|svg|ttf|woff|woff2|png|jpg|gif)$/i,
      //   type: "asset/resource",
      //   exclude: /node_modules/
      // },
      {
        test: /\.(ts|tsx)$/,
        exclude: /node_modules/,
        use: ["babel-loader", "ts-loader"]
      }
      // Add your rules for custom modules here
      // Learn more about loaders from https://webpack.js.org/loaders/
    ],
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js"],
  },
};

module.exports = () => {
  if (isProduction) {
    
  }
  return config;
};