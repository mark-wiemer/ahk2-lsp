import { CfgKey, getCfg } from './config';

// ref https://learn.microsoft.com/en-us/dotnet/api/microsoft.extensions.logging.loglevel
enum LogLevel {
	Trace = 0,
	Debug = 1,
	Info = 2,
	Warn = 3,
	Error = 4,
	Critical = 5,
	None = 6,
}

const logLevelRecord: Record<string, LogLevel | undefined> = {
	trace: LogLevel.Trace,
	debug: LogLevel.Debug,
	info: LogLevel.Info,
	warn: LogLevel.Warn,
	error: LogLevel.Error,
	critical: LogLevel.Critical,
	none: LogLevel.None,
};

/**
 * Logs message if provided log level is valid for configured log level.
 * Logs warning if configured log level is invalid.
 */
const log = (
	value: Error | string,
	thisLogLevel: LogLevel,
	logFunc: (val: string) => void,
) => {
	const configLogLevelStr = getCfg<string>(CfgKey.LogLevel);
	const configLogLevelValue = logLevelRecord[configLogLevelStr];
	if (configLogLevelValue === undefined || configLogLevelValue === LogLevel.None) {
		return;
	}
	if (thisLogLevel >= configLogLevelValue) {
		logFunc(value.toString());
	}
};

export const trace = (
	value: Error | string,
	logFunc: (val: string) => void = console.log,
) => log(value, LogLevel.Trace, logFunc);
export const debug = (
	value: Error | string,
	logFunc: (val: string) => void = console.log,
) => log(value, LogLevel.Debug, logFunc);
export const info = (
	value: Error | string,
	logFunc: (val: string) => void = console.log,
) => log(value, LogLevel.Info, logFunc);
export const warn = (
	value: Error | string,
	logFunc: (val: string) => void = console.log,
) => log(value, LogLevel.Warn, logFunc);
export const error = (
	value: Error | string,
	logFunc: (val: string) => void = console.log,
) => log(value, LogLevel.Error, logFunc);
export const critical = (
	value: Error | string,
	logFunc: (val: string) => void = console.log,
) => log(value, LogLevel.Critical, logFunc);
