import * as assert from 'assert';
import { LanguageClient } from 'vscode-languageclient/node';
import { getClient } from './utils';
import { before, test } from 'mocha';

let client: LanguageClient;
before(async () => {
	client = (await getClient()) as LanguageClient;
});

test.only('should be running', () => {
	assert.equal(client?.isRunning(), true);
});
