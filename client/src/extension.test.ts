import { expect, test, describe, vi, beforeAll, afterAll } from 'vitest';
import { resolvePath } from './utils';

describe('resolvePath', () => {
	beforeAll(() => {
		// Mock the behavior of fs.lstatSync
		vi.mock('fs', () => ({
			lstatSync: (_path: string) => ({ isSymbolicLink: () => false }),
		}));
	});

	afterAll(() => {
		vi.restoreAllMocks();
	});

	test.concurrent.each([
		['', ''],
		['C:/out.txt', 'C:/out.txt'],
	])('("%s") -> "%s"', (input, expected) => {
		const result = resolvePath(input);
		expect(result).toBe(expected);
	});
});
