// Generated using webpack-cli https://github.com/webpack/webpack-cli

const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const TerserPlugin = require("terser-webpack-plugin");

const isProduction = process.env.NODE_ENV == "production";

const stylesHandler = MiniCssExtractPlugin.loader;


module.exports = () => {
  return {
    mode: isProduction ? "production" : "development",
    entry: "./index.ts",
    devtool: isProduction ? "source-map" : "eval",
    output: {
      filename: isProduction ? "js/SliderJs.min.js" : "js/SliderJs.js",
      path: path.resolve(__dirname, isProduction ? "build" : "dist"),
      library: {
        type: "umd",
        name: "SJ"
      }
      // assetModuleFilename: "images/[name][ext]"
    },
    devServer: {
      open: true,
      host: "localhost",
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: "index.html",
      }),

      new MiniCssExtractPlugin({
        filename: isProduction ? "css/SliderJs.min.css" : "css/SliderJs.css"
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
    optimization: {
      minimizer: isProduction ? [
        new CssMinimizerPlugin(), new TerserPlugin({extractComments: true})
      ] : []
    },
    resolve: {
      extensions: [".tsx", ".ts", ".js"],
    },
  }
};