import { resolve } from 'path';

/** The regular expressions to check for exclusion */
export interface ScanExclude {
	file: RegExp[];
	folder: RegExp[];
}

export const globalScanExclude: ScanExclude = { file: [], folder: [] };

/**
 * Resolves the provided path and
 * returns whether it should be excluded from scanning based on its name.
 */
export const shouldExclude = (
	path: string,
	/** Folder only will check only the folder patterns in the provided exclude object */
	options: 'folderOnly' | 'all' = 'all',
	/** The patterns to use for exclusion testing. Defaults to global patterns, matching user settings */
	exclude: ScanExclude = globalScanExclude,
): boolean => {
	const resolvedPath = resolve(path);
	if (exclude.folder.some((re) => re.test(resolvedPath))) {
		return true;
	}
	if (options === 'all' && exclude.file.some((re) => re.test(resolvedPath))) {
		return true;
	}
	return false;
};
