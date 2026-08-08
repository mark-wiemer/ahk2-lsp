// https://github.com/microsoft/vscode-test-cli
import { defineConfig } from '@vscode/test-cli';
import { execFileSync } from 'child_process';
import { existsSync } from 'fs';
import { join } from 'path';

function findVSCodePath() {
	const installPaths = [
		process.env.VSCODE_EXEC_PATH,
		process.env.LOCALAPPDATA &&
			join(
				process.env.LOCALAPPDATA,
				'Programs',
				'Microsoft VS Code',
				'Code.exe',
			),
	];
	const installPath = installPaths.find(
		(path) => typeof path === 'string' && existsSync(path),
	);
	if (installPath) return installPath;

	if (process.platform !== 'win32') return undefined;

	try {
		const match = execFileSync(
			'reg.exe',
			['query', 'HKCR\\vscode\\shell\\open\\command'],
			{ encoding: 'utf8' },
		).match(/REG_SZ\s+("([^"]+)"|\S+)/);
		const registryPath = match?.[2] || match?.[1];
		return registryPath && existsSync(registryPath) ? registryPath : undefined;
	} catch {
		return undefined;
	}
}

const vscodePath = findVSCodePath();

export default defineConfig({
	files: 'client/dist/test/**/*.e2e.js',
	workspaceFolder: 'e2e',
	mocha: {
		failZero: true,
		timeout: 60_000,
	},
	useInstallation: vscodePath && {
		fromPath: vscodePath,
	},
});
