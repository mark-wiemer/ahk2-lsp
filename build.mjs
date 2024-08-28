import { build } from 'esbuild';
import path from 'path';

const isProd = process.argv.indexOf('--mode=production') >= 0;

// Node server
// https://esbuild.github.io/api
build({
	entryPoints: [path.join('./server/src/server.ts')],
	bundle: true,
	outfile: path.join('./server/dist/server.js'),
	external: ['vscode'],
	format: 'cjs',
	platform: 'node',
	minify: isProd,
	sourcemap: !isProd,
});
