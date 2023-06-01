// Taken from https://krzysztofzuraw.com/blog/2020/setting-up-chrome-extension-dev/

const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const {CleanWebpackPlugin} = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
    entry: {
        background: './src/listeners.js',
        popup: './src/components/index.js'
    },
    module: {
        rules: [{
            test: /\.(js|jsx)$/,
            exclude: /node_modules/,
            loader: "babel-loader",
            options: {
                presets: ["@babel/react", "@babel/env"],
            },
        }, {
            test: /\.css$/,
            use: ["style-loader", "css-loader"],
        }, {
            test: /\.(png|jp(e*)g|gif)$/,
            use: 'file-loader',
        },{
            test: /\.svg$/,
            use: ['@svgr/webpack'],
        }],
    },
    resolve: {
        extensions: ['.jsx', '.js'],
    },
    plugins: [
        new CleanWebpackPlugin({cleanStaleWebpackAssets: false}),
        new CopyWebpackPlugin({
            patterns: [
                {from: './manifest.json'},
                {from: './src/components/popup.html'},
                {from: './src/icons/logo-16.png'},
                {from: './src/icons/logo-48.png'},
                {from: './src/icons/logo-128.png'},
            ],
        }),
        // new HtmlWebpackPlugin({template: 'src/components/popup.html'}),
    ],
    output: {filename: '[name].js', path: path.resolve(__dirname, 'dist')},
};