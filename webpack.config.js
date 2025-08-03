const path = require('path');

module.exports = {
    mode: 'production',
    entry: './src/index.js',
    target: 'node',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'bundle.js'
    },
    externals: {
        // Exclude node_modules from bundle
        express: 'commonjs express',
        mongoose: 'commonjs mongoose',
        redis: 'commonjs redis',
        '@google-cloud/speech': 'commonjs @google-cloud/speech',
        '@google-cloud/text-to-speech': 'commonjs @google-cloud/text-to-speech',
        openai: 'commonjs openai'
    },
    resolve: {
        extensions: ['.js', '.json']
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env']
                    }
                }
            }
        ]
    }
};