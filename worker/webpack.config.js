const path = require('path');
const WorkerPlugin = require('worker-plugin');

module.exports = {
  entry: {
    index: './src/index.js',
    interval: './src/interval.worker.js',
  },
  output: {
    path: path.resolve(__dirname, '../public'),
    filename: '[name].worker.js',
  },
  plugins: [
    new WorkerPlugin(),
  ],
  mode: 'production',
};
