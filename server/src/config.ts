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
