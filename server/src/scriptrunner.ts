import { execSync, spawnSync } from 'child_process';
import { interpreterPath } from './common';
import { lstatSync, readlinkSync } from 'fs';
import { resolve } from 'path';

/**
 * Simple runner for LSP server initializiaton via AHK.
 * Not used for running user-defined scripts.
 */
export function runScript(script: string): string | undefined {
	const funcName = 'runScriptV2';
	const executePath = resolvePath(interpreterPath, true);
	console.log(`${funcName} executePath`, executePath);
	if (!executePath)
		return;
	// CP65001 is UTF-8, ref https://www.autohotkey.com/docs/v1/lib/FileEncoding.htm
	const process = spawnSync(`"${executePath}" /CP65001 /ErrorStdOut=utf-8 *`, [], { cwd: executePath.replace(/[\\/].+?$/, ''), shell: true, input: script });
	const result = (process?.stdout ?? '').toString();
	console.log(`${funcName} result`, result)
	if (process)
		return result;
}

export function existsSync(path: string): boolean {
	try {
		lstatSync(path);
	} catch (err) {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		if ((err as any)?.code === 'ENOENT')
			return false;
	}
	return true;
}

/**
 * Resolves the provided path.
 * If the path is empty, undefined, or not found, returns an empty string.
 */
export function resolvePath(path: string | undefined, resolveSymbolicLink = false): string {
	if (!path)
		return '';
	const paths: string[] = [];
	if (!path.includes(':'))
		paths.push(resolve(path));
	if (!process.env.BROWSER && process.platform === 'win32' && !/[\\/]/.test(path))
		paths.push(execSync(`where ${path}`, { encoding: 'utf-8' }).trim());
	paths.push(path);
	for (let path of paths) {
		if (!path) continue;
		try {
			if (lstatSync(path).isSymbolicLink() && resolveSymbolicLink)
				path = resolve(path, '..', readlinkSync(path));
			return path;
		} catch {
			continue;
		}
	}
	return '';
}