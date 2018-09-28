import typescript from 'rollup-plugin-typescript';
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import path from 'path';

const packageJson = require('./package.json');
const dependencies = [
  ...Object.keys(packageJson.dependencies),
  ...Object.keys(packageJson.peerDependencies),
];
const configurations = [
  { module: 'esm', target: 'es5' },
  { module: 'esm', target: 'es2015' },
  { module: 'cjs', target: 'es5' },
  { module: 'cjs', target: 'es2015' },
];

export default configurations.map(({ module, target }) => ({
  input: path.resolve(__dirname, 'src', 'index.ts'),
  output: {
    file: path.resolve(__dirname, 'dist', `${module}${target.replace(/^es/, '')}.js`),
    format: module,
    sourcemap: true,
  },
  plugins: [
    resolve(),
    commonjs(),
    typescript({
      target,
    }),
  ],
  external: module === 'umd' ? [] : id => dependencies.includes(id)
    || /\/lodash-es\//.test(id)
    || /\/neo4j-driver\//.test(id),
}));
