var webpack = require('webpack');
var path    = require('path');
var util    = require('gulp-util');
var config  = require('./gulp/config');

function createConfig(env) {
    var isProduction, webpackConfig;

    if (env === undefined) {
        env = process.env.NODE_ENV;
    }

    isProduction = env === 'production';

    webpackConfig = {
        context: path.join(__dirname, config.src.js),
        entry: {
            // vendor: ['jquery'],
            app: './app.js'
        },
        output: {
            path: path.join(__dirname, config.dest.js),
            filename: '[name].js',
            publicPath: 'js/'
        },
        devtool: isProduction
            ? '#source-map'
            : '#cheap-module-eval-source-map',
        plugins: [
            // new webpack.optimize.CommonsChunkPlugin({
            //     name: 'vendor',
            //     filename: '[name].js',
            //     minChunks: Infinity
            // }),
            new webpack.NoErrorsPlugin(),
            new webpack.ResolverPlugin(
                new webpack.ResolverPlugin.DirectoryDescriptionFilePlugin(".bower.json", ["main"])
            )
        ],
        resolve: {
            extensions: ['', '.js'],
            modulesDirectories: [ "node_modules", "bower_components"]
        },
        module: {
            loaders: [
                {
                    test: /\.js$/,
                    exclude: [/node_modules/, /bower_components /],
                    loader: 'babel'
                },
            ]
        },
        options: {
            transform: [['babelify', { compact: false }]]
        }
    };

    if (isProduction) {
        webpackConfig.plugins.push(
            new webpack.optimize.DedupePlugin(),
            new webpack.optimize.OccurenceOrderPlugin(),
            new webpack.optimize.UglifyJsPlugin({
                compress: {
                    warnings: false
                }
            })
        );
    }

    return webpackConfig;
}

module.exports = createConfig();
module.exports.createConfig = createConfig;
