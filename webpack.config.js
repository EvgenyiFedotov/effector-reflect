const path = require('path');

module.exports = {
  context: path.resolve(__dirname, 'src'),
  entry: { 'no-ssr': './no-ssr/index.ts', ssr: './ssr/index.ts' },
  output: {
    library: 'effector-reflect',
    libraryTarget: 'umd',
    filename: './[name]/index.js',
    path: path.resolve(__dirname, 'dist'),
  },
  resolve: {
    modules: ['node_modules', path.resolve(__dirname, 'src')],
    extensions: ['.js', '.ts', '.json'],
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        use: ['babel-loader', 'ts-loader'],
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
      },
    ],
  },
  externals: {
    react: 'react',
    'react-dom': 'react-dom',
    effector: 'effector',
    'effector-react': 'effector-react',
  },
};
