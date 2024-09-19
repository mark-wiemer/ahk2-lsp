// Very similar to ahk2/server/src/config.ts
// todo dedupe config.ts

import * as vscode from 'vscode';

/** Defined in package.json */
export type ActionType =
	| 'Continue'
	| 'Warn'
	| 'SkipLine'
	| 'SwitchToV1'
	| 'Stop';

/** Defined in package.json */
export enum ObjectOrArrayStyle {
	Collapse = 'collapse',
	Expand = 'expand',
	None = 'none',
}

/** Defined in package.json */
export enum BraceStyle {
	OneTrueBrace = 'One True Brace',
	Allman = 'Allman',
	OneTrueBraceVariant = 'One True Brace Variant',
}

export interface FormatterConfig {
	arrayStyle: ObjectOrArrayStyle;
	braceStyle: BraceStyle;
	breakChainedMethods: boolean;
	ignoreComment: boolean;
	indentString: string;
	indentBetweenHotIfDirectives: boolean;
	keywordStartWithUppercase: boolean;
	maxPreserveNewlines: number;
	objectStyle: ObjectOrArrayStyle;
	preserveNewlines: boolean;
	spaceBeforeConditional: boolean;
	spaceAfterDoubleColon: boolean;
	spaceInEmptyParen: boolean;
	spaceInOther: boolean;
	spaceInParen: boolean;
	switchCaseAlignment: boolean;
	symbolWithSameCase: boolean;
	whitespaceBeforeInlineComment: string;
	wrapLineLength: number;
}

/** Defined in package.json */
export enum LibrarySuggestions {
	Off = 'Off',
	Local = 'Local',
	UserAndStandard = 'User and Standard',
	All = 'All',
}

/** Defined in package.json */
export enum CallWithoutParentheses {
	Off = 'Off',
	Parentheses = 'Parentheses',
	On = 'On',
}

export enum CfgKey {
	ActionWhenV1Detected = 'v2.general.actionWhenV1Detected',
	CallWithoutParentheses = 'v2.warn.callWithoutParentheses',
	ClassNonDynamicMemberCheck = 'v2.diagnostics.classNonDynamicMemberCheck',
	CommentTagRegex = 'v2.general.commentTagRegex',
	CompleteFunctionCalls = 'v2.general.completeFunctionCalls',
	CompletionCommitCharacters = 'v2.completionCommitCharacters',
	Exclude = 'v2.exclude',
	Formatter = 'v2.formatter',
	InterpreterPathV2 = 'v2.file.interpreterPath',
	InterpreterPathV1 = 'v1.file.interpreterPath',
	LibrarySuggestions = 'v2.general.librarySuggestions',
	LocalSameAsGlobal = 'v2.warn.localSameAsGlobal',
	MaxScanDepth = 'v2.file.maxScanDepth',
	ParamsCheck = 'v2.diagnostics.paramsCheck',
	ShowOutputView = 'general.showOutputView',
	SymbolFoldingFromOpenBrace = 'v2.general.symbolFoldingFromOpenBrace',
	Syntaxes = 'v2.general.syntaxes',
	VarUnset = 'v2.warn.varUnset',
	WorkingDirectories = 'v2.workingDirectories', // still used directly in some places
}

export interface CompletionCommitCharacters {
	Class: string;
	Function: string;
}

/** Defined in package.json */
export interface AhkppConfig {
	general: {
		showOutputView: boolean;
	};
	v2: {
		general: {
			actionWhenV1Detected: ActionType;
			/** The regex denoting a custom symbol. Defaults to `;;` */
			commentTagRegex?: string;
			/** Automatically insert parentheses on function call */
			completeFunctionCalls: boolean;
			/** Suggest library functions */
			librarySuggestions: LibrarySuggestions;
			symbolFoldingFromOpenBrace: boolean;
			syntaxes: string;
		};
		completionCommitCharacters: CompletionCommitCharacters;
		diagnostics: {
			classNonDynamicMemberCheck: boolean;
			paramsCheck: boolean;
		};
		/** Glob pattern of files to ignore */
		exclude: string[];
		file: {
			/** Path to the AHK v2 intepreter */
			interpreterPath: string;
			/** Depth of folders to scan for IntelliSense */
			maxScanDepth: number;
		};
		/** Config of the v2 formatter */
		formatter: FormatterConfig;
		warn: {
			/** Ref to a potentially-unset variable */
			varUnset: boolean;
			/** Undeclared local has same name as global */
			localSameAsGlobal: boolean;
			/** Function call without parentheses */
			callWithoutParentheses: CallWithoutParentheses;
		};
		/** Directories containing AHK files that can be #included */
		workingDirectories: string[];
	};
	locale?: string;
	commands?: string[];
	extensionUri?: string;
	GlobalStorage?: string;
}

/**
 * Returns a formatter config built from the given config and defaults.
 * Defaults defined in package.json
 */
export const newFormatterConfig = (
	config: Partial<FormatterConfig> = {},
): FormatterConfig => ({
	arrayStyle: ObjectOrArrayStyle.None,
	braceStyle: BraceStyle.OneTrueBrace,
	breakChainedMethods: false,
	ignoreComment: false,
	indentString: '    ',
	indentBetweenHotIfDirectives: false,
	keywordStartWithUppercase: false,
	maxPreserveNewlines: 2,
	objectStyle: ObjectOrArrayStyle.None,
	preserveNewlines: true,
	spaceBeforeConditional: true,
	spaceAfterDoubleColon: true,
	spaceInEmptyParen: false,
	spaceInOther: true,
	spaceInParen: false,
	switchCaseAlignment: false,
	symbolWithSameCase: false,
	whitespaceBeforeInlineComment: '',
	wrapLineLength: 120,
	...config,
});

/** Defaults according to package.json */
export const newAhkppConfig = (
	config: Partial<AhkppConfig> = {},
): AhkppConfig => ({
	general: {
		showOutputView: true,
	},
	v2: {
		general: {
			actionWhenV1Detected: 'SwitchToV1',
			commentTagRegex: '^;;\\s*(.*)',
			completeFunctionCalls: false,
			librarySuggestions: LibrarySuggestions.Off,
			symbolFoldingFromOpenBrace: false,
			syntaxes: '',
		},
		completionCommitCharacters: {
			Class: '.(',
			Function: '(',
		},
		diagnostics: {
			classNonDynamicMemberCheck: true,
			paramsCheck: true,
		},
		exclude: [],
		file: {
			interpreterPath:
				'C:\\Program Files\\AutoHotkey\\v2\\AutoHotkey.exe',
			maxScanDepth: 2,
		},
		formatter: newFormatterConfig(),
		warn: {
			varUnset: true,
			localSameAsGlobal: false,
			callWithoutParentheses: CallWithoutParentheses.Off,
		},
		workingDirectories: [],
	},
	...config,
});

/** Gets a single config value from the given config */
export const getCfg = <T>(key: CfgKey): T | undefined => {
	return (
		vscode.workspace.getConfiguration('ahk++').get<T>(key) ??
		vscode.workspace.getConfiguration('AHK++').get<T>(key)
	);
};
