import resolve from '@rollup/plugin-node-resolve'
import filesize from 'rollup-plugin-filesize'
import buble from 'rollup-plugin-buble'
import svgi from 'rollup-plugin-svgi'
import { terser } from 'rollup-plugin-terser'

const {
  DEV = false,
  PROD = false
} = process.env

export default {
  input: 'app/index.js',
  output: {
    file: 'public/bundle.js',
    format: 'esm',
    sourcemap: true
  },
  plugins: [
    svgi({
      options: {
        jsx: 'preact'
      }
    }),
    buble({
      jsx: 'h',
      objectAssign: 'Object.assign',
      transforms: { asyncAwait: false }
    }),
    resolve(),
    PROD && terser(),
    PROD && filesize({
      showMinifiedSize: false,
      showGzippedSize: false
    })
  ]
}
