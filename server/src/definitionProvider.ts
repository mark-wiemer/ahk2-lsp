import {
    DefinitionParams,
    Definition,
    LocationLink,
    DocumentSymbol,
    SymbolKind,
    Range,
    CancellationToken,
} from 'vscode-languageserver';
import { reset_detect_cache, detectExpType, searchNode } from './Lexer';
import { lexers, restorePath } from './common';
import { URI } from 'vscode-uri';

export async function defintionProvider(
    params: DefinitionParams,
    token: CancellationToken,
): Promise<Definition | LocationLink[] | undefined> {
    if (token.isCancellationRequested) {
        return;
    }
    const uri = params.textDocument.uri.toLowerCase();
    const doc = lexers[uri];
    const context = doc?.buildContext(params.position);
    let m: any;
    let nodes: [{ node: DocumentSymbol; uri: string }] | undefined | null;
    const locas: LocationLink[] = [];
    if (!context?.token) {
        return;
    }
    let word = '';
    let kind: SymbolKind;
    if (!context.token.type) {
        const tk = context.token.previous_token;
        if (tk?.content.match(/^#include/i)) {
            const line = params.position.line;
            let character = context.linetext.indexOf('#');
            const d = tk.data,
                p = d?.data as string[];
            if (p) {
                character += d.offset - tk.offset;
                const rg = Range.create(
                    0,
                    0,
                    lexers[p[1]]?.document.lineCount ?? 0,
                    0,
                );
                const end = character + d.content.length;
                const uri = p[0]
                    ? URI.file(restorePath(p[0].replace(/`;/g, ';'))).toString()
                    : p[1];
                return [
                    LocationLink.create(
                        uri,
                        rg,
                        rg,
                        Range.create(line, character, line, end),
                    ),
                ];
            }
        }
        return undefined;
    } else {
        (word = context.text.toLowerCase()), (kind = context.kind);
    }
    if (!word || kind === SymbolKind.Null) {
        return undefined;
    } else if (
        undefined ===
            (nodes = searchNode(doc, word, context.range.end, kind)) &&
        (kind == SymbolKind.Property || kind === SymbolKind.Method)
    ) {
        const ts: any = {};
        (nodes = <any>[]),
            reset_detect_cache(),
            detectExpType(
                doc,
                word.replace(/\.[^.]+$/, (m) => {
                    word = m.match(/^\.[^.]+$/) ? m : '';
                    return '';
                }),
                params.position,
                ts,
            );
        if (word && ts['#any'] === undefined) {
            for (const tp in ts) {
                searchNode(doc, tp + word, context.range.end, kind)?.forEach(
                    (it) => {
                        if (!nodes?.map((i) => i.node).includes(it.node)) {
                            nodes?.push(it);
                        }
                    },
                );
            }
        }
        if (!nodes?.length && kind === SymbolKind.Method) {
            nodes = <any>[];
            const docs = [doc];
            word.replace(/\.([^.]+)$/, (...m) => {
                word = m[1];
                for (const u in doc.relevance) {
                    docs.push(lexers[u]);
                }
                for (const doc of docs) {
                    if (doc.object.method[word]?.length) {
                        nodes?.push(
                            ...doc.object.method[word].map((it) => ({
                                node: it,
                                uri: doc.uri,
                            })),
                        );
                    }
                }
                return '';
            });
        }
    } else if (nodes === null) {
        return undefined;
    }
    if (nodes) {
        let uri = '';
        nodes.forEach((it) => {
            if (
                it.node.selectionRange.end.character &&
                (uri = (<any>it.node).uri || it.uri)
            ) {
                locas.push(
                    LocationLink.create(
                        lexers[uri].document.uri,
                        it.node.range,
                        it.node.selectionRange,
                    ),
                );
            }
        });
        if (locas.length) {
            return locas;
        }
    }
}
