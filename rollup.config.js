import nodeResolve from 'rollup-plugin-node-resolve';
import buble from 'rollup-plugin-buble';
import { uglify } from 'rollup-plugin-uglify';
import es3 from 'rollup-plugin-es3';
import svgi from 'rollup-plugin-svgi';

export default {
	input: 'app/index.js',
	output: {
		file: 'public/bundle.js',
		format: 'iife'
	},
	external: [],
	plugins: [
		svgi({
			options: {
				jsx: 'preact',
			}
		}),
		buble({
			jsx: 'h',
			objectAssign: 'Object.assign',
			transforms: { asyncAwait: false }
		}),
		nodeResolve({
			modules: true,
			jsnext: true
		}),
		// uglify({
		// 	output: { comments: false },
		// 	mangle: {
		// 		toplevel: true,
		// 		properties: { regex: /^_/ }
		// 	}
		// }),
		es3()
	]
};