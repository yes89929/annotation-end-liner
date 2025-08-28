import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
    const formatCommand = vscode.commands.registerCommand('annotationEndLiner.format', () => {
        const editor = vscode.window.activeTextEditor;
        if (editor) {
            const edits = provideEdits(editor.document);
            const workspaceEdit = new vscode.WorkspaceEdit();
            edits.forEach(edit => workspaceEdit.replace(editor.document.uri, edit.range, edit.newText));
            vscode.workspace.applyEdit(workspaceEdit);
        }
    });
    context.subscriptions.push(formatCommand);

    const languages = ['plaintext', 'markdown', 'javascript', 'typescript', 'python', 'java', 'c', 'cpp'];
    languages.forEach(lang => {
        const provider = vscode.languages.registerDocumentFormattingEditProvider({ language: lang, scheme: 'file' }, {
            provideDocumentFormattingEdits(document: vscode.TextDocument): vscode.TextEdit[] {
                return provideEdits(document);
            }
        });
        context.subscriptions.push(provider);
    });
}

export function deactivate() {}

function provideEdits(document: vscode.TextDocument): vscode.TextEdit[] {
    const config = vscode.workspace.getConfiguration('annotationEndLiner');
    // package.json의 default 값을 사용
    const markerLengths = config.get<{ [key: string]: number }>('markerLengths')!;
    // 한글 너비 비율은 package.json default에서 가져옵니다
    const charWidths = config.get<{ default: number; korean: number }>('charWidths')!;
    const edits: vscode.TextEdit[] = [];
    for (let i = 0; i < document.lineCount; i++) {
        const line = document.lineAt(i);
        const text = line.text;
        const match = /(.*?)([-=#])\2{2,}\s*$/.exec(text);
        if (match) {
            const prefix = match[1];
            const markerChar = match[2];
            const existing = match[0].slice(prefix.length).trim().length;
            const prefixWidth = computeWidth(prefix, charWidths);
            const targetLength = markerLengths[markerChar];
            const targetCount = Math.max(0, Math.floor(targetLength - prefixWidth));
            if (targetCount !== existing) {
                const newMarker = markerChar.repeat(targetCount);
                const startPos = new vscode.Position(i, prefix.length);
                const endPos = line.range.end;
                edits.push(vscode.TextEdit.replace(new vscode.Range(startPos, endPos), newMarker));
            }
        }
    }
    return edits;
}

function computeWidth(text: string, charWidths: { default: number; korean: number }): number {
    let width = 0;
    for (const ch of text) {
            const code = ch.charCodeAt(0);
            if (code <= 0x007F) {
                // ASCII and symbols
                width += charWidths.default;
            } else {
                // Non-ASCII characters (e.g., Korean)
                width += charWidths.korean;
            }
    }
    return width;
}
