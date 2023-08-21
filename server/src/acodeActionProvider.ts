import { readdirSync } from 'fs';
import {
    CancellationToken,
    CodeAction,
    CodeActionKind,
    CodeActionParams,
    TextEdit,
} from 'vscode-languageserver';
import { codeaction, diagnostic } from './localize';
import { Maybe, lexers, restorePath } from './common';

export async function codeActionProvider(
    params: CodeActionParams,
    token: CancellationToken,
): Promise<Maybe<CodeAction[]>> {
    const uri = params.textDocument.uri,
        doc = lexers[uri.toLowerCase()];
    if (!doc || token.isCancellationRequested) {
        return;
    }
    let rg = new RegExp(
            '^' + diagnostic.filenotexist().replace('{0}', '(.+?)\\*(\\.\\w+)'),
        ),
        t: RegExpExecArray | null,
        r = '';
    const matchexpr = new RegExp(
        `${diagnostic.unexpected('(.+)')}, ${diagnostic
            .didyoumean(':=')
            .toLowerCase()}`.replace('?', '\\?') +
            '$|^' +
            diagnostic.deprecated('([^\'"]+)', '([^\'"]+)'),
    );
    const acts: CodeAction[] = [],
        replaces: { [k: string]: TextEdit[] } = {};
    for (const it of doc.diagnostics) {
        if ((t = matchexpr.exec(it.message))) {
            (replaces[
                t[3] ? `${t[3]} ${(r = t[2])}` : `${t[1]} ${(r = ':=')}`
            ] ??= []).push({ range: it.range, newText: r });
        } else if ((t = rg.exec(it.message))) {
            r = doc.document.getText(it.range);
            const path = restorePath(t[1]),
                reg = new RegExp(t[2] + '$', 'i'),
                includes = [];
            const rg = Object.assign({}, it.range);
            (rg.start = Object.assign({}, rg.start)), (rg.start.character = 0);
            for (const it of readdirSync(path)) {
                try {
                    if (reg.test(it)) {
                        includes.push(`#Include '${path}${it}'`);
                    }
                } catch {}
            }
            const textEdit: TextEdit = {
                range: rg,
                newText: includes.join('\n'),
            };
            const act: CodeAction = {
                title: codeaction.include(path + '*' + t[2]),
                kind: CodeActionKind.QuickFix,
            };
            act.edit = { changes: { [uri]: [textEdit] } };
            acts.push(act);
        }
    }
    for (const [k, v] of Object.entries(replaces)) {
        acts.push({
            title: k.replace(/(\S+) (\S+)/, "Replace '$1' with '$2'"),
            edit: { changes: { [uri]: v } },
            kind: CodeActionKind.QuickFix,
        });
    }
    return acts.length ? acts : undefined;
}
