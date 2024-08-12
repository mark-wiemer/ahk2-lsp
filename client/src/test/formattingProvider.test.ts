import { convertPosition, getDocument, sleep } from '../test/utils';
import * as assert from 'assert';
import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';
import { documentFormatting } from '../../../server/src/formattingProvider';

const inFilenameSuffix = '.in.ahk2';
const outFilenameSuffix = '.out.ahk2';
interface FormatTest {
	/** Name of the file, excluding the suffix (@see inFilenameSuffix, @see outFilenameSuffix) */
	filenameRoot: string;
}

// Currently in `out` folder, need to get back to main `src` folder
const filesParentPath = path.join(
	__dirname, // client/dist/client/src/test
	'..', // client/dist/client/src
	'..', // client/dist/client
	'..', // client/dist
	'..', // client
	'src', // client/src
	'test', // client/src/test
	'samples', // client/src/test/samples
);

suite('External formatter', () => {
	const externalFormatTests: FormatTest[] = [{ filenameRoot: '0-format' }];

	externalFormatTests.forEach((formatTest) => {
		test(`${formatTest.filenameRoot} external format`, async function () {
			// Arrange
			this.timeout(10_000);
			const inFilename = formatTest.filenameRoot + inFilenameSuffix;
			const outFilename = formatTest.filenameRoot + outFilenameSuffix;
			const outFileString = fs
				.readFileSync(path.join(filesParentPath, outFilename))
				.toString();
			const unformattedSampleFile = await getDocument(
				path.join(filesParentPath, inFilename),
			);
			const originalText = unformattedSampleFile.getText();
			const textEditor = await vscode.window.showTextDocument(
				unformattedSampleFile,
			);

			// Act with vscode.commands
			const extension = vscode.extensions.getExtension(
				'thqby.vscode-autohotkey2-lsp',
			);
			if (extension) {
				await extension.activate();
				await sleep(1000);
			}
			const formattingPromise = new Promise<void>((resolve, reject) => {
				const disposable = vscode.workspace.onDidChangeTextDocument(
					(event) => {
						console.log('onDidChangeTextDocument event fired');
						if (event.document === textEditor.document) {
							console.log('Document matched, resolving promise');
							disposable.dispose();
							resolve();
						}
					},
				);
				vscode.commands
					.executeCommand('editor.action.formatDocument')
					.then(
						() => {
							console.log('Format document command executed');
						},
						(err) => {
							console.error(
								'Error executing format document command',
								err,
							);
							reject(err);
						},
					);
			});

			await formattingPromise;

			// Act with custom code
			// this requires a lexer to be created
			// which requires the extension to be activated
			// which requires the compile step to have worked
			// which overwrites the output of the test compile step
			// and the two are difficult to make compatible because of the extension development path
			// const edits = await documentFormatting({
			// 	textDocument: { uri: unformattedSampleFile.uri.toString() },
			// 	options: { tabSize: 4, insertSpaces: false },
			// });
			// // editing the file also saves the file, so we'll need to teardown
			// await textEditor.edit((editBuilder) => {
			// 	edits.forEach((edit) =>
			// 		editBuilder.replace(
			// 			new vscode.Range(
			// 				convertPosition(edit.range.start),
			// 				convertPosition(edit.range.end),
			// 			),
			// 			edit.newText,
			// 		),
			// 	);
			// });

			// Assert
			assert.strictEqual(textEditor.document.getText(), outFileString);

			// Teardown - revert the file to its original state
			const lastLineIndex = unformattedSampleFile.lineCount - 1;
			const lastLineLength =
				unformattedSampleFile.lineAt(lastLineIndex).text.length;
			const fullDocumentRange = unformattedSampleFile.validateRange(
				new vscode.Range(
					new vscode.Position(0, 0),
					new vscode.Position(lastLineIndex + 1, lastLineLength + 1), // + 1 to ensure full coverage
				),
			);

			// editing the file also saves the file
			await textEditor.edit((editBuilder) =>
				editBuilder.replace(fullDocumentRange, originalText),
			);

			// Close opened file
			await vscode.commands.executeCommand(
				'workbench.action.closeActiveEditor',
			);
		});
	});
});
